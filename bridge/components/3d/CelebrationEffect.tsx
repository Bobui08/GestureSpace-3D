import React from "react";
import { Float, Html, OrbitControls, Text } from "@react-three/drei";
import SocialEnvironment from "./SocialEnvironment";
import { useGameStore } from "../../store/gameStore";

const CelebrationEffect = () => {
  const { score, gameStartTime } = useGameStore();
  const duration = gameStartTime ? Date.now() - gameStartTime : 0;
  const totalSec = Math.floor(duration / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  return (
    <>
      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.4} />
      <SocialEnvironment />

      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.35}>
        <Text
          position={[0, 6.8, 0]}
          fontSize={1.08}
          color="#dcfce7"
          anchorX="center"
          outlineWidth={0.03}
          outlineColor="#052e16"
        >
          CHIEN DICH HOAN THANH
        </Text>
        <Text position={[0, 5.9, 0]} fontSize={0.36} color="#bbf7d0" anchorX="center">
          Mang luoi cach mang da vuot qua 3 giai doan
        </Text>
        <Text position={[0, 5.25, 0]} fontSize={0.3} color="#fef08a" anchorX="center">
          Diem: {score} · Thoi gian: {mins}m {secs}s
        </Text>
      </Float>

      <Html position={[0, 3.2, 0]} center transform>
        <button
          onClick={() => window.location.reload()}
          style={{
            borderRadius: 10,
            border: "1px solid rgba(134, 239, 172, 0.75)",
            background: "rgba(21, 128, 61, 0.82)",
            color: "#f0fdf4",
            padding: "10px 18px",
            fontSize: 15,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          Choi lai
        </button>
      </Html>
    </>
  );
};

export default CelebrationEffect;
