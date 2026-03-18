import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Stars, PerspectiveCamera, Html } from "@react-three/drei";
import { FlagSystem } from "./FlagSystem";
import { useGameStore } from "../../store/gameStore";
import * as THREE from "three";
import type { HandsResultsRef } from "../../hooks/useHandTracking";

interface PreIntroEffectProps {
  handsResultsRef: HandsResultsRef;
}

const PreIntroEffect: React.FC<PreIntroEffectProps> = ({
  handsResultsRef,
}) => {
  // Restore missing state variables
  const groupRef = useRef<THREE.Group>(null);
  const { setGameState } = useGameStore();
  const [gestureDistance, setGestureDistance] = useState(0.5);
  const [hasHands, setHasHands] = useState(false);
  const gestureDistanceRef = useRef(0.5);
  const hasHandsRef = useRef(false);

  // Hand Cursor State for visual feedback
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
  const cursorPosRef = useRef<{ x: number, y: number } | null>(null);

  // Expansion Hold State
  const [expansionHoldTime, setExpansionHoldTime] = useState(0);
  const expansionHoldTimeRef = useRef(0);
  const expansionTargetTime = 3; // Seconds to hold (Increased from 1.5s)

  // Target distance for smoothing
  const targetDistance = useRef(0.5);

  // Swipe detection refs
  const leftHandHistory = useRef<{ x: number; time: number }[]>([]);
  const rightHandHistory = useRef<{ x: number; time: number }[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const isSwipingRef = useRef(false);

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

  // Gentle rotation animation & smoothing without per-frame React rerenders
  useFrame((state, delta) => {
    const { leftHand, rightHand } = handsResultsRef.current;

    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;

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

    if (activeHand) {
      const nextCursor = { x: (1 - activeHand.x) * 100, y: activeHand.y * 100 };
      const currentCursor = cursorPosRef.current;
      if (
        !currentCursor ||
        Math.abs(currentCursor.x - nextCursor.x) > 0.4 ||
        Math.abs(currentCursor.y - nextCursor.y) > 0.4
      ) {
        cursorPosRef.current = nextCursor;
        setCursorPos(nextCursor);
      }
    } else if (cursorPosRef.current !== null) {
      cursorPosRef.current = null;
      setCursorPos(null);
    }

    if (swipeDetected && !isSwipingRef.current) {
      isSwipingRef.current = true;
      setIsSwiping(true);
      handleStart();
    }

    if (leftHand && rightHand) {
      const hand1Wrist = leftHand[0];
      const hand2Wrist = rightHand[0];

      if (hand1Wrist && hand2Wrist) {
        const rawDist = Math.sqrt(
          Math.pow(hand2Wrist.x - hand1Wrist.x, 2) +
          Math.pow(hand2Wrist.y - hand1Wrist.y, 2)
        );
        targetDistance.current = Math.min(Math.max((rawDist - 0.1) / 0.6, 0), 1);
        if (!hasHandsRef.current) {
          hasHandsRef.current = true;
          setHasHands(true);
        }
      }
    } else if (leftHand || rightHand) {
      const hand = leftHand || rightHand;
      const thumbTip = hand?.[4];
      const indexTip = hand?.[8];

      if (thumbTip && indexTip) {
        const pinchDist = Math.sqrt(
          Math.pow(indexTip.x - thumbTip.x, 2) +
          Math.pow(indexTip.y - thumbTip.y, 2)
        );
        targetDistance.current = pinchDist < 0.05 ? 0.2 : 1.0;
        if (!hasHandsRef.current) {
          hasHandsRef.current = true;
          setHasHands(true);
        }
      }
    } else {
      targetDistance.current = 0.5;
      if (hasHandsRef.current) {
        hasHandsRef.current = false;
        setHasHands(false);
      }
    }

    const nextGestureDistance = THREE.MathUtils.lerp(gestureDistanceRef.current, targetDistance.current, 0.05);
    if (Math.abs(nextGestureDistance - gestureDistanceRef.current) > 0.003) {
      gestureDistanceRef.current = nextGestureDistance;
      setGestureDistance(nextGestureDistance);
    }

    const shouldCharge = hasHandsRef.current && gestureDistanceRef.current > 0.8;
    const nextHoldTime = shouldCharge
      ? expansionHoldTimeRef.current + delta
      : Math.max(0, expansionHoldTimeRef.current - delta * 2);

    if (nextHoldTime >= expansionTargetTime) {
      expansionHoldTimeRef.current = 0;
      setExpansionHoldTime(0);
      handleStart();
    } else if (Math.abs(nextHoldTime - expansionHoldTimeRef.current) > 0.03) {
      expansionHoldTimeRef.current = nextHoldTime;
      setExpansionHoldTime(nextHoldTime);
    } else {
      expansionHoldTimeRef.current = nextHoldTime;
    }
  });

  useEffect(() => {
    if (!isSwiping) return;

    const timer = setTimeout(() => {
      isSwipingRef.current = false;
      setIsSwiping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [isSwiping]);

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

        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "56px",
              transform: "translateX(-50%)",
              minWidth: "280px",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <button
              onClick={handleStart}
              style={{
                pointerEvents: "auto",
                color: "#fef08a",
                fontSize: "1rem",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textShadow: "0 0 18px rgba(254, 240, 138, 0.55)",
                padding: "12px 26px",
                borderRadius: "999px",
                border: "2px solid rgba(254, 240, 138, 0.85)",
                background: "rgba(218, 37, 29, 0.78)",
                boxShadow: "0 0 20px rgba(218, 37, 29, 0.45), 0 0 30px rgba(254, 240, 138, 0.2)",
                cursor: "pointer",
              }}
            >
              BẮT ĐẦU
            </button>
          </div>
        </Html>
      </group>
    </>
  );
};

export default PreIntroEffect;
