/**
 * CommandRoomRoot — War-Room 3-column layout shell
 *
 * Layout:
 *   Left   → TimelineFeed (turn log + events)
 *   Center → CommandMap (regions + metrics heatmap)
 *   Right  → DirectiveDeck (directive cards + commit)
 *   Bottom → TurnTimer bar
 *
 * Overlays (modal, per state):
 *   BRIEFING     → BriefingPanel
 *   INTEL_QUIZ   → IntelConsole
 *   STAGE_REPORT → StageReport
 *   GAME_OVER    → Game Over screen
 *   CAMPAIGN_CLEAR → Victory screen
 */

import React from "react";
import { useGameStore } from "../../store/gameStore";

import TimelineFeed from "./TimelineFeed";
import CommandMap from "./CommandMap";
import DirectiveDeck from "./DirectiveDeck";
import TurnTimer from "./TurnTimer";
import BriefingPanel from "./BriefingPanel";
import IntelConsole from "./IntelConsole";
import StageReport from "./StageReport";

const CommandRoomRoot = () => {
  const {
    campaignState,
    startCampaignMode,
    startGame,
    currentStage,
  } = useGameStore();

  // ── PRE_INTRO: Start screen ──
  if (campaignState === "PRE_INTRO") {
    return (
      <div style={s.root}>
        <div style={s.centeredCard}>
          <div style={s.logoGlow} />
          <h1 style={s.title}>PHÒNG CHỈ HUY</h1>
          <div style={s.divider} />
          <p style={s.subtitle}>Chiến dịch Cách mạng miền Nam 1954–1965</p>
          <button style={s.startButton} onClick={startCampaignMode}>
            BẮT ĐẦU CHIẾN DỊCH
          </button>
        </div>
      </div>
    );
  }

  // ── CAMPAIGN_CLEAR: Victory screen ──
  if (campaignState === "CAMPAIGN_CLEAR") {
    return (
      <div style={s.root}>
        <div style={{ ...s.centeredCard, borderColor: "rgba(74,222,128,0.4)" }}>
          <h1 style={{ ...s.title, color: "#4ade80" }}>CHIẾN THẮNG</h1>
          <div style={{ ...s.divider, background: "linear-gradient(90deg, transparent, #4ade80, transparent)" }} />
          <p style={s.subtitle}>Chiến dịch hoàn thành thắng lợi.</p>
          <button style={s.startButton} onClick={startGame}>
            CHƠI LẠI
          </button>
        </div>
      </div>
    );
  }

  // ── GAME_OVER: Defeat screen ──
  if (campaignState === "GAME_OVER") {
    return (
      <div style={s.root}>
        <div style={{ ...s.centeredCard, borderColor: "rgba(248,113,113,0.4)" }}>
          <h1 style={{ ...s.title, color: "#fca5a5" }}>THẤT BẠI</h1>
          <div style={{ ...s.divider, background: "linear-gradient(90deg, transparent, #f87171, transparent)" }} />
          <p style={s.subtitle}>Mạng lưới bị lộ hoặc áp lực vượt ngưỡng.</p>
          <button style={s.startButton} onClick={startGame}>
            THỬ LẠI
          </button>
        </div>
      </div>
    );
  }

  // ── Main 3-column War-Room layout ──
  return (
    <div style={s.root}>
      {/* Stage label */}
      <div style={s.topBar}>
        <span style={s.stageLabel}>
          {currentStage.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* 3-column layout */}
      <div style={s.columns}>
        {/* Left: Timeline */}
        <div style={s.panelLeft}>
          <TimelineFeed />
        </div>

        {/* Center: Map */}
        <div style={s.panelCenter}>
          <CommandMap />
        </div>

        {/* Right: Directives */}
        <div style={s.panelRight}>
          <DirectiveDeck />
        </div>
      </div>

      {/* Bottom: Timer + status strip */}
      <TurnTimer />

      {/* Modal overlays (state-gated) */}
      <BriefingPanel />
      <IntelConsole />
      <StageReport />
    </div>
  );
};

// ── Styles ──
const s: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    color: "#f8fafc",
    fontFamily: "Outfit, Segoe UI, sans-serif",
    background: "radial-gradient(ellipse at 30% 20%, #111827 0%, #080c12 60%, #050709 100%)",
    overflow: "hidden",
  },

  /* ── Top bar ── */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 18px 6px",
    borderBottom: "1px solid rgba(51,65,85,0.35)",
  },
  stageLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    letterSpacing: 2,
  },

  /* ── 3-column layout ── */
  columns: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "260px 1fr 280px",
    gap: 0,
    overflow: "hidden",
    minHeight: 0,
  },
  panelLeft: {
    borderRight: "1px solid rgba(51,65,85,0.35)",
    overflow: "hidden",
  },
  panelCenter: {
    overflow: "hidden",
  },
  panelRight: {
    borderLeft: "1px solid rgba(51,65,85,0.35)",
    overflow: "hidden",
  },

  /* ── Centered cards (start / game-over / victory) ── */
  centeredCard: {
    position: "absolute" as const,
    inset: 0,
    display: "grid",
    placeItems: "center",
    zIndex: 300,
    background: "radial-gradient(ellipse at center, #0f1923 0%, #080c12 100%)",
  },
  logoGlow: {
    position: "absolute" as const,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,243,255,0.06), transparent 70%)",
    pointerEvents: "none" as const,
  },
  title: {
    margin: 0,
    fontSize: 42,
    fontWeight: 800,
    color: "#00f3ff",
    letterSpacing: 6,
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
  },
  divider: {
    width: 120,
    height: 2,
    margin: "14px auto",
    background: "linear-gradient(90deg, transparent, #00f3ff, transparent)",
    borderRadius: 999,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
  startButton: {
    display: "block",
    margin: "0 auto",
    padding: "14px 40px",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "rgba(0,243,255,0.12)",
    border: "1px solid rgba(0,243,255,0.45)",
    borderRadius: 12,
    cursor: "pointer",
    letterSpacing: 3,
    fontFamily: "inherit",
    transition: "background 0.2s ease",
  },
};

export default CommandRoomRoot;
