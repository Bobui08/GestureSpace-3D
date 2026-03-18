import React from "react";
import { Html, OrbitControls } from "@react-three/drei";
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

      <Html fullscreen>
        <div style={styles.overlay}>
          <div style={styles.panel}>
            <div style={styles.title}>CHIẾN DỊCH HOÀN THÀNH</div>
            <div style={styles.subtitle}>Mạng lưới cách mạng đã vượt qua 3 giai đoạn</div>
            <div style={styles.meta}>
              Điểm: {score} · Thời gian: {mins}m {secs}s
            </div>
            <button onClick={() => window.location.reload()} style={styles.button}>
              Chơi lại
            </button>
          </div>
        </div>
      </Html>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px 16px",
    pointerEvents: "none",
  },
  panel: {
    width: "min(720px, calc(100vw - 32px))",
    borderRadius: 22,
    border: "1px solid rgba(187, 247, 208, 0.72)",
    background:
      "linear-gradient(180deg, rgba(2, 44, 34, 0.94) 0%, rgba(6, 78, 59, 0.9) 52%, rgba(20, 83, 45, 0.92) 100%)",
    boxShadow:
      "0 20px 80px rgba(0, 0, 0, 0.46), 0 0 0 2px rgba(240, 253, 244, 0.08) inset, 0 0 32px rgba(134, 239, 172, 0.22)",
    padding: "22px 24px 18px",
    textAlign: "center",
    color: "#f0fdf4",
    pointerEvents: "none",
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    letterSpacing: "0.08em",
    lineHeight: 1.1,
    color: "#f7fee7",
    textShadow: "0 4px 18px rgba(0, 0, 0, 0.55), 0 0 18px rgba(187, 247, 208, 0.24)",
  },
  subtitle: {
    marginTop: 10,
    fontSize: "clamp(15px, 2vw, 20px)",
    lineHeight: 1.45,
    color: "#dcfce7",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.45)",
  },
  meta: {
    marginTop: 10,
    fontSize: "clamp(14px, 1.8vw, 18px)",
    fontWeight: 700,
    color: "#fef08a",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
  },
  button: {
    marginTop: 18,
    borderRadius: 12,
    border: "1px solid rgba(134, 239, 172, 0.8)",
    background: "rgba(21, 128, 61, 0.92)",
    color: "#f0fdf4",
    padding: "11px 22px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    pointerEvents: "auto",
    boxShadow: "0 10px 24px rgba(20, 83, 45, 0.35)",
  },
};

export default CelebrationEffect;
