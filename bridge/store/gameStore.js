import { create } from 'zustand'

const useGameStore = create((set, get) => ({
    // Hands State: Array of { landmarks: [], gesture: 'IDLE', isDetected: false, id: index }
    hands: [],

    // Update all hands at once
    setHands: (handsData) => set({ hands: handsData }),

    // Hand Busy State (to prevent multi-grab)
    busyHands: {}, // { handId: true/false }
    setHandBusy: (handId, isBusy) => set(state => ({
        busyHands: { ...state.busyHands, [handId]: isBusy }
    })),

    // Deprecated single hand setters (keep for compatibility if needed, but better to remove)
    handPosition: [0, 0, 0], // Keep for backward compat until full cleanup
    gesture: 'IDLE',
    // Hand Busy State (to prevent multi-grab)
    busyHands: {}, // { handId: true/false }
    setHandBusy: (handId, isBusy) => set(state => ({
        busyHands: { ...state.busyHands, [handId]: isBusy }
    })),

    isHandDetected: false,
    setHandData: (pos, rot, gesture, detected) => set({
        handPosition: pos,
        handRotation: rot,
        gesture: gesture,
        isHandDetected: detected
    }),

    // Quiz State
    quizOpen: false,
    currentQuestion: null,
    questions: [], // Will load from JSON

    setQuizOpen: (isOpen) => set({ quizOpen: isOpen }),
    loadQuestions: (qs) => set({ questions: qs }),

    // Game State
    category: 'TRADITIONAL',
    score: 0,

    // Pillars with specific requirements from rules-game.md
    // Pairs:
    // 1. Tôn trọng người lớn (Trad) + Giao tiếp hai chiều (Mod)
    // 2. Hiếu thảo (Trad) + Tự chủ cá nhân (Mod)
    // 3. Ổn định gia đình (Trad) + Bình đẳng giới (Mod)
    // 4. Giữ gìn văn hóa (Trad) + Hôn nhân tự nguyện (Mod)
    // 5. Lắng nghe - nhẫn nhịn (Trad) + Phát triển kinh tế (Mod)
    pillars: [
        { id: 0, requiredTrad: 'Tôn trọng người lớn', requiredMod: 'Giao tiếp hai chiều', traditional: null, modern: null, completed: false },
        { id: 1, requiredTrad: 'Hiếu thảo', requiredMod: 'Tự chủ cá nhân', traditional: null, modern: null, completed: false },
        { id: 2, requiredTrad: 'Ổn định gia đình', requiredMod: 'Bình đẳng giới', traditional: null, modern: null, completed: false },
        { id: 3, requiredTrad: 'Giữ gìn văn hóa', requiredMod: 'Hôn nhân tự nguyện', traditional: null, modern: null, completed: false }
    ],

    stones: [],

    placeStone: (stoneId, type, pillarId, stoneValue) => {
        const state = get()
        const pillars = [...state.pillars]
        const pillar = pillars[pillarId]

        // Check compatibility
        // stoneValue must match requiredTrad or requiredMod
        if (type === 'TRADITIONAL') {
            if (stoneValue !== pillar.requiredTrad) return false
            if (pillar.traditional) return false
            pillar.traditional = stoneId
        } else {
            if (stoneValue !== pillar.requiredMod) return false
            if (pillar.modern) return false
            pillar.modern = stoneId
        }

        // Check completion
        if (pillar.traditional && pillar.modern) {
            pillar.completed = true
            set((state) => ({ score: state.score + 10 }))

            // Trigger Quiz
            // Select random question
            const q = state.questions[Math.floor(Math.random() * state.questions.length)]
            set({ quizOpen: true, currentQuestion: q })
        }

        set({ pillars })
        return true
    },

    removeStone: (stoneId) => {
        // If stone was in a pillar, remove it
        const pillars = get().pillars.map(p => {
            if (p.traditional === stoneId) return { ...p, traditional: null, completed: false }
            if (p.modern === stoneId) return { ...p, modern: null, completed: false }
            return p
        })
        set({ pillars })
    },

    setCategory: (cat) => set({ category: cat }),
}))

export default useGameStore
