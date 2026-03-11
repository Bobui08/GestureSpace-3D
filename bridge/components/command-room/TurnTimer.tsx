import React from "react";
import { useGameStore } from "../../store/gameStore";

const TurnTimer = () => {
  const {
    campaignState,
    turnTimeLeft,
    turnIndex,
    maxTurnsPerStage,
    commandPoints,
  } = useGameStore();

  if (campaignState === "PRE_INTRO" || campaignState === "CAMPAIGN_CLEAR" || campaignState === "GAME_OVER") {
    return null;
  }

  const isPlanning = campaignState === "TURN_PLANNING";
  const timerPct = (turnTimeLeft / 30) * 100;
  const isLow = turnTimeLeft <= 10;

  return (
    <div style={s.root}>
      {/* Timer bar */}
      {isPlanning && (
        <div style={s.timerWrap}>
          <div style={s.timerTrack}>
            <div
              style={{
                height: "100%",
                width: `${timerPct}%`,
                background: isLow
                  ? "linear-gradient(90deg, #ef4444, #fb923c)"
                  : "linear-gradient(90deg, #00f3ff, #2e86ff)",
                borderRadius: 999,
                transition: "width 0.9s linear",
              }}
            />
          </div>
          <span style={{
            ...s.timerText,
            color: isLow ? "#fb7185" : "#00f3ff",
          }}>
            {turnTimeLeft}s
          </span>
        </div>
      )}

      {/* Status strip */}
      <div style={s.strip}>
        <div style={s.stripItem}>
          Lượt {turnIndex}/{maxTurnsPerStage}
        </div>
        <div style={s.stripItem}>
          CP: {commandPoints}
        </div>
        <div style={{
          ...s.stripItem,
          color: isPlanning ? "#00f3ff" : "#94a3b8",
        }}>
          {campaignState === "TURN_PLANNING" && "⏳ Lập kế hoạch"}
          {campaignState === "TURN_RESOLVE" && "⚡ Đang thực thi..."}
          {campaignState === "INTEL_QUIZ" && "🧠 Quiz tình báo"}
          {campaignState === "STAGE_REPORT" && "📊 Báo cáo"}
          {campaignState === "BRIEFING" && "📋 Nhận lệnh"}
          {campaignState === "STAGE_CLEAR" && "✓ Hoàn thành"}
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 250,
  },
  timerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 18px 6px",
  },
  timerTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    background: "rgba(51,65,85,0.7)",
    overflow: "hidden",
  },
  timerText: {
    fontSize: 14,
    fontWeight: 700,
    minWidth: 32,
    textAlign: "right" as const,
  },
  strip: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    padding: "8px 18px 12px",
    background: "rgba(2,6,23,0.85)",
    borderTop: "1px solid rgba(51,65,85,0.4)",
  },
  stripItem: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 600,
  },
};

export default TurnTimer;
