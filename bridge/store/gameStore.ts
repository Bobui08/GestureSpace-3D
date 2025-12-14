import { create } from 'zustand';
import { BLOCKS, STAGES, QUESTIONS } from '../data/gameData';

type GameState = 'PRE_INTRO' | 'INTRO' | 'PLAYING' | 'QUIZ' | 'WON' | 'GAME_OVER';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    hint: string;
}

interface Block {
    id: string;
    text: string;
    type: string;
}

interface PlacedBlocks {
    [key: string]: Block[];
}

interface GameStore {
    gameState: GameState;
    score: number;
    currentStage: string;
    placedBlocks: PlacedBlocks;
    currentQuestion: Question | null;

    stageStartTime: number | null;
    stageElapsedTime: number;
    streakCount: number;
    multiplier: number;
    lastPlacementWasCorrect: boolean;
    wrongPlacementPenalty: number;
    usedQuestionIds: string[];
    setGameState: (state: GameState) => void;
    startGame: () => void;
    updateStageTime: () => void;
    checkStageCompletion: () => void;
    transitionToQuiz: () => void;
    advanceStage: () => void;

    placeBlock: (blockType: string, blockData: Block) => { success: boolean; reason?: string; points?: number; multiplier?: number };
    answerQuiz: (answerIndex: number) => { correct: boolean; hint?: string };

    // Total Time Tracking
    gameStartTime: number | null;


    // Defense Phase
    gamePhase: 'BUILD' | 'DEFEND';
    houseHealth: number;
    defenseTimeLeft: number;
    setGamePhase: (phase: 'BUILD' | 'DEFEND') => void;
    damageHouse: (amount: number) => void;
    healHouse: (amount: number) => void;
    setDefenseTime: (time: number) => void;
    decrementDefenseTime: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: 'PRE_INTRO',
    gameStartTime: null,
    score: 0,
    currentStage: STAGES.FOUNDATION,
    placedBlocks: {
        [STAGES.FOUNDATION]: [],
        [STAGES.PILLARS]: [],
        [STAGES.WALLS]: [],
        [STAGES.ROOF]: [],
    },
    currentQuestion: null,



    // Timer & Streak System
    stageStartTime: null,
    stageElapsedTime: 0,
    streakCount: 0,
    multiplier: 1,
    lastPlacementWasCorrect: false,
    wrongPlacementPenalty: -3,

    // Track used questions to prevent repetition
    usedQuestionIds: [],

    // Defense Init
    gamePhase: 'BUILD',
    houseHealth: 100,
    defenseTimeLeft: 30,

    setGameState: (state: GameState) => set({ gameState: state }),
    setGamePhase: (phase) => set({ gamePhase: phase }),
    damageHouse: (amount) => set((state) => {
        const newHealth = Math.max(0, state.houseHealth - amount);
        if (newHealth <= 0) {
            // House destroyed!
            return { houseHealth: 0, gameState: 'GAME_OVER', gamePhase: 'BUILD' };
        }
        return { houseHealth: newHealth };
    }),
    healHouse: (amount) => set((state) => ({ houseHealth: Math.min(100, state.houseHealth + amount) })),
    setDefenseTime: (time) => set({ defenseTimeLeft: time }),
    decrementDefenseTime: () => set((state) => ({ defenseTimeLeft: Math.max(0, state.defenseTimeLeft - 1) })),

    startGame: () => {
        set({
            gameState: 'PLAYING',
            score: 0,
            currentStage: STAGES.FOUNDATION,
            placedBlocks: {
                [STAGES.FOUNDATION]: [],
                [STAGES.PILLARS]: [],
                [STAGES.WALLS]: [],
                [STAGES.ROOF]: []
            },
            streakCount: 0,
            multiplier: 1,
            stageStartTime: Date.now(),
            gameStartTime: Date.now(),
            stageElapsedTime: 0,
            usedQuestionIds: [],
            currentQuestion: null,

            // Defense Reset
            gamePhase: 'BUILD',
            houseHealth: 100
        });


    },


    updateStageTime: () => {
        const { stageStartTime } = get();
        if (stageStartTime) {
            set({ stageElapsedTime: Date.now() - stageStartTime });
        }
    },

