import React from "react";
import { useGameStore } from "../../store/gameStore";
import {
  DIRECTIVE_CATALOG,
  getAvailableDirectives,
  type CampaignDirective,
  type DirectiveCategory,
} from "../../data/directiveCatalog";

const CATEGORY_ICONS: Record<DirectiveCategory, string> = {
  POLITICAL: "🏛",
  MILITARY: "⚔️",
  LOGISTICS: "📦",
  INTELLIGENCE: "🕵️",
};

const CATEGORY_COLORS: Record<DirectiveCategory, string> = {
  POLITICAL: "#60a5fa",
  MILITARY: "#f87171",
  LOGISTICS: "#fbbf24",
  INTELLIGENCE: "#a78bfa",
};

const DirectiveDeck = () => {
  const {
    selectedDirectiveId,
    selectDirective,
    selectedRegionId,
    commandPoints,
    campaignState,
    directiveCooldowns,
    commitTurnCommand,
    resolveTurnOutcome,
  } = useGameStore();

  const isPlanning = campaignState === "TURN_PLANNING";
  const available = getAvailableDirectives(directiveCooldowns);

  const handleCommit = () => {
    const result = commitTurnCommand();
    if (result.success) {
      // Auto-resolve after commit
      setTimeout(() => resolveTurnOutcome(), 600);
    }
  };

  const canCommit = isPlanning && selectedDirectiveId && selectedRegionId && commandPoints > 0;

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.title}>⚙ LỆNH CHIẾN LƯỢC</span>
        <span style={s.cpBadge}>CP: {commandPoints}</span>
      </div>

      <div style={s.scrollArea}>
        {DIRECTIVE_CATALOG.map((dir) => {
          const onCooldown = (directiveCooldowns[dir.id] ?? 0) > 0;
          const isSelected = selectedDirectiveId === dir.id;
          const affordable = commandPoints >= dir.costs.commandPoints;
          const disabled = !isPlanning || onCooldown || !affordable;

          return (
            <DirectiveCard
              key={dir.id}
              directive={dir}
              isSelected={isSelected}
              disabled={disabled}
              onCooldown={onCooldown}
              cooldownLeft={directiveCooldowns[dir.id] ?? 0}
              onSelect={() => !disabled && selectDirective(isSelected ? null : dir.id)}
            />
          );
        })}
      </div>

      {/* Commit Button */}
      <div style={s.commitArea}>
        {!selectedRegionId && isPlanning && (
          <div style={s.hint}>↑ Chọn vùng trên bản đồ</div>
        )}
        {!selectedDirectiveId && isPlanning && (
          <div style={s.hint}>↑ Chọn một lệnh chiến lược</div>
        )}
        <button
          onClick={handleCommit}
          disabled={!canCommit}
          style={{
            ...s.commitButton,
            opacity: canCommit ? 1 : 0.4,
            cursor: canCommit ? "pointer" : "not-allowed",
          }}
        >
          ▶ THỰC THI LỆNH
        </button>
      </div>
    </div>
  );
};

const DirectiveCard = ({
  directive,
  isSelected,
  disabled,
  onCooldown,
  cooldownLeft,
  onSelect,
}: {
  directive: CampaignDirective;
  isSelected: boolean;
  disabled: boolean;
  onCooldown: boolean;
  cooldownLeft: number;
  onSelect: () => void;
}) => {
  const catColor = CATEGORY_COLORS[directive.category];
  const catIcon = CATEGORY_ICONS[directive.category];
  const effects = Object.entries(directive.effects)
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
        ...s.card,
        borderColor: isSelected ? catColor : "rgba(71,85,105,0.3)",
        background: isSelected ? `${catColor}10` : "rgba(15,23,42,0.5)",
        opacity: disabled && !isSelected ? 0.45 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <div style={s.cardTop}>
        <span style={s.cardIcon}>{catIcon}</span>
        <span style={s.cardLabel}>{directive.label}</span>
        <span style={{ ...s.cpCost, color: catColor }}>
          {directive.costs.commandPoints} CP
        </span>
      </div>
      <div style={s.cardDesc}>{directive.description}</div>
      <div style={s.cardEffects}>{effects}</div>
      {onCooldown && (
        <div style={s.cooldownBadge}>🔄 {cooldownLeft} lượt</div>
      )}
    </button>
  );
};

const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  header: {
    padding: "12px 14px 8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(51,65,85,0.5)",
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    color: "#00f3ff",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  cpBadge: {
    fontSize: 13,
    fontWeight: 700,
    color: "#fbbf24",
    background: "rgba(234,179,8,0.1)",
    padding: "3px 10px",
    borderRadius: 6,
    border: "1px solid rgba(234,179,8,0.3)",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  card: {
    all: "unset" as const,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(71,85,105,0.3)",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    color: "#f8fafc",
    position: "relative" as const,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  cardIcon: {
    fontSize: 14,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#e2e8f0",
    flex: 1,
  },
  cpCost: {
    fontSize: 11,
    fontWeight: 700,
  },
  cardDesc: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.3,
    marginBottom: 4,
  },
  cardEffects: {
    fontSize: 10,
    fontWeight: 600,
    color: "#67e8f9",
    letterSpacing: 0.3,
  },
  cooldownBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    fontSize: 10,
    color: "#fb923c",
    background: "rgba(251,146,60,0.1)",
    padding: "2px 6px",
    borderRadius: 4,
  },
  commitArea: {
    padding: "10px 12px 14px",
    borderTop: "1px solid rgba(51,65,85,0.5)",
  },
  hint: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center" as const,
    marginBottom: 6,
  },
  commitButton: {
    width: "100%",
    padding: "12px 0",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, rgba(0,243,255,0.2), rgba(46,134,255,0.2))",
    border: "1px solid rgba(0,243,255,0.5)",
    borderRadius: 10,
    letterSpacing: 2,
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
};

export default DirectiveDeck;
