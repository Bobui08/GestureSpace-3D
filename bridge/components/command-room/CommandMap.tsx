import React from "react";
import { useGameStore } from "../../store/gameStore";
import { REGIONS, type CampaignRegion } from "../../data/campaignConfig";

const CommandMap = () => {
  const {
    selectedRegionId,
    selectRegion,
    campaignMetrics,
    campaignState,
  } = useGameStore();

  const isInteractive = campaignState === "TURN_PLANNING";

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.title}>🗺 BẢN ĐỒ CHIẾN TRƯỜNG</span>
        <div style={s.metricsStrip}>
          <MiniMetric label="CTR" value={campaignMetrics.control} color="#24c97a" />
          <MiniMetric label="SUP" value={campaignMetrics.support} color="#2e86ff" />
          <MiniMetric label="LOG" value={campaignMetrics.logistics} color="#eab308" />
          <MiniMetric label="SEC" value={campaignMetrics.secrecy} color="#a78bfa" />
          <MiniMetric label="PRS" value={campaignMetrics.pressure} color="#ef4444" inverse />
        </div>
      </div>

      <div style={s.mapGrid}>
        {REGIONS.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            isSelected={selectedRegionId === region.id}
            isInteractive={isInteractive}
            onSelect={() => isInteractive && selectRegion(region.id)}
          />
        ))}
      </div>

      {!isInteractive && campaignState !== "PRE_INTRO" && (
        <div style={s.lockOverlay}>
          <span style={s.lockText}>Chọn vùng trong giai đoạn lập kế hoạch</span>
        </div>
      )}
    </div>
  );
};

const RegionCard = ({
  region,
  isSelected,
  isInteractive,
  onSelect,
}: {
  region: CampaignRegion;
  isSelected: boolean;
  isInteractive: boolean;
  onSelect: () => void;
}) => {
  const bonuses = Object.entries(region.bonusEffects)
    .map(([k, v]) => {
      const num = v as number;
      const sign = num > 0 ? "+" : "";
      return `${k.slice(0, 3).toUpperCase()} ${sign}${num}`;
    })
    .join("  ");

  return (
    <button
      onClick={onSelect}
      style={{
        ...s.regionCard,
        borderColor: isSelected
          ? "rgba(0,243,255,0.7)"
          : "rgba(71,85,105,0.3)",
        background: isSelected
          ? "rgba(0,243,255,0.08)"
          : "rgba(15,23,42,0.6)",
        cursor: isInteractive ? "pointer" : "default",
        boxShadow: isSelected ? "0 0 20px rgba(0,243,255,0.15)" : "none",
      }}
    >
      <div style={s.regionName}>{region.label}</div>
      <div style={s.regionDesc}>{region.description}</div>
      <div style={s.regionBonus}>{bonuses}</div>
    </button>
  );
};

const MiniMetric = ({
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
  <div style={s.miniMetric}>
    <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color }}>{Math.round(value)}</span>
    <div style={s.miniTrack}>
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, inverse ? 100 - value : value))}%`,
          background: color,
          borderRadius: 999,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  </div>
);

const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    padding: "12px 14px 10px",
    borderBottom: "1px solid rgba(51,65,85,0.5)",
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    color: "#00f3ff",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  metricsStrip: {
    display: "flex",
    gap: 14,
    marginTop: 10,
  },
  miniMetric: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  miniTrack: {
    width: "100%",
    height: 3,
    borderRadius: 999,
    background: "rgba(51,65,85,0.9)",
    overflow: "hidden",
  },
  mapGrid: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "12px 10px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    alignContent: "start",
  },
  regionCard: {
    all: "unset" as const,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(71,85,105,0.3)",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    color: "#f8fafc",
  },
  regionName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#e2e8f0",
    marginBottom: 4,
  },
  regionDesc: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.4,
    marginBottom: 6,
  },
  regionBonus: {
    fontSize: 10,
    fontWeight: 600,
    color: "#67e8f9",
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: "absolute" as const,
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.3)",
    pointerEvents: "none",
  },
  lockText: {
    fontSize: 13,
    color: "#64748b",
    background: "rgba(15,23,42,0.9)",
    padding: "8px 16px",
    borderRadius: 8,
  },
};

export default CommandMap;
