import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Stars, PerspectiveCamera, Html } from "@react-three/drei";
import { FlagSystem } from "./FlagSystem";
import { useGameStore } from "../../store/gameStore";
import * as THREE from "three";

interface PreIntroEffectProps {
  leftHand?: any;
  rightHand?: any;
  gestureLeft?: string;
  gestureRight?: string;
}

const PreIntroEffect: React.FC<PreIntroEffectProps> = ({
  leftHand,
  rightHand,
}) => {
  // Restore missing state variables
  const groupRef = useRef<THREE.Group>(null);
  const { setGameState } = useGameStore();
  const [showButton, setShowButton] = useState(false);
  const [gestureDistance, setGestureDistance] = useState(0.5);
  const [hasHands, setHasHands] = useState(false);

  // Hand Cursor State for visual feedback
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);

  // Expansion Hold State
  const [expansionHoldTime, setExpansionHoldTime] = useState(0);
  const expansionTargetTime = 3; // Seconds to hold (Increased from 1.5s)

  // Target distance for smoothing
  const targetDistance = useRef(0.5);

  // Swipe detection refs
  const leftHandHistory = useRef<{ x: number; time: number }[]>([]);
  const rightHandHistory = useRef<{ x: number; time: number }[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);

  const detectSwipe = (
    hand: any,
    historyRef: React.MutableRefObject<{ x: number; time: number }[]>
  ) => {
    if (!hand || !hand[0]) return false;

    const now = Date.now();
    const currentX = hand[0].x; // Wrist position

    // Add to history
    historyRef.current.push({ x: currentX, time: now });

    // Remove old history (> 1000ms - Increased to 1s to catch slower swipes)
    const timeThreshold = 1000;
    historyRef.current = historyRef.current.filter(
      (h) => now - h.time < timeThreshold
    );

    if (historyRef.current.length < 5) return false; // Need a bit more data points

    // Check displacement
    const start = historyRef.current[0];
    const end = historyRef.current[historyRef.current.length - 1];

    // Calculate velocity/consistency could be better, but displacement is simple
    const displacement = end.x - start.x;

    // Threshold for swipe (Further decreased to 0.1 for better sensitivity)
    const swipeThreshold = 0.1;

    if (Math.abs(displacement) > swipeThreshold) {
      // Clear history
      historyRef.current = [];
      return true;
    }
    return false;
  };

  // Check for swipes and update cursor
  useEffect(() => {
    let swipeDetected = false;
    let activeHand = null;

    if (leftHand) {
      if (detectSwipe(leftHand, leftHandHistory)) swipeDetected = true;
      activeHand = leftHand[0];
    }
    if (rightHand) {
      if (detectSwipe(rightHand, rightHandHistory)) swipeDetected = true;
      activeHand = rightHand[0] || activeHand;
    }

    // Update visual cursor position
    if (activeHand) {
      setCursorPos({ x: activeHand.x * 100, y: activeHand.y * 100 });
    } else {
      setCursorPos(null);
    }

    if (swipeDetected && !isSwiping) {
      setIsSwiping(true);
      handleStart();
    }
  }, [leftHand, rightHand]);

  // Expansion Trigger Logic
  useFrame((state, delta) => {
    if (hasHands && gestureDistance > 0.8) {
      setExpansionHoldTime(prev => {
        const newVal = prev + delta;
        if (newVal >= expansionTargetTime) { // Use showButton as a "started" check or just fire
          handleStart();
          return 0; // Reset
        }
        return newVal;
      });
    } else {
      setExpansionHoldTime(prev => Math.max(0, prev - delta * 2)); // Decay quickly
    }
  });

  // Show button after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate hand tracking distance (same logic as family-builder3d)
  useEffect(() => {
    if (leftHand && rightHand) {
      // Two hands detected - measure distance between wrists
      const hand1Wrist = leftHand[0];
      const hand2Wrist = rightHand[0];

      if (hand1Wrist && hand2Wrist) {
        const rawDist = Math.sqrt(
          Math.pow(hand2Wrist.x - hand1Wrist.x, 2) +
          Math.pow(hand2Wrist.y - hand1Wrist.y, 2)
        );

        // Normalize distance (0.1 to 0.8 range -> 0 to 1)
        const normalizedDist = Math.min(Math.max((rawDist - 0.1) / 0.6, 0), 1);
        targetDistance.current = normalizedDist;
        setHasHands(true);
      }
    } else if (leftHand || rightHand) {
      // One hand detected - detect pinch
      const hand = leftHand || rightHand;
      const thumbTip = hand[4];
      const indexTip = hand[8];

      if (thumbTip && indexTip) {
        const pinchDist = Math.sqrt(
          Math.pow(indexTip.x - thumbTip.x, 2) +
          Math.pow(indexTip.y - thumbTip.y, 2)
        );
        const isPinching = pinchDist < 0.05;

        // SINGLE HAND LOGIC CHANGE:
        // Pinch = 0.2 (Compress)
        // Open = 1.0 (Expand) - This enables 1-hand trigger
        targetDistance.current = isPinching ? 0.2 : 1.0;
        setHasHands(true);
      }
    } else {
      setHasHands(false);
      targetDistance.current = 0.5;
    }
  }, [leftHand, rightHand]);

  // Gentle rotation animation & Smoothing gesture distance
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;

    // Smoothly interpolate gesture distance to avoid instant jumps with single-hand trigger
    setGestureDistance(prev => {
      const next = THREE.MathUtils.lerp(prev, targetDistance.current, 0.05); // 0.05 for smoother/slower transition
      if (Math.abs(next - prev) < 0.0001) return prev;
      return next;
    });
  });

  const handleStart = () => {
    setGameState("INTRO");
  };

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#ffaa00" />
      <pointLight position={[-10, -10, 10]} intensity={2} color="#ff0000" />
      <pointLight position={[0, 0, 20]} intensity={2.5} color="#FFFF00" />

      {/* Background with fog */}
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 30, 80]} />

      {/* Environment - Stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Main Content */}
      <group ref={groupRef}>
        {/* Vietnam Flag Particles */}
        <FlagSystem
          particleCount={20000}
          waveStrength={1.5}
          waveSpeed={0.8}
          pointSize={0.35}
          enableWave={true}
          gestureDistance={gestureDistance}
          hasHands={hasHands}
        />

        {/* Floating Cursor for Hand Tracking Feedack */}
        {cursorPos && (
          <Html style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
            <div style={{
              position: 'fixed',
              left: `${cursorPos.x}vw`,
              top: `${cursorPos.y}vh`,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid #00f3ff',
              boxShadow: '0 0 10px #00f3ff',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }} />
          </Html>
        )}

        {/* Hand Gesture Feedback */}
        {hasHands && (
          <Html center position={[0, -14, 0]}>
            <div
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "10px 20px",
                borderRadius: "15px",
                textAlign: "center",
                minWidth: "200px",
              }}
            >
              <p
                style={{
                  color: "#00f3ff",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  margin: "0 0 5px 0",
                }}
              >
                {gestureDistance < 0.3
                  ? "🤏 COMPRESSING"
                  : gestureDistance > 0.7
                    ? "🙌 EXPANDING"
                    : "✋ HOVERING"}
              </p>

              {/* Instructions */}
              <p style={{
                color: "#FFFF00",
                fontSize: "0.8rem",
                marginTop: "5px",
                marginBottom: "5px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "5px"
              }}>
                👋 SWIPE <span style={{ color: 'white' }}>or</span> ✋ OPEN & HOLD
              </p>

              {/* Expansion Loading Bar */}
              {expansionHoldTime > 0.1 && (
                <div style={{
                  marginTop: '5px',
                  background: 'rgba(255,255,255,0.1)',
                  height: '6px',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(expansionHoldTime / expansionTargetTime, 1) * 100}%`,
                    height: '100%',
                    background: '#00f3ff',
                    transition: 'width 0.1s linear'
                  }} />
                </div>
              )}

              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginTop: "5px" // Added margin
                }}
              >
                <div
                  style={{
                    width: `${gestureDistance * 100}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #DA251D 0%, #FFFF00 100%)",
                    transition: "width 0.1s ease",
                  }}
                />
              </div>
            </div>
          </Html>
        )}

        {/* Interactive Instruction with HTML Button */}
        {showButton && (
          <Html position={[25, 14, 2]}>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={handleStart}
                style={{
                  background:
                    "linear-gradient(135deg, #DA251D 0%, #ff6b6b 100%)",
                  border: "2px solid #FFFF00",
                  color: "#FFFF00",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  padding: "15px 25px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  boxShadow:
                    "0 0 20px rgba(218, 37, 29, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)",
                  transition: "all 0.3s ease",
                  fontFamily: "Arial, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(218, 37, 29, 1), 0 0 60px rgba(255, 255, 0, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(218, 37, 29, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)";
                }}
              >
                ⭐ BẮT ĐẦU ⭐
              </button>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};

export default PreIntroEffect;
