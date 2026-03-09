import { create } from "zustand";
import questionBank from "../questions-revolution-network.json";
import { BLOCKS, STAGES, STAGE_META, STAGE_SEQUENCE, type GameBlock } from "../data/gameData";

type GameState = "PRE_INTRO" | "INTRO" | "PLAYING" | "QUIZ" | "WON" | "GAME_OVER";

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

interface PlacedBlocks {
  [key: string]: GameBlock[];
}

interface GameStore {
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

  setGameState: (state: GameState) => set({ gameState: state }),

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
