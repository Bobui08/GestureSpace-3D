/**
 * TEMPLATE: Cách mở rộng gameStore.ts
 *
 * File store: bridge/store/gameStore.ts
 *
 * Khi cần thêm feature mới vào store, follow pattern này:
 *
 * 1. Khai báo interface cho data shape mới
 * 2. Thêm helper/pure functions NGOÀI create()
 * 3. Thêm fields và actions vào GameStore interface
 * 4. Implement trong create() body
 * 5. Factory function cho initial state
 */

// ============================================================
// BƯỚC 1: Interface cho data shape mới
// ============================================================
interface NewFeatureState {
  fieldA: number;
  fieldB: string;
  items: NewItem[];
}

interface NewItem {
  id: string;
  label: string;
  value: number;
}

// ============================================================
// BƯỚC 2: Helper functions NGOÀI create()
// ============================================================
const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const createInitialNewFeature = (): NewFeatureState => ({
  fieldA: 0,
  fieldB: "default",
  items: [],
});

const calculateSomething = (items: NewItem[]): number =>
  items.reduce((sum, item) => sum + item.value, 0);

// Config constants
const NEW_FEATURE_CONFIG = {
  maxItems: 10,
  cooldownMs: 3000,
} as const;

// ============================================================
// BƯỚC 3: Thêm vào GameStore interface (trong file thực tế)
// ============================================================
/*
interface GameStore {
  // ... existing fields ...

  // NEW: Feature XYZ
  newFeature: NewFeatureState;
  addItem: (item: NewItem) => { success: boolean; reason?: string };
  removeItem: (id: string) => void;
  resetNewFeature: () => void;
}
*/

// ============================================================
// BƯỚC 4: Implement trong create() body
// ============================================================
/*
export const useGameStore = create<GameStore>((set, get) => ({
  // ... existing state ...

  // NEW: initial state
  newFeature: createInitialNewFeature(),

  // NEW: actions
  addItem: (item) => {
    const { newFeature, campaignState } = get();

    // VALIDATE state trước khi mutate
    if (campaignState !== "TURN_PLANNING") {
      return { success: false, reason: "INVALID_STATE" };
    }
    if (newFeature.items.length >= NEW_FEATURE_CONFIG.maxItems) {
      return { success: false, reason: "MAX_ITEMS" };
    }

    // MUTATE via set()
    set({
      newFeature: {
        ...newFeature,
        items: [...newFeature.items, item],
        fieldA: clamp(calculateSomething([...newFeature.items, item])),
      },
    });

    return { success: true };
  },

  removeItem: (id) => {
    const { newFeature } = get();
    set({
      newFeature: {
        ...newFeature,
        items: newFeature.items.filter((item) => item.id !== id),
      },
    });
  },

  resetNewFeature: () => set({ newFeature: createInitialNewFeature() }),
}));
*/

// ============================================================
// BƯỚC 5: Cập nhật startGame / startCampaignMode reset new state
// ============================================================
/*
startGame: () => {
  set({
    // ... existing resets ...
    newFeature: createInitialNewFeature(),  // ← RESET mới
  });
},
*/

export {}; // Placeholder export
