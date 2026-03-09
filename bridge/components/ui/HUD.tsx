import React, { useEffect, useMemo, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { BLOCKS, STAGE_META, STAGES, getImagePath } from "../../data/gameData";

const meterStyle = (value: number, color: string): React.CSSProperties => ({
  width: `${Math.max(0, Math.min(100, value))}%`,
  height: "100%",
  background: color,
  transition: "width 0.25s ease",
});

const HUD = ({ gestureLeft, gestureRight }) => {
  const {
    score,
    currentStage,
    gameState,
    startGame,
    gamePhase,
    defenseTimeLeft,
    gameStartTime,
    placedBlocks,
    influence,
    stability,
    logistics,
    exposure,
    streakCount,
    multiplier,
  } = useGameStore();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!gameStartTime) return;
    const interval = setInterval(() => setElapsed(Date.now() - gameStartTime), 1000);
    return () => clearInterval(interval);
  }, [gameStartTime]);

  const stageInfo = STAGE_META[currentStage] ?? STAGE_META[STAGES.STAGE_1_1954_1960];
  const stageImage = getImagePath(stageInfo.image);

  const stageProgress = useMemo(() => {
    const placedCount = placedBlocks[currentStage]?.length ?? 0;
    const totalCount = BLOCKS[currentStage]?.length ?? 0;
    return { placedCount, totalCount };
  }, [currentStage, placedBlocks]);

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (gameState === "PRE_INTRO" || gameState === "INTRO" || gameState === "WON") return null;

  if (gameState === "GAME_OVER") {
    return (
      <div style={styles.fullscreenOverlay}>
        <div style={styles.gameOverCard}>
          <h1 style={styles.gameOverTitle}>Nhiem vu that bai</h1>
          <p style={styles.gameOverText}>
            Mang luoi bi lo hoac mat on dinh. Hay thu lai voi chien luoc an toan hon.
          </p>
          <p style={styles.gameOverScore}>Diem: {score}</p>
          <button style={styles.retryButton} onClick={startGame}>
            Choi lai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.topRow}>
        <div style={styles.card}>
          <span style={styles.label}>Diem so</span>
          <span style={styles.value}>{score}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.label}>Thoi gian</span>
          <span style={styles.value}>{formatTime(elapsed)}</span>
        </div>
        <div style={styles.stageCard}>
          <div style={styles.stageImageWrap}>
            <img src={stageImage} alt={stageInfo.title} style={styles.stageImage} />
          </div>
          <div style={styles.stageTextWrap}>
            <span style={styles.label}>Giai doan</span>
            <span style={styles.stageName}>{stageInfo.shortTitle}</span>
            <span style={styles.stageSub}>
              {stageInfo.years} · {stageInfo.title}
            </span>
            <span style={styles.progressText}>
              Tien do node: {stageProgress.placedCount}/{stageProgress.totalCount}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <Metric label="Influence" value={influence} color="#24c97a" />
        <Metric label="Stability" value={stability} color="#2e86ff" />
        <Metric label="Logistics" value={logistics} color="#eab308" />
        <Metric label="Exposure" value={exposure} color="#ef4444" inverse />
      </div>

      {gamePhase === "DEFEND" && (
        <div style={styles.defenseBanner}>
          <span style={styles.defenseTitle}>Can quet dang dien ra</span>
          <span style={styles.defenseTime}>Con lai: {defenseTimeLeft}s</span>
        </div>
      )}

      <div style={styles.bottomRow}>
        <div style={styles.gestureItem}>Tay trai: {gestureLeft}</div>
        <div style={styles.gestureItem}>Tay phai: {gestureRight}</div>
        <div style={styles.gestureItem}>
          Streak: {streakCount} {multiplier > 1 ? `· x${multiplier}` : ""}
        </div>
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
  color,
  inverse = false,
}: {
  label: string;
  value: number;
  color: string;
  inverse?: boolean;
}) => (
  <div style={styles.metricCard}>
    <div style={styles.metricHeader}>
      <span>{label}</span>
      <span>{Math.round(value)}</span>
    </div>
    <div style={styles.meterTrack}>
      <div style={meterStyle(inverse ? 100 - value : value, color)} />
    </div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 120,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#f8fafc",
    fontFamily: "Segoe UI, Tahoma, sans-serif",
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "220px 220px minmax(360px, 1fr)",
    gap: 12,
    alignItems: "stretch",
  },
  card: {
    background: "rgba(2, 6, 23, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 14,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#93c5fd",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    color: "#f8fafc",
  },
  stageCard: {
    background: "rgba(2, 6, 23, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 14,
    padding: 10,
    display: "grid",
    gridTemplateColumns: "130px 1fr",
    gap: 12,
    alignItems: "stretch",
  },
  stageImageWrap: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid rgba(148, 163, 184, 0.4)",
  },
  stageImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  stageTextWrap: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 2,
  },
  stageName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#f8fafc",
  },
  stageSub: {
    fontSize: 13,
    color: "#cbd5e1",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: "#67e8f9",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(170px, 1fr))",
    gap: 10,
    alignSelf: "center",
    width: "min(920px, 90vw)",
  },
  metricCard: {
    background: "rgba(2, 6, 23, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 12,
    padding: "10px 12px",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
    color: "#e2e8f0",
  },
  meterTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "rgba(51, 65, 85, 0.9)",
    overflow: "hidden",
  },
  defenseBanner: {
    alignSelf: "center",
    display: "flex",
    gap: 18,
    alignItems: "center",
    background: "rgba(127, 29, 29, 0.86)",
    border: "1px solid rgba(248, 113, 113, 0.6)",
    padding: "10px 18px",
    borderRadius: 999,
    color: "#fee2e2",
  },
  defenseTitle: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  defenseTime: {
    fontSize: 14,
    color: "#fecaca",
  },
  bottomRow: {
    alignSelf: "center",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  gestureItem: {
    background: "rgba(2, 6, 23, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    color: "#dbeafe",
  },
  fullscreenOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "auto",
    zIndex: 400,
    background: "rgba(9, 9, 11, 0.85)",
    backdropFilter: "blur(6px)",
    display: "grid",
    placeItems: "center",
  },
  gameOverCard: {
    width: "min(560px, 90vw)",
    background: "rgba(24, 24, 27, 0.95)",
    border: "1px solid rgba(248, 113, 113, 0.55)",
    borderRadius: 16,
    padding: "28px 26px",
    textAlign: "center",
  },
  gameOverTitle: {
    margin: 0,
    color: "#fca5a5",
    fontSize: 32,
  },
  gameOverText: {
    marginTop: 10,
    marginBottom: 14,
    color: "#fde2e2",
    lineHeight: 1.5,
  },
  gameOverScore: {
    marginBottom: 18,
    fontSize: 20,
    color: "#e2e8f0",
    fontWeight: 700,
  },
  retryButton: {
    border: "1px solid rgba(251, 113, 133, 0.7)",
    background: "rgba(127, 29, 29, 0.75)",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 16,
    cursor: "pointer",
    pointerEvents: "auto",
  },
};

export default HUD;
