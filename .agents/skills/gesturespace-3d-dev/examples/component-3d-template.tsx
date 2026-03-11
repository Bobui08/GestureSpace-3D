/**
 * TEMPLATE: 3D Component cho GestureSpace-3D
 *
 * Đặt file trong: bridge/components/3d/
 * Component này PHẢI nằm trong <Canvas> (R3F context)
 *
 * Patterns:
 * - Nhận hand data qua props (KHÔNG import useHandTracking trực tiếp)
 * - Dùng useFrame cho animation / collision / logic loop
 * - Smoothing hand position bằng lerp (factor 0.2 - 0.4)
 * - Cleanup bằng isDead state pattern
 */

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

// -- Types --
interface MyComponentProps {
  leftHand: { x: number; y: number; z?: number }[] | null;
  rightHand: { x: number; y: number; z?: number }[] | null;
  gestureLeft: string;
  gestureRight: string;
}

const My3DComponent: React.FC<MyComponentProps> = ({
  leftHand,
  rightHand,
  gestureLeft,
  gestureRight,
}) => {
  // 1. Store hooks — lấy state/actions cần thiết
  const { campaignState, campaignMetrics } = useGameStore();

  // 2. Local state
  const [isActive, setIsActive] = useState(true);

  // 3. Refs — cho THREE objects và smoothed positions
  const meshRef = useRef<THREE.Mesh>(null);
  const handPosRef = useRef(new THREE.Vector3());
  const handTargetRef = useRef(new THREE.Vector3());

  // 4. Memoized calculations
  const color = useMemo(
    () => new THREE.Color(campaignMetrics.control > 50 ? "#00ff88" : "#ff4444"),
    [campaignMetrics.control]
  );

  // 5. Frame loop — ALL animation/collision logic goes here
  useFrame(({ viewport, clock }, delta) => {
    if (!isActive || !meshRef.current) return;

    // Hand-to-world mapping (landmark[8] = index finger tip)
    if (rightHand?.[8]) {
      const x = rightHand[8].x * viewport.width - viewport.width / 2;
      const y = (1 - rightHand[8].y) * viewport.height - viewport.height / 2;
      handTargetRef.current.set(x, y, 0);
    }

    // Smoothed movement
    handPosRef.current.lerp(handTargetRef.current, 0.34);

    // Animation example
    meshRef.current.rotation.y += delta * 0.5;

    // Collision example
    const dist = meshRef.current.position.distanceTo(handPosRef.current);
    if (dist < 1.0 && gestureRight === "PINCH") {
      // Handle interaction
    }
  });

  // 6. Conditional render (die-and-remove pattern)
  if (!isActive) return null;

  // 7. Render
  return (
    <group>
      <mesh ref={meshRef} position={[0, 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

export default My3DComponent;
