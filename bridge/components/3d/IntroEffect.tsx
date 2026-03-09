import React from "react";
import { Float, Html, OrbitControls, Text } from "@react-three/drei";
import SocialEnvironment from "./SocialEnvironment";
import { useGameStore } from "../../store/gameStore";

const IntroEffect = () => {
  const { startGame } = useGameStore();

  return (
    <>
      <OrbitControls makeDefault enableZoom enablePan enableRotate />
      <SocialEnvironment />

      <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text
          position={[0, 7.4, 0]}
          fontSize={1.05}
          color="#f8fafc"
          anchorX="center"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          REVOLUTION NETWORK
        </Text>
        <Text position={[0, 6.5, 0]} fontSize={0.35} color="#bae6fd" anchorX="center">
          Chu de: Su lanh dao cua Dang voi cach mang hai mien (1954-1965)
        </Text>
      </Float>

      <Html position={[0, 2.2, 0]} center transform>
        <div
          style={{
            width: "min(520px, 85vw)",
            padding: "16px 20px",
            borderRadius: 14,
            border: "1px solid rgba(186, 230, 253, 0.4)",
            background: "rgba(15, 23, 42, 0.78)",
            color: "#e2e8f0",
            textAlign: "center",
            backdropFilter: "blur(6px)",
          }}
        >
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
            Keo node bang tay phai, node chi huy can 2 tay. Hoan thanh mang luoi moi giai doan
            de mo bo cau hoi lich su.
          </p>
          <button
            onClick={startGame}
            style={{
              marginTop: 14,
              borderRadius: 10,
              border: "1px solid rgba(34, 211, 238, 0.65)",
              background: "rgba(14, 116, 144, 0.8)",
              color: "#f0f9ff",
              padding: "10px 18px",
              fontSize: 15,
              cursor: "pointer",
              pointerEvents: "auto",
            }}
          >
            Bat dau chien dich
          </button>
        </div>
      </Html>
    </>
  );
};

export default IntroEffect;
