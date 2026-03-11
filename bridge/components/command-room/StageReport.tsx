import React from "react";
import { useGameStore } from "../../store/gameStore";
import { STAGE_META } from "../../data/gameData";
import { CAMPAIGN_STAGE_TARGETS } from "../../data/campaignConfig";

const StageReport = () => {
  const {
    campaignState,
    campaignMetrics,
    turnIndex,
    maxTurnsPerStage,
    currentStage,
    turnLog,
    campaignQuiz,
    advanceCampaignFlow,
  } = useGameStore();

  if (campaignState !== "STAGE_REPORT" && campaignState !== "STAGE_CLEAR") return null;

  const stageInfo = STAGE_META[currentStage];
  const targets = CAMPAIGN_STAGE_TARGETS[currentStage];
  const isFinal = turnIndex >= maxTurnsPerStage;
  const isClear = campaignState === "STAGE_CLEAR";

  const quizStats = `${campaignQuiz.correct}/${campaignQuiz.correct + campaignQuiz.wrong}`;

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={{
          ...s.headerBadge,
          color: isClear ? "#4ade80" : "#fbbf24",
          borderColor: isClear ? "rgba(74,222,128,0.4)" : "rgba(234,179,8,0.4)",
          background: isClear ? "rgba(74,222,128,0.1)" : "rgba(234,179,8,0.1)",
        }}>
          {isClear ? "✓ GIAI ĐOẠN HOÀN THÀNH" : `📊 BÁO CÁO LƯỢT ${turnIndex}`}
        </div>

        <div style={s.stageTitle}>
          {stageInfo?.shortTitle} — {stageInfo?.title}
        </div>

        <div style={s.metricsGrid}>
          <MetricRow label="Kiểm soát" value={campaignMetrics.control} target={targets?.control ?? 0} color="#24c97a" />
          <MetricRow label="Ủng hộ" value={campaignMetrics.support} target={targets?.support ?? 0} color="#2e86ff" />
          <MetricRow label="Hậu cần" value={campaignMetrics.logistics} target={targets?.logistics ?? 0} color="#eab308" />
          <MetricRow label="Bảo mật" value={campaignMetrics.secrecy} target={targets?.secrecy ?? 0} color="#a78bfa" />
          <MetricRow label="Áp lực" value={campaignMetrics.pressure} target={targets?.pressure ?? 0} color="#ef4444" inverse />
        </div>

        <div style={s.statsRow}>
          <div style={s.statBox}>
            <span style={s.statLabel}>Lượt</span>
            <span style={s.statValue}>{turnIndex}/{maxTurnsPerStage}</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statLabel}>Quiz</span>
            <span style={s.statValue}>{quizStats}</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statLabel}>Sự kiện</span>
            <span style={s.statValue}>
              {turnLog.filter((e) => e.eventId).length}
            </span>
          </div>
        </div>

        <button onClick={advanceCampaignFlow} style={s.continueBtn}>
          {isClear ? "TIẾP TỤC →" : isFinal ? "XEM KẾT QUẢ" : "TIẾP TỤC →"}
        </button>
      </div>
    </div>
  );
};

const MetricRow = ({
  label,
  value,
  target,
  color,
  inverse = false,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  inverse?: boolean;
}) => {
  const met = inverse ? value <= target : value >= target;
  return (
    <div style={s.metricRow}>
      <div style={s.metricLabel}>{label}</div>
      <div style={s.metricBarWrap}>
        <div style={s.metricTrack}>
          <div
            style={{
              height: "100%",
              width: `${Math.max(0, Math.min(100, inverse ? 100 - value : value))}%`,
              background: color,
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
          {/* Target marker */}
          <div
            style={{
              position: "absolute",
              left: `${inverse ? 100 - target : target}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: "rgba(248,250,252,0.5)",
            }}
          />
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: met ? "#4ade80" : "#fb7185",
          minWidth: 44,
          textAlign: "right" as const,
        }}>
          {Math.round(value)}/{target}
        </span>
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
    backdropFilter: "blur(3px)",
  },
  card: {
    width: "min(560px, 90vw)",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(100,116,139,0.3)",
    borderRadius: 20,
    padding: "28px 32px",
  },
  headerBadge: {
    display: "inline-block",
    padding: "5px 16px",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    border: "1px solid",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#e2e8f0",
    marginBottom: 20,
  },
  metricsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  metricRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: "#94a3b8",
    width: 70,
    flexShrink: 0,
  },
  metricBarWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  metricTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    background: "rgba(51,65,85,0.9)",
    overflow: "visible",
    position: "relative" as const,
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    background: "rgba(30,41,59,0.5)",
    padding: "10px 0",
    borderRadius: 10,
    border: "1px solid rgba(71,85,105,0.3)",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#e2e8f0",
  },
  continueBtn: {
    width: "100%",
    padding: "14px 0",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, rgba(0,243,255,0.15), rgba(46,134,255,0.15))",
    border: "1px solid rgba(0,243,255,0.4)",
    borderRadius: 12,
    cursor: "pointer",
    letterSpacing: 2,
    fontFamily: "inherit",
    transition: "background 0.2s ease",
  },
};

export default StageReport;
