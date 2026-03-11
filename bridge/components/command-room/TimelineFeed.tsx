import React from "react";
import { useGameStore, type TurnLogEntry } from "../../store/gameStore";

const TimelineFeed = () => {
  const { turnLog, turnIndex, activeEventId } = useGameStore();

  return (
    <div style={s.root}>
      <div style={s.title}>📋 NHẬT KÝ CHIẾN DỊCH</div>

      <div style={s.scrollArea}>
        {turnLog.length === 0 && (
          <div style={s.empty}>Chưa có hoạt động nào</div>
        )}

        {[...turnLog].reverse().map((entry, i) => (
          <TimelineEntry key={entry.turnIndex} entry={entry} isLatest={i === 0} />
        ))}
      </div>
    </div>
  );
};

const TimelineEntry = ({ entry, isLatest }: { entry: TurnLogEntry; isLatest: boolean }) => {
  const deltaStr = (before: number, after: number) => {
    const d = Math.round(after - before);
    if (d > 0) return `+${d}`;
    if (d < 0) return `${d}`;
    return "0";
  };

  return (
    <div style={{ ...s.entry, borderColor: isLatest ? "rgba(0,243,255,0.4)" : "rgba(71,85,105,0.3)" }}>
      <div style={s.entryHeader}>
        <span style={s.turnBadge}>Lượt {entry.turnIndex}</span>
        {entry.directiveId && (
          <span style={s.directiveTag}>{entry.directiveId.replace(/-/g, " ")}</span>
        )}
      </div>

      {entry.regionId && (
        <div style={s.regionLine}>📍 {entry.regionId.replace(/-/g, " ")}</div>
      )}

      {entry.eventId && (
        <div style={s.eventLine}>⚡ {entry.eventLabel ?? entry.eventId}</div>
      )}

      {entry.quizResult && (
        <div style={{
          ...s.quizLine,
          color: entry.quizResult.correct ? "#4ade80" : "#fb7185",
        }}>
          🧠 Quiz: {entry.quizResult.correct ? "Đúng ✓" : "Sai ✗"}
        </div>
      )}

      <div style={s.deltaRow}>
        <DeltaChip label="CTR" val={deltaStr(entry.metricsBefore.control, entry.metricsAfter.control)} />
        <DeltaChip label="SUP" val={deltaStr(entry.metricsBefore.support, entry.metricsAfter.support)} />
        <DeltaChip label="LOG" val={deltaStr(entry.metricsBefore.logistics, entry.metricsAfter.logistics)} />
        <DeltaChip label="SEC" val={deltaStr(entry.metricsBefore.secrecy, entry.metricsAfter.secrecy)} />
        <DeltaChip label="PRS" val={deltaStr(entry.metricsBefore.pressure, entry.metricsAfter.pressure)} inverted />
      </div>
    </div>
  );
};

const DeltaChip = ({ label, val, inverted = false }: { label: string; val: string; inverted?: boolean }) => {
  const num = parseInt(val);
  let color = "#94a3b8";
  if (inverted) {
    if (num > 0) color = "#fb7185";
    if (num < 0) color = "#4ade80";
  } else {
    if (num > 0) color = "#4ade80";
    if (num < 0) color = "#fb7185";
  }
  return (
    <span style={{ ...s.deltaChip, color }}>
      {label} {val}
    </span>
  );
};

const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  title: {
    padding: "12px 14px 8px",
    fontSize: 12,
    fontWeight: 700,
    color: "#00f3ff",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    borderBottom: "1px solid rgba(51,65,85,0.5)",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  empty: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center" as const,
    marginTop: 30,
  },
  entry: {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(71,85,105,0.3)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  entryHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  turnBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#cbd5e1",
    background: "rgba(51,65,85,0.6)",
    padding: "2px 8px",
    borderRadius: 6,
  },
  directiveTag: {
    fontSize: 11,
    color: "#93c5fd",
    textTransform: "capitalize" as const,
  },
  regionLine: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    textTransform: "capitalize" as const,
  },
  eventLine: {
    fontSize: 11,
    color: "#fbbf24",
    marginTop: 2,
  },
  quizLine: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: 600,
  },
  deltaRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
    marginTop: 6,
  },
  deltaChip: {
    fontSize: 10,
    fontWeight: 600,
    padding: "1px 5px",
    background: "rgba(30,41,59,0.8)",
    borderRadius: 4,
  },
};

export default TimelineFeed;
