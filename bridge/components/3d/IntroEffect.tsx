import React from "react";
import { Html, OrbitControls } from "@react-three/drei";
import SocialEnvironment from "./SocialEnvironment";
import { useGameStore } from "../../store/gameStore";

const IntroEffect = () => {
  const { startGame } = useGameStore();

  return (
    <>
      <OrbitControls makeDefault enableZoom enablePan enableRotate />
      <SocialEnvironment />

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
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#f8fafc",
            }}
          >
            MẠNG LƯỚI CÁCH MẠNG VIỆT NAM 
          </p>
          <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#bae6fd", lineHeight: 1.5 }}>
            Chủ đề: Sự lãnh đạo của Đảng với cách mạng hai miền (1954-1965)
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
            Kéo node bằng tay trái, node chỉ huy cần 2 tay. Hoàn thành mạng lưới mỗi giai đoạn
            để mở bộ câu hỏi lịch sử.
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
            Bắt đầu chiến dịch
          </button>
        </div>
      </Html>
    </>
  );
};

export default IntroEffect;