    checkStageCompletion: () => {
        const { placedBlocks, currentStage, stageElapsedTime, score, gameState } = get();

        // Prevent multiple triggers - allow check if in PLAYING state
        if (gameState !== 'PLAYING') return;

        const requiredCount = BLOCKS[currentStage].length;
        const currentCount = placedBlocks[currentStage].length;

        console.log(`Stage completion check: ${currentCount}/${requiredCount}`);

        // Only trigger when EXACTLY reaching required count
        if (currentCount === requiredCount) {
            console.log(`Stage ${currentStage} completed! Triggering Defense Phase.`);

            // Trigger Defense Phase
            set({
                gamePhase: 'DEFEND',
                defenseTimeLeft: 20, // 20 seconds defense
            });
        }
    },

    // Helper to transition from Defense -> Quiz
    transitionToQuiz: () => {
        const { placedBlocks, currentStage, stageElapsedTime, score, usedQuestionIds } = get();

        // Bonus for high health?
        const { houseHealth } = get();
        const healthBonus = Math.floor(houseHealth / 10);

        // Time bonus
        const timeInSeconds = stageElapsedTime / 1000;
        let timeBonus = 0;
        if (timeInSeconds < 30) timeBonus = 20;

        const finalScore = score + timeBonus + healthBonus;

        // Trigger Quiz
        const availableQuestions = QUESTIONS.filter(q => !usedQuestionIds.includes(q.id));
        const pool = availableQuestions.length > 0 ? availableQuestions : QUESTIONS;
        const randomQ = pool[Math.floor(Math.random() * pool.length)];

        set({
            gameState: 'QUIZ',
            gamePhase: 'BUILD',
            currentQuestion: randomQ,
            score: finalScore,
            usedQuestionIds: [...usedQuestionIds, randomQ.id]
        });
    },

    advanceStage: () => {
        const { currentStage } = get();
        let nextStage = currentStage;
        if (currentStage === STAGES.FOUNDATION) nextStage = STAGES.PILLARS;
        else if (currentStage === STAGES.PILLARS) nextStage = STAGES.WALLS;
        else if (currentStage === STAGES.WALLS) nextStage = STAGES.ROOF;
        else if (currentStage === STAGES.ROOF) {
            set({ gameState: 'WON' });
            return;
        }
        set({
            currentStage: nextStage,
            gameState: 'PLAYING',
            stageStartTime: Date.now(),
            stageElapsedTime: 0,
            streakCount: 0,
            multiplier: 1
        });
    },

    placeBlock: (blockType: string, blockData: Block) => {
        const { currentStage, placedBlocks, score, streakCount, multiplier } = get();

        // Validate: Block type must match current stage
        if (blockType !== currentStage) {
            // WRONG PLACEMENT - Apply penalty and break streak
            set({
                score: Math.max(0, score + get().wrongPlacementPenalty),
                streakCount: 0,
                multiplier: 1,
                lastPlacementWasCorrect: false
            });
            return { success: false, reason: 'WRONG_STAGE' };
        }

        // Validate: Check if already full
        if (placedBlocks[currentStage].length >= BLOCKS[currentStage].length) {
            return { success: false, reason: 'FULL' };
        }

        // CORRECT PLACEMENT
        // Increase streak and multiplier
        const newStreak = streakCount + 1;
        let newMultiplier = 1;
        if (newStreak >= 3) newMultiplier = 2;
        if (newStreak >= 5) newMultiplier = 3;

        // Calculate score with multiplier
        const basePoints = 5;
        const earnedPoints = basePoints * newMultiplier;

        // Add block
        const newPlaced = { ...placedBlocks, [currentStage]: [...placedBlocks[currentStage], blockData] };
        set({
            placedBlocks: newPlaced,
            score: score + earnedPoints,
            streakCount: newStreak,
            multiplier: newMultiplier,
            lastPlacementWasCorrect: true
        });

        get().checkStageCompletion();
        return { success: true, points: earnedPoints, multiplier: newMultiplier };
    },

    answerQuiz: (answerIndex: number) => {
        const { currentQuestion, score } = get();
        if (!currentQuestion) return { correct: false };

        const isCorrect = answerIndex === currentQuestion.correctAnswer;

        if (isCorrect) {
            set({ score: score + 10, currentQuestion: null });
            get().advanceStage();
            return { correct: true };
        } else {
            set({ score: Math.max(0, score - 5) });
            return { correct: false, hint: currentQuestion.hint };
        }
    },


}));
