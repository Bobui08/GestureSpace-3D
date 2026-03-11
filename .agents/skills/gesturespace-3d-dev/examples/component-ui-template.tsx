/**
 * TEMPLATE: UI Overlay Component cho GestureSpace-3D
 *
 * Đặt file trong: bridge/components/ui/
 * Component này nằm NGOÀI <Canvas>, render HTML overlay lên trên 3D scene
 *
 * Patterns:
 * - Inline React.CSSProperties styles object
 * - Dark glassmorphism theme
 * - pointerEvents: "none" trên root, "auto" trên interactive elements
 * - Conditional render theo gameState / campaignState
 */

import React, { useMemo } from "react";
import { useGameStore } from "../../store/gameStore";

const MyUIPanel = () => {
  // 1. Store hooks — selectors nên destructure cụ thể
  const {
    campaignState,
    campaignMetrics,
    turnIndex,
    maxTurnsPerStage,
  } = useGameStore();

  // 2. Derived data
  const progressPct = useMemo(
    () => Math.round((turnIndex / maxTurnsPerStage) * 100),
    [turnIndex, maxTurnsPerStage]
  );

  // 3. Conditional visibility
  if (campaignState === "PRE_INTRO" || campaignState === "BRIEFING") return null;

  // 4. Render
  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <span style={styles.label}>Tiến trình</span>
          <span style={styles.value}>{progressPct}%</span>
        </div>

        <div style={styles.meterTrack}>
          <div
            style={{
              ...styles.meterFill,
              width: `${progressPct}%`,
            }}
          />
        </div>

        {/* Metric bars */}
        <MetricBar label="Control" value={campaignMetrics.control} color="#24c97a" />
        <MetricBar label="Support" value={campaignMetrics.support} color="#2e86ff" />
        <MetricBar label="Pressure" value={campaignMetrics.pressure} color="#ef4444" inverse />
      </div>
    </div>
  );
};

// -- Sub-component --
const MetricBar = ({
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
  <div style={styles.metricRow}>
    <span style={styles.metricLabel}>{label}</span>
    <span style={styles.metricValue}>{Math.round(value)}</span>
    <div style={styles.meterTrack}>
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, inverse ? 100 - value : value))}%`,
          background: color,
          borderRadius: 999,
          transition: "width 0.25s ease",
        }}
      />
    </div>
  </div>
);

// -- Styles --
const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",           // ← Cho phép click xuyên qua
    zIndex: 120,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    color: "#f8fafc",
    fontFamily: "Outfit, Segoe UI, sans-serif",
  },
  panel: {
    background: "rgba(2, 6, 23, 0.78)",       // ← Dark glass
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 14,
    padding: "14px 18px",
    maxWidth: 320,
    backdropFilter: "blur(6px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#93c5fd",
    letterSpacing: 0.7,
    textTransform: "uppercase" as const,
  },
  value: {
    fontSize: 20,
    fontWeight: 700,
    color: "#f8fafc",
  },
  meterTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "rgba(51, 65, 85, 0.9)",
    overflow: "hidden",
    marginBottom: 8,
  },
  meterFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00f3ff, #2e86ff)",
    borderRadius: 999,
    transition: "width 0.25s ease",
  },
  metricRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    width: 70,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 600,
    width: 30,
    color: "#e2e8f0",
  },
};

export default MyUIPanel;
