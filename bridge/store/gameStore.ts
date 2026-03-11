import { create } from "zustand";
import questionBank from "../questions-revolution-network.json";
import { BLOCKS, STAGES, STAGE_META, STAGE_SEQUENCE, type GameBlock } from "../data/gameData";
import {
  getDirectiveById,
  getAvailableDirectives,
  tickCooldowns,
} from "../data/directiveCatalog";
import {
  CAMPAIGN_STAGE_TARGETS,
  CAMPAIGN_PACING,
  QUIZ_IMPACT,
  rollTurnEvent,
  getRegionById,
  type CampaignMetrics as CampaignMetricsType,
} from "../data/campaignConfig";
import { getQuestionForStage } from "../data/quizAdapter";

type GameState = "PRE_INTRO" | "INTRO" | "PLAYING" | "QUIZ" | "WON" | "GAME_OVER";
type GameMode = "LEGACY" | "COMMAND_ROOM";
type CampaignState =
  | "PRE_INTRO"
  | "BRIEFING"
  | "TURN_PLANNING"
  | "TURN_RESOLVE"
  | "INTEL_QUIZ"
  | "STAGE_REPORT"
  | "STAGE_CLEAR"
  | "CAMPAIGN_CLEAR"
  | "GAME_OVER";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StageQuizProgress {
  asked: number;
  correct: number;
  usedQuestionIds: string[];
}

interface CampaignMetrics {
  control: number;
  support: number;
  logistics: number;
  secrecy: number;
  pressure: number;
}

interface CampaignQuizProgress {
  askedIds: string[];
  correct: number;
  wrong: number;
  currentQuestionId: string | null;
}

export interface TurnLogEntry {
  turnIndex: number;
  directiveId: string | null;
  regionId: string | null;
  eventId: string | null;
  eventLabel: string | null;
  metricsBefore: CampaignMetrics;
  metricsAfter: CampaignMetrics;
  quizResult: { correct: boolean; questionId: string } | null;
}

interface PlacedBlocks {
  [key: string]: GameBlock[];
}

interface GameStore {
  gameMode: GameMode;
  gameState: GameState;
  score: number;
  currentStage: string;
  placedBlocks: PlacedBlocks;
  currentQuestion: Question | null;

  influence: number;
  stability: number;
  logistics: number;
  exposure: number;

  stageStartTime: number | null;
  stageElapsedTime: number;
  streakCount: number;
  multiplier: number;
  lastPlacementWasCorrect: boolean;
  wrongPlacementPenalty: number;
  usedQuestionIds: string[];
  stageQuizProgress: Record<string, StageQuizProgress>;

  setGameState: (state: GameState) => void;
  startGame: () => void;
  updateStageTime: () => void;
  checkStageCompletion: () => void;
  transitionToQuiz: () => void;
  advanceStage: () => void;

  placeBlock: (
    blockType: string,
    blockData: GameBlock
  ) => { success: boolean; reason?: string; points?: number; multiplier?: number };
  answerQuiz: (answerIndex: number) => { correct: boolean; explanation?: string };

  gameStartTime: number | null;

  gamePhase: "BUILD" | "DEFEND";
  houseHealth: number;
  defenseTimeLeft: number;
  setGamePhase: (phase: "BUILD" | "DEFEND") => void;
  damageHouse: (amount: number) => void;
  healHouse: (amount: number) => void;
  setDefenseTime: (time: number) => void;
  decrementDefenseTime: () => void;

  campaignState: CampaignState;
  maxTurnsPerStage: number;
  turnIndex: number;
  turnTimeLeft: number;
  commandPoints: number;
  selectedDirectiveId: string | null;
  selectedRegionId: string | null;
  activeEventId: string | null;
  campaignMetrics: CampaignMetrics;
  campaignQuiz: CampaignQuizProgress;
  turnLog: TurnLogEntry[];
  directiveCooldowns: Record<string, number>;

