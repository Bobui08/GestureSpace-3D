import React from "react";
import { useGameStore } from "../../store/gameStore";
import { STAGE_META } from "../../data/gameData";

const BriefingPanel = () => {
  const {
    campaignState,
    currentStage,
    startCampaignTurn,
  } = useGameStore();

  if (campaignState !== "BRIEFING") return null;

  const stageInfo = STAGE_META[currentStage];

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.badge}>📋 LỆNH HÀNH QUÂN</div>

        <h2 style={s.stageTitle}>
          {stageInfo?.shortTitle} — {stageInfo?.years}
        </h2>

        <div style={s.missionTitle}>{stageInfo?.title}</div>

        <div style={s.briefingText}>
          Hãy lập kế hoạch chiến lược cho giai đoạn này.
          Chọn vùng tác chiến và lệnh chiến lược mỗi lượt để đạt mục tiêu kiểm soát, ủng hộ,
          hậu cần, bảo mật — đồng thời giữ áp lực ở mức thấp.
        </div>

        <div style={s.rulesList}>
          <div style={s.rule}>⏱ 6 lượt mỗi giai đoạn · 30 giây/lượt</div>
          <div style={s.rule}>🧠 Quiz tình báo tại lượt 2, 4, 6</div>
          <div style={s.rule}>⚡ Sự kiện ngẫu nhiên có thể xảy ra</div>
        </div>

        <button onClick={startCampaignTurn} style={s.startBtn}>
          BẮT ĐẦU LƯỢT 1 →
        </button>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 500,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
  },
  card: {
    width: "min(520px, 90vw)",
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(0,243,255,0.25)",
    borderRadius: 20,
    padding: "32px 36px",
    textAlign: "center" as const,
  },
  badge: {
    display: "inline-block",
    padding: "5px 16px",
    fontSize: 12,
    fontWeight: 700,
    color: "#fbbf24",
    background: "rgba(234,179,8,0.1)",
    border: "1px solid rgba(234,179,8,0.3)",
    borderRadius: 999,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 16,
  },
  stageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#f1f5f9",
  },
  missionTitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 20,
  },
  briefingText: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 1.7,
    textAlign: "left" as const,
    marginBottom: 16,
  },
  rulesList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 24,
  },
  rule: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "left" as const,
    padding: "6px 12px",
    background: "rgba(30,41,59,0.5)",
    borderRadius: 8,
  },
  startBtn: {
    padding: "14px 36px",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, rgba(0,243,255,0.2), rgba(46,134,255,0.2))",
    border: "1px solid rgba(0,243,255,0.5)",
    borderRadius: 12,
    cursor: "pointer",
    letterSpacing: 2,
    fontFamily: "inherit",
    transition: "background 0.2s ease",
  },
};

export default BriefingPanel;