  setGameMode: (mode: GameMode) => void;
  startCampaignMode: () => void;
  startCampaignStage: (stageId?: string) => void;
  startCampaignTurn: () => void;
  setTurnTimeLeft: (seconds: number) => void;
  tickTurnTimer: () => void;
  selectDirective: (directiveId: string | null) => void;
  selectRegion: (regionId: string | null) => void;
  setActiveEvent: (eventId: string | null) => void;
  commitTurnCommand: () => { success: boolean; reason?: string };
  resolveTurnOutcome: () => void;
  enterQuizCheckpoint: () => void;
  submitCampaignQuizAnswer: (answerIndex: number) => { correct: boolean; explanation?: string };
  finishCampaignQuiz: () => void;
  advanceCampaignFlow: () => void;

  // ----------------------------------------------------------------------
  // P4 — Virtual Cursor State
  // ----------------------------------------------------------------------
  cursorPos: { x: number; y: number } | null;
  isPinching: boolean;
  setCursorPos: (pos: { x: number; y: number } | null) => void;
  setIsPinching: (isPinching: boolean) => void;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const createEmptyPlacedBlocks = (): PlacedBlocks => ({
  [STAGES.STAGE_1_1954_1960]: [],
  [STAGES.STAGE_2_1961_1963]: [],
  [STAGES.STAGE_3_1964_1965]: [],
});

const createInitialQuizProgress = (): Record<string, StageQuizProgress> => ({
  [STAGES.STAGE_1_1954_1960]: { asked: 0, correct: 0, usedQuestionIds: [] },
  [STAGES.STAGE_2_1961_1963]: { asked: 0, correct: 0, usedQuestionIds: [] },
  [STAGES.STAGE_3_1964_1965]: { asked: 0, correct: 0, usedQuestionIds: [] },
});

// CAMPAIGN_DIRECTIVES and CAMPAIGN_STAGE_TARGETS moved to data files
// (directiveCatalog.ts and campaignConfig.ts)

const createInitialCampaignMetrics = (): CampaignMetrics => ({
  control: 30,
  support: 45,
  logistics: 35,
  secrecy: 55,
  pressure: 20,
});

const createInitialCampaignQuiz = (): CampaignQuizProgress => ({
  askedIds: [],
  correct: 0,
  wrong: 0,
  currentQuestionId: null,
});

const clampCampaignMetrics = (metrics: CampaignMetrics): CampaignMetrics => ({
  control: clamp(metrics.control),
  support: clamp(metrics.support),
  logistics: clamp(metrics.logistics),
  secrecy: clamp(metrics.secrecy),
  pressure: clamp(metrics.pressure),
});

const applyCampaignDelta = (
  metrics: CampaignMetrics,
  delta: Partial<CampaignMetrics> | undefined
): CampaignMetrics =>
  clampCampaignMetrics({
    control: metrics.control + (delta?.control ?? 0),
    support: metrics.support + (delta?.support ?? 0),
    logistics: metrics.logistics + (delta?.logistics ?? 0),
    secrecy: metrics.secrecy + (delta?.secrecy ?? 0),
    pressure: metrics.pressure + (delta?.pressure ?? 0),
  });

const isCampaignFailed = (metrics: CampaignMetrics) =>
  metrics.pressure >= 100 || metrics.secrecy <= 0;

const isCampaignStageTargetMet = (stageId: string, metrics: CampaignMetrics) => {
  const target = CAMPAIGN_STAGE_TARGETS[stageId];
  if (!target) return false;
  return (
    metrics.control >= target.control &&
    metrics.support >= target.support &&
    metrics.logistics >= target.logistics &&
    metrics.secrecy >= target.secrecy &&
    metrics.pressure <= target.pressure
  );
};

const getQuestionsByStage = (stageId: string): Question[] => {
  const stageEntry = questionBank.stages.find((stage) => stage.stageId === stageId);
  return (stageEntry?.questions ?? []) as Question[];
};

const pickQuestion = (stageId: string, usedIds: string[]): Question | null => {
  const stageQuestions = getQuestionsByStage(stageId);
  if (!stageQuestions.length) return null;

  const available = stageQuestions.filter((q) => !usedIds.includes(q.id));
  const pool = available.length > 0 ? available : stageQuestions;
  return pool[Math.floor(Math.random() * pool.length)];
};

const applyNodeStatEffects = (
  nodeType: GameBlock["nodeType"],
  current: { influence: number; stability: number; logistics: number; exposure: number }
) => {
  const next = { ...current };

  switch (nodeType) {
    case "CO_SO_QUAN_CHUNG":
      next.influence += 8;
      next.stability += 4;
      next.exposure += 1;
      break;
    case "DU_KICH":
      next.influence += 5;
      next.stability += 7;
      next.exposure += 2;
      break;
    case "TUYEN_VAN_CHUYEN":
      next.influence += 4;
      next.logistics += 10;
      next.exposure += 1;
      break;
    case "VUNG_AN_TOAN":
      next.stability += 10;
      next.exposure -= 8;
      break;
    case "DIEM_CHI_HUY":
      next.influence += 10;
      next.logistics += 6;
      next.stability += 5;
      next.exposure += 3;
      break;
  }

  return {
    influence: clamp(next.influence),
    stability: clamp(next.stability),
    logistics: clamp(next.logistics),
    exposure: clamp(next.exposure),
  };
};

const isStageTargetMet = (
  stageId: string,
  stats: { influence: number; stability: number; logistics: number; exposure: number }
) => {
  const target = STAGE_META[stageId]?.targets;
  if (!target) return false;

  return (
    stats.influence >= target.influence &&
    stats.stability >= target.stability &&
    stats.logistics >= target.logistics &&
    stats.exposure <= target.exposureMax
  );
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameMode: "COMMAND_ROOM",
  gameState: "PRE_INTRO",
  gameStartTime: null,
  score: 0,
  currentStage: STAGES.STAGE_1_1954_1960,
  placedBlocks: createEmptyPlacedBlocks(),
  currentQuestion: null,

  influence: 12,
  stability: 70,
  logistics: 18,
  exposure: 8,

  stageStartTime: null,
  stageElapsedTime: 0,
  streakCount: 0,
  multiplier: 1,
  lastPlacementWasCorrect: false,
  wrongPlacementPenalty: -3,
  usedQuestionIds: [],
  stageQuizProgress: createInitialQuizProgress(),

  gamePhase: "BUILD",
  houseHealth: 70,
  defenseTimeLeft: 20,

  campaignState: "PRE_INTRO",
  maxTurnsPerStage: CAMPAIGN_PACING.maxTurnsPerStage,
  turnIndex: 0,
  turnTimeLeft: CAMPAIGN_PACING.turnPlanningDuration,
  commandPoints: CAMPAIGN_PACING.initialCommandPoints,
  selectedDirectiveId: null,
  selectedRegionId: null,
  activeEventId: null,
  campaignMetrics: createInitialCampaignMetrics(),
  campaignQuiz: createInitialCampaignQuiz(),
  turnLog: [],
  directiveCooldowns: {},

  // P4 — Virtual Cursor State
  cursorPos: null,
  isPinching: false,
  setCursorPos: (pos) => set({ cursorPos: pos }),
  setIsPinching: (isPinching) => set({ isPinching }),

  setGameMode: (mode) => set({ gameMode: mode }),
  setGameState: (state: GameState) => set({ gameState: state }),

  startCampaignMode: () => {
    set({
      gameMode: "COMMAND_ROOM",
      gameState: "PLAYING",
      currentStage: STAGES.STAGE_1_1954_1960,
      campaignState: "BRIEFING",
      maxTurnsPerStage: CAMPAIGN_PACING.maxTurnsPerStage,
      turnIndex: 0,
      turnTimeLeft: CAMPAIGN_PACING.turnPlanningDuration,
      commandPoints: CAMPAIGN_PACING.initialCommandPoints,
      selectedDirectiveId: null,
      selectedRegionId: null,
      activeEventId: null,
      campaignMetrics: createInitialCampaignMetrics(),
      campaignQuiz: createInitialCampaignQuiz(),
      currentQuestion: null,
      turnLog: [],
      directiveCooldowns: {},
    });
  },

  startCampaignStage: (stageId) => {
    const nextStage = stageId ?? get().currentStage;
    set({
      gameMode: "COMMAND_ROOM",
      gameState: "PLAYING",
      currentStage: nextStage,
      campaignState: "BRIEFING",
      turnIndex: 0,
      turnTimeLeft: CAMPAIGN_PACING.turnPlanningDuration,
      commandPoints: CAMPAIGN_PACING.initialCommandPoints,
      selectedDirectiveId: null,
      selectedRegionId: null,
      activeEventId: null,
      campaignMetrics: createInitialCampaignMetrics(),
      campaignQuiz: createInitialCampaignQuiz(),
      currentQuestion: null,
      turnLog: [],
      directiveCooldowns: {},
    });
  },

  startCampaignTurn: () => {
    const { campaignState, directiveCooldowns } = get();
    if (campaignState !== "BRIEFING" && campaignState !== "STAGE_REPORT") return;
    set({
      campaignState: "TURN_PLANNING",
      turnTimeLeft: CAMPAIGN_PACING.turnPlanningDuration,
      selectedDirectiveId: null,
      selectedRegionId: null,
      activeEventId: null,
      currentQuestion: null,
      directiveCooldowns: tickCooldowns(directiveCooldowns),
    });
  },

  setTurnTimeLeft: (seconds) =>
    set(() => ({
      turnTimeLeft: Math.max(0, Math.floor(seconds)),
    })),

  tickTurnTimer: () =>
    set((state) => ({
      turnTimeLeft: Math.max(0, state.turnTimeLeft - 1),
    })),

  selectDirective: (directiveId) => set({ selectedDirectiveId: directiveId }),
  selectRegion: (regionId) => set({ selectedRegionId: regionId }),
  setActiveEvent: (eventId) => set({ activeEventId: eventId }),

  commitTurnCommand: () => {
    const { campaignState, selectedDirectiveId, selectedRegionId, commandPoints, directiveCooldowns } = get();
    if (campaignState !== "TURN_PLANNING") return { success: false, reason: "INVALID_STATE" };
    if (!selectedDirectiveId) return { success: false, reason: "NO_DIRECTIVE" };
    if (!selectedRegionId) return { success: false, reason: "NO_REGION" };

    const directive = getDirectiveById(selectedDirectiveId);
    if (!directive) return { success: false, reason: "INVALID_DIRECTIVE" };
    if (commandPoints < directive.costs.commandPoints) return { success: false, reason: "NO_COMMAND_POINTS" };

    // Check cooldown
    if ((directiveCooldowns[selectedDirectiveId] ?? 0) > 0) {
      return { success: false, reason: "ON_COOLDOWN" };
    }

    // Apply cooldown
    const nextCooldowns = { ...directiveCooldowns };
    if (directive.cooldownTurns > 0) {
      nextCooldowns[selectedDirectiveId] = directive.cooldownTurns;
    }

    set({
      campaignState: "TURN_RESOLVE",
      commandPoints: commandPoints - directive.costs.commandPoints,
      directiveCooldowns: nextCooldowns,
    });
    return { success: true };
  },

  resolveTurnOutcome: () => {
    const {
      campaignState,
      selectedDirectiveId,
      selectedRegionId,
      campaignMetrics,
      turnIndex,
      maxTurnsPerStage,
      currentStage,
      campaignQuiz,
      turnLog,
    } = get();
    if (campaignState !== "TURN_RESOLVE") return;

    const metricsBefore = { ...campaignMetrics };

    // 1. Directive effects
    const directive = getDirectiveById(selectedDirectiveId ?? "");
    const directiveDelta: Partial<CampaignMetrics> = directive?.effects ?? {};

    // 2. Region bonus effects
    const region = getRegionById(selectedRegionId ?? "");
    const regionDelta: Partial<CampaignMetrics> = region?.bonusEffects ?? {};

    // 3. Random turn event
    const event = rollTurnEvent(currentStage);
    const eventDelta: Partial<CampaignMetrics> = event?.effects ?? {};

    // 4. Merge all deltas
    const mergedDelta: Partial<CampaignMetrics> = {
      control: (directiveDelta.control ?? 0) + (regionDelta.control ?? 0) + (eventDelta.control ?? 0),
      support: (directiveDelta.support ?? 0) + (regionDelta.support ?? 0) + (eventDelta.support ?? 0),
      logistics: (directiveDelta.logistics ?? 0) + (regionDelta.logistics ?? 0) + (eventDelta.logistics ?? 0),
      secrecy: (directiveDelta.secrecy ?? 0) + (regionDelta.secrecy ?? 0) + (eventDelta.secrecy ?? 0),
      pressure: (directiveDelta.pressure ?? 0) + (regionDelta.pressure ?? 0) + (eventDelta.pressure ?? 0),
    };

    const nextMetrics = applyCampaignDelta(campaignMetrics, mergedDelta);
    const nextTurnIndex = turnIndex + 1;
    // Check if the current turn we just ended (turnIndex) was a checkpoint turn
    // (turnIndex here is 1-based conceptually, so turnIndex 2 means we just finished turn 2)
    const shouldQuiz = CAMPAIGN_PACING.quizCheckpointTurns.includes(turnIndex);

    // 5. Log this turn
    const logEntry: TurnLogEntry = {
      turnIndex: nextTurnIndex,
      directiveId: selectedDirectiveId,
      regionId: selectedRegionId,
      eventId: event?.id ?? null,
      eventLabel: event?.label ?? null,
      metricsBefore,
      metricsAfter: nextMetrics,
      quizResult: null,
    };

    if (isCampaignFailed(nextMetrics)) {
      set({
        campaignMetrics: nextMetrics,
        turnIndex: nextTurnIndex,
        campaignState: "GAME_OVER",
        gameState: "GAME_OVER",
        activeEventId: event?.id ?? null,
        turnLog: [...turnLog, logEntry],
      });
      return;
    }

    if (shouldQuiz) {
      const nextQuestion = pickQuestion(currentStage, campaignQuiz.askedIds);
      set({
        campaignMetrics: nextMetrics,
        turnIndex: nextTurnIndex,
        campaignState: nextQuestion ? "INTEL_QUIZ" : "STAGE_REPORT",
        gameState: nextQuestion ? "QUIZ" : "PLAYING",
        currentQuestion: nextQuestion,
        activeEventId: event?.id ?? null,
        turnLog: [...turnLog, logEntry],
        campaignQuiz: nextQuestion
          ? { ...campaignQuiz, currentQuestionId: nextQuestion.id }
          : campaignQuiz,
      });
      return;
    }

    set({
      campaignMetrics: nextMetrics,
      turnIndex: nextTurnIndex,
      campaignState: "STAGE_REPORT",
      gameState: "PLAYING",
      currentQuestion: null,
      activeEventId: event?.id ?? null,
      turnLog: [...turnLog, logEntry],
    });
  },

  enterQuizCheckpoint: () => {
    const { currentStage, campaignQuiz } = get();
    const nextQuestion = getQuestionForStage(currentStage, campaignQuiz.askedIds);
    if (!nextQuestion) {
      set({ campaignState: "STAGE_REPORT" });
      return;
    }
    set({
      campaignState: "INTEL_QUIZ",
      gameState: "QUIZ",
      currentQuestion: nextQuestion as any,
      campaignQuiz: { ...campaignQuiz, currentQuestionId: nextQuestion.id },
    });
  },

  submitCampaignQuizAnswer: (answerIndex) => {
    const { currentQuestion, campaignQuiz, campaignMetrics, turnLog } = get();
    if (!currentQuestion) return { correct: false };

    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const nextQuiz: CampaignQuizProgress = {
      askedIds: campaignQuiz.askedIds.includes(currentQuestion.id)
        ? campaignQuiz.askedIds
        : [...campaignQuiz.askedIds, currentQuestion.id],
      correct: campaignQuiz.correct + (isCorrect ? 1 : 0),
      wrong: campaignQuiz.wrong + (isCorrect ? 0 : 1),
      currentQuestionId: null,
    };

    const quizDelta: Partial<CampaignMetrics> = isCorrect
      ? (QUIZ_IMPACT.correct as Partial<CampaignMetrics>)
      : (QUIZ_IMPACT.wrong as Partial<CampaignMetrics>);

    const nextMetrics = applyCampaignDelta(campaignMetrics, quizDelta);
    const nextCommandPoints = Math.max(
      0,
      get().commandPoints + (isCorrect ? CAMPAIGN_PACING.quizCorrectCommandBonus : 0)
    );

    // Update last turn log entry with quiz result
    const updatedLog = [...turnLog];
    if (updatedLog.length > 0) {
      updatedLog[updatedLog.length - 1] = {
        ...updatedLog[updatedLog.length - 1],
        quizResult: { correct: isCorrect, questionId: currentQuestion.id },
        metricsAfter: nextMetrics,
      };
    }

    // DO NOT transition campaignState here, so the user can see the feedback in IntelConsole!
    set({
      campaignMetrics: nextMetrics,
      commandPoints: nextCommandPoints,
      campaignQuiz: nextQuiz,
      turnLog: updatedLog,
    });

    return { correct: isCorrect, explanation: currentQuestion.explanation };
  },

  finishCampaignQuiz: () => {
    const { campaignMetrics } = get();
    if (isCampaignFailed(campaignMetrics)) {
      set({
        campaignState: "GAME_OVER",
        gameState: "GAME_OVER",
        currentQuestion: null,
      });
      return;
    }

    set({
      campaignState: "STAGE_REPORT",
      gameState: "PLAYING",
      currentQuestion: null,
    });
  },

  advanceCampaignFlow: () => {
    const { campaignState, turnIndex, maxTurnsPerStage, currentStage, campaignMetrics } = get();

    if (campaignState === "BRIEFING" || campaignState === "STAGE_REPORT") {
      if (turnIndex >= maxTurnsPerStage) {
        const stagePassed = isCampaignStageTargetMet(currentStage, campaignMetrics);
        if (!stagePassed) {
          set({ campaignState: "GAME_OVER", gameState: "GAME_OVER" });
          return;
        }

        const stageIndex = STAGE_SEQUENCE.indexOf(currentStage as any);
        if (stageIndex < 0 || stageIndex >= STAGE_SEQUENCE.length - 1) {
          set({ campaignState: "CAMPAIGN_CLEAR", gameState: "WON", currentStage: STAGES.COMPLETED });
          return;
        }

        const nextStage = STAGE_SEQUENCE[stageIndex + 1];
        get().startCampaignStage(nextStage);
        return;
      }

      get().startCampaignTurn();
    }
  },

  setGamePhase: (phase) => set({ gamePhase: phase }),

  damageHouse: (amount) =>
    set((state) => {
      const newHealth = clamp(state.houseHealth - amount);
      const newStability = clamp(state.stability - amount);

      if (newHealth <= 0 || newStability <= 0) {
        return {
          houseHealth: 0,
          stability: 0,
          gameState: "GAME_OVER",
          gamePhase: "BUILD",
        };
      }

      return { houseHealth: newHealth, stability: newStability };
    }),

  healHouse: (amount) =>
    set((state) => ({
      houseHealth: clamp(state.houseHealth + amount),
      stability: clamp(state.stability + amount),
    })),

  setDefenseTime: (time) => set({ defenseTimeLeft: time }),
  decrementDefenseTime: () =>
    set((state) => ({ defenseTimeLeft: Math.max(0, state.defenseTimeLeft - 1) })),

  startGame: () => {
    set({
      gameMode: "COMMAND_ROOM",
      gameState: "PLAYING",
      score: 0,
      currentStage: STAGES.STAGE_1_1954_1960,
      placedBlocks: createEmptyPlacedBlocks(),
      streakCount: 0,
      multiplier: 1,
      stageStartTime: Date.now(),
      gameStartTime: Date.now(),
      stageElapsedTime: 0,
      usedQuestionIds: [],
      stageQuizProgress: createInitialQuizProgress(),
      currentQuestion: null,
      influence: 12,
      stability: 70,
      logistics: 18,
      exposure: 8,
      gamePhase: "BUILD",
      houseHealth: 70,
      campaignState: "BRIEFING",
      turnIndex: 0,
      turnTimeLeft: CAMPAIGN_PACING.turnPlanningDuration,
      commandPoints: CAMPAIGN_PACING.initialCommandPoints,
      selectedDirectiveId: null,
      selectedRegionId: null,
      activeEventId: null,
      campaignMetrics: createInitialCampaignMetrics(),
      campaignQuiz: createInitialCampaignQuiz(),
      turnLog: [],
      directiveCooldowns: {},
    });
  },

  updateStageTime: () => {
    const { stageStartTime } = get();
    if (stageStartTime) {
      set({ stageElapsedTime: Date.now() - stageStartTime });
    }
  },

  checkStageCompletion: () => {
    const { placedBlocks, currentStage, gameState } = get();
    if (gameState !== "PLAYING") return;

    const requiredCount = BLOCKS[currentStage]?.length ?? 0;
    const currentCount = placedBlocks[currentStage]?.length ?? 0;

    if (requiredCount > 0 && currentCount === requiredCount) {
      const defenseDuration = STAGE_META[currentStage]?.defenseDuration ?? 16;
      set({
        gamePhase: "DEFEND",
        defenseTimeLeft: defenseDuration,
      });
    }
  },

  transitionToQuiz: () => {
    const { currentStage, stageQuizProgress, usedQuestionIds } = get();
    const progress = stageQuizProgress[currentStage] ?? {
      asked: 0,
      correct: 0,
      usedQuestionIds: [],
    };

    const firstQuestion = pickQuestion(currentStage, progress.usedQuestionIds);
    if (!firstQuestion) {
      set({ gameState: "GAME_OVER", gamePhase: "BUILD" });
      return;
    }

    const stageQuestions = getQuestionsByStage(currentStage);
    const quizCount = Math.min(STAGE_META[currentStage].quizCount, stageQuestions.length);

    set({
      gameState: "QUIZ",
      gamePhase: "BUILD",
      currentQuestion: firstQuestion,
      stageQuizProgress: {
        ...stageQuizProgress,
        [currentStage]: {
          asked: 0,
          correct: 0,
          usedQuestionIds: [],
        },
      },
      usedQuestionIds: usedQuestionIds.includes(firstQuestion.id)
        ? usedQuestionIds
        : [...usedQuestionIds, firstQuestion.id],
      score: get().score + Math.floor(get().houseHealth / 12),
    });

    if (quizCount <= 0) {
      set({ gameState: "GAME_OVER" });
    }
  },

  advanceStage: () => {
    const { currentStage } = get();
    const currentIndex = STAGE_SEQUENCE.indexOf(currentStage as any);

    if (currentIndex < 0 || currentIndex === STAGE_SEQUENCE.length - 1) {
      set({ gameState: "WON", currentStage: STAGES.COMPLETED });
      return;
    }

    const nextStage = STAGE_SEQUENCE[currentIndex + 1];
    set({
      currentStage: nextStage,
      gameState: "PLAYING",
      stageStartTime: Date.now(),
      stageElapsedTime: 0,
      streakCount: 0,
      multiplier: 1,
    });
  },

  placeBlock: (blockType, blockData) => {
    const { currentStage, placedBlocks, score, streakCount } = get();

    if (blockType !== currentStage) {
      const penalty = get().wrongPlacementPenalty;
      set((state) => ({
        score: Math.max(0, state.score + penalty),
        streakCount: 0,
        multiplier: 1,
        lastPlacementWasCorrect: false,
        exposure: clamp(state.exposure + 4),
        stability: clamp(state.stability - 3),
        houseHealth: clamp(state.houseHealth - 3),
      }));
      return { success: false, reason: "WRONG_STAGE" };
    }

    if ((placedBlocks[currentStage]?.length ?? 0) >= (BLOCKS[currentStage]?.length ?? 0)) {
      return { success: false, reason: "FULL" };
    }

    const newStreak = streakCount + 1;
    let newMultiplier = 1;
    if (newStreak >= 3) newMultiplier = 2;
    if (newStreak >= 5) newMultiplier = 3;

    const basePoints = 6;
    const earnedPoints = basePoints * newMultiplier;
    const newPlaced = {
      ...placedBlocks,
      [currentStage]: [...(placedBlocks[currentStage] ?? []), blockData],
    };

    const nextStats = applyNodeStatEffects(blockData.nodeType, {
      influence: get().influence,
      stability: get().stability,
      logistics: get().logistics,
      exposure: get().exposure,
    });

    set({
      placedBlocks: newPlaced,
      score: score + earnedPoints,
      streakCount: newStreak,
      multiplier: newMultiplier,
      lastPlacementWasCorrect: true,
      influence: nextStats.influence,
      stability: nextStats.stability,
      logistics: nextStats.logistics,
      exposure: nextStats.exposure,
      houseHealth: nextStats.stability,
    });

    get().checkStageCompletion();
    return { success: true, points: earnedPoints, multiplier: newMultiplier };
  },

  answerQuiz: (answerIndex) => {
    const {
      currentQuestion,
      currentStage,
      score,
      stageQuizProgress,
      usedQuestionIds,
      influence,
      stability,
      logistics,
      exposure,
    } = get();

    if (!currentQuestion) return { correct: false };

    const stageQuestions = getQuestionsByStage(currentStage);
    const stageMeta = STAGE_META[currentStage];
    const quizCount = Math.min(stageMeta.quizCount, stageQuestions.length);
    const progress = stageQuizProgress[currentStage] ?? {
      asked: 0,
      correct: 0,
      usedQuestionIds: [],
    };

    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const asked = progress.asked + 1;
    const correct = progress.correct + (isCorrect ? 1 : 0);
    const usedForStage = progress.usedQuestionIds.includes(currentQuestion.id)
      ? progress.usedQuestionIds
      : [...progress.usedQuestionIds, currentQuestion.id];

    const nextInfluence = clamp(influence + (isCorrect ? 4 : 0));
    const nextStability = clamp(stability + (isCorrect ? 2 : -6));
    const nextLogistics = clamp(logistics + (isCorrect ? 2 : 0));
    const nextExposure = clamp(exposure + (isCorrect ? -4 : 8));
    const nextScore = clamp(score + (isCorrect ? 12 : -4), 0, 9999);

    const updatedProgress: StageQuizProgress = {
      asked,
      correct,
      usedQuestionIds: usedForStage,
    };

    const updatedGlobalUsed = usedQuestionIds.includes(currentQuestion.id)
      ? usedQuestionIds
      : [...usedQuestionIds, currentQuestion.id];

    const baseStateUpdate = {
      score: nextScore,
      influence: nextInfluence,
      stability: nextStability,
      logistics: nextLogistics,
      exposure: nextExposure,
      houseHealth: nextStability,
      stageQuizProgress: {
        ...stageQuizProgress,
        [currentStage]: updatedProgress,
      },
      usedQuestionIds: updatedGlobalUsed,
    };

    const explanation = currentQuestion.explanation;

    if (asked >= quizCount) {
      const passRatio = correct / Math.max(1, asked);
      const quizPassed = passRatio >= stageMeta.passRatio;
      const targetPassed = isStageTargetMet(currentStage, {
        influence: nextInfluence,
        stability: nextStability,
        logistics: nextLogistics,
        exposure: nextExposure,
      });

      if (quizPassed && targetPassed) {
        set({ ...baseStateUpdate, currentQuestion: null });
        get().advanceStage();
        return { correct: isCorrect, explanation };
      }

      set({
        ...baseStateUpdate,
        currentQuestion: null,
        gameState: "GAME_OVER",
        gamePhase: "BUILD",
      });
      return { correct: isCorrect, explanation };
    }

    const nextQuestion = pickQuestion(currentStage, usedForStage);
    if (!nextQuestion) {
      set({
        ...baseStateUpdate,
        currentQuestion: null,
        gameState: "GAME_OVER",
      });
      return { correct: isCorrect, explanation };
    }

    set({
      ...baseStateUpdate,
      currentQuestion: nextQuestion,
    });

    return { correct: isCorrect, explanation };
  },
}));
