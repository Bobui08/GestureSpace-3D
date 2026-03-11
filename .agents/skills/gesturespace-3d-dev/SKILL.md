---
name: GestureSpace-3D Development
description: Hướng dẫn phát triển dự án game 3D GestureSpace — bao gồm kiến trúc module, conventions, patterns, và quy trình làm việc chuẩn cho toàn bộ stack (Next.js + R3F + Zustand + MediaPipe).
---

# GestureSpace-3D Development Skill

## 1. Tổng Quan Dự Án

**GestureSpace-3D** là game chiến thuật 3D theo lượt (turn-based) với chủ đề lịch sử Việt Nam 1954-1965.
Người chơi đóng vai "Chỉ huy chiến dịch" (Campaign Commander), điều phối bằng **cử chỉ tay** qua webcam.

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (Pages Router) | 16.x |
| UI Runtime | React | 19.x |
| 3D Engine | Three.js + @react-three/fiber + @react-three/drei | 0.182 / 9.x / 10.x |
| State | Zustand | 5.x |
| Animation | GSAP | 3.x |
| Hand Tracking | MediaPipe Hands (CDN) | 0.4.x |
| Styling | TailwindCSS 3 + inline `React.CSSProperties` |
| Language | TypeScript (strict off, `ignoreBuildErrors: true`) |
| Font | Outfit (Google Fonts via `next/font`) |

### Cấu Trúc Thư Mục

```
bridge/                    ← Next.js app root
├── pages/                 ← Next.js pages (Pages Router)
│   ├── _app.tsx           ← Global layout, font, security handlers
│   ├── _document.tsx
│   └── index.tsx          ← Entry point renders <Game />
├── components/
│   ├── Game.tsx           ← Root component: Canvas + UI overlays
│   ├── 3d/                ← R3F 3D components (trong Canvas)
│   │   ├── Scene.tsx      ← Main game scene (hand-driven block placement)
│   │   ├── DefensePhase.tsx ← Projectile defense minigame
│   │   ├── HandModel.tsx  ← Hand landmark visualization
│   │   ├── KnowledgeBlock.tsx ← Draggable game blocks
│   │   ├── HouseZone.tsx  ← Building target zone
│   │   ├── FlagSystem.tsx ← Particle-based flag
│   │   ├── PreIntroEffect / IntroEffect / CelebrationEffect
│   │   ├── ParticleEffect / ParticleSystem
│   │   ├── ProjectileModels.tsx
│   │   └── SocialEnvironment.tsx
│   └── ui/                ← HTML overlay components (ngoài Canvas)
│       ├── HUD.tsx        ← Stats, metrics, gesture indicators
│       └── QuestionPanel.tsx ← Quiz UI
├── store/
│   └── gameStore.ts       ← Zustand store (single file, ~865 lines)
├── hooks/
│   └── useHandTracking.ts ← MediaPipe integration hook
├── data/
│   └── gameData.ts        ← Game config: stages, blocks, slots, links
├── utils/
│   └── geometry.ts        ← Math utilities (flag particles, point-in-star)
├── shaders/
│   └── stoneMaterial.ts   ← Custom GLSL shader material
├── styles/
│   ├── globals.css
│   ├── Home.module.css
│   └── quiz_temp.css
├── questions-revolution-network.json ← Question bank by stage
└── questions.json

spec/                      ← Design specs
└── P1_GAME_FOUNDATION_SPEC.md

TASK_PROGRESS.md           ← Progress tracking (BẮT BUỘC đọc trước mỗi task)
AGENTS.md                  ← Agent rules
```

---

## 2. Kiến Trúc Module & Patterns

### 2.1 State Management — Zustand Store

**File:** `bridge/store/gameStore.ts`

**Pattern:** Single-file Zustand store với `create<GameStore>()`, chứa TOÀN BỘ state + actions.

**Quy tắc:**

1. **Dual-mode architecture:** Store hỗ trợ 2 game mode:
   - `LEGACY` — Gameplay cũ (block placement + defense)
   - `COMMAND_ROOM` — Gameplay mới (turn-based campaign)
   - Field `gameMode: "LEGACY" | "COMMAND_ROOM"` quyết định flow nào active

2. **State machine rõ ràng:** Dùng union type cho game states:
   ```typescript
   type GameState = "PRE_INTRO" | "INTRO" | "PLAYING" | "QUIZ" | "WON" | "GAME_OVER";
   type CampaignState = "PRE_INTRO" | "BRIEFING" | "TURN_PLANNING" | "TURN_RESOLVE" | "INTEL_QUIZ" | "STAGE_REPORT" | "STAGE_CLEAR" | "CAMPAIGN_CLEAR" | "GAME_OVER";
   ```

3. **Interface pattern:** Luôn khai báo interface riêng cho mỗi data shape:
   ```typescript
   interface CampaignMetrics { control: number; support: number; ... }
   interface CampaignQuizProgress { askedIds: string[]; correct: number; ... }
   interface CampaignDirective { id: string; label: string; effects: Partial<CampaignMetrics>; }
   ```

4. **Helper functions NGOÀI store:**
   ```typescript
   // Khai báo pure functions bên ngoài create()
   const clamp = (value: number, min = 0, max = 100) => ...;
   const applyCampaignDelta = (metrics, delta) => ...;
   const isCampaignFailed = (metrics) => ...;
   const pickQuestion = (stageId, usedIds) => ...;

   // Store chỉ gọi helpers trong actions
   export const useGameStore = create<GameStore>((set, get) => ({ ... }));
   ```

5. **Action pattern — dùng `set` + `get`:**
   ```typescript
   commitTurnCommand: () => {
     const { campaignState, selectedDirectiveId, commandPoints } = get();
     if (campaignState !== "TURN_PLANNING") return { success: false, reason: "INVALID_STATE" };
     // ... validation
     set({ campaignState: "TURN_RESOLVE", commandPoints: commandPoints - 1 });
     return { success: true };
   },
   ```

6. **Cross-action calls:** Actions gọi actions khác qua `get()`:
   ```typescript
   advanceCampaignFlow: () => {
     // ...
     get().startCampaignTurn();  // call another action
   },
   ```

7. **Factory functions cho initial state:**
   ```typescript
   const createInitialCampaignMetrics = (): CampaignMetrics => ({ ... });
   const createEmptyPlacedBlocks = (): PlacedBlocks => ({ ... });
   ```

8. **Config constants NGOÀI store:**
   ```typescript
   const CAMPAIGN_DIRECTIVES: CampaignDirective[] = [ ... ];
   const CAMPAIGN_STAGE_TARGETS: Record<string, CampaignMetrics> = { ... };
   ```

---

### 2.2 Hand Tracking Hook

**File:** `bridge/hooks/useHandTracking.ts`

**Pattern:** Custom React hook quản lý toàn bộ lifecycle MediaPipe.

**Quy tắc:**

1. **Script loading:** Load MediaPipe từ CDN, track `scriptsLoaded` state
2. **Smoothing pipeline:** Raw landmarks → motion-adaptive lerp → cached result
   ```
   Constants: BASE_SMOOTHING=0.32, FAST_SMOOTHING=0.68, MOTION_THRESHOLD=0.03
   ```
3. **Gesture detection:** Per-frame phân loại `NONE | PINCH | OPEN | POINT | UNKNOWN`
4. **Debounce:** `GESTURE_DEBOUNCE_MS = 70` ngăn gesture flicker
5. **Hold-last-hand:** Giữ hand data thêm `220ms` sau khi mất tracking
6. **Meaningful change filter:** Chỉ gọi `setState` khi landmarks thay đổi > threshold → tránh re-render
7. **Frame throttle:** `FRAME_INTERVAL_MS = 1000/50` (20ms/frame ≈ 50fps cap)
8. **Return shape:**
   ```typescript
   return { videoRef, leftHand, rightHand, gestureLeft, gestureRight };
   ```

---

### 2.3 3D Components (R3F)

**File locations:** `bridge/components/3d/`

**Quy tắc:**

1. **Component phải nằm trong `<Canvas>`:** Tất cả component 3D dùng R3F hooks (`useFrame`, `useThree`) phải là con của `<Canvas>`.

2. **Props pattern cho hand data:**
   ```typescript
   // Component nhận hand landmarks qua props
   const Scene = ({ leftHand, rightHand, gestureLeft, gestureRight }) => { ... };
   ```

3. **Hand-to-world mapping:** Chuyển normalized coordinates → viewport world:
   ```typescript
   useFrame(({ viewport }) => {
     if (rightHand?.[8]) {
       const x = rightHand[8].x * viewport.width - viewport.width / 2;
       const y = (1 - rightHand[8].y) * viewport.height - viewport.height / 2;
       // ...
     }
   });
   ```

4. **Smoothed movement:** Dùng `lerp` cho hand cursor:
   ```typescript
   rightHandPosRef.current.lerp(rightHandTargetRef.current, 0.34);
   ```

5. **useFrame pattern:** Logic loop nằm trong `useFrame`, KHÔNG dùng `setInterval` cho 3D logic:
   ```typescript
   useFrame((state, delta) => {
     // Movement, collision, spawning
   });
   ```

6. **Die-and-remove pattern:**
   ```typescript
   const [isDead, setIsDead] = useState(false);
   useFrame(() => {
     if (isDead) return;
     // ... khi hit: setIsDead(true);
   });
   if (isDead) return null;
   ```

7. **Drei helpers:**
   - `<Text>` for 3D text
   - `<Billboard>` for camera-facing labels
   - `<OrbitControls>` for camera
   - `shaderMaterial()` for custom shaders

---

### 2.4 UI Components (HTML Overlay)

**File locations:** `bridge/components/ui/`

**Quy tắc:**

1. **Nằm NGOÀI `<Canvas>`:** UI components render HTML bình thường, overlay lên top 3D via `position: absolute; z-index`.

2. **Inline styles qua object:**
   ```typescript
   const styles: Record<string, React.CSSProperties> = {
     root: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 120 },
     // ...
   };
   ```

3. **`pointerEvents: "none"` trên root**, `pointerEvents: "auto"` trên interactive elements (buttons).

4. **Glassmorphism dark theme:**
   ```typescript
   background: "rgba(2, 6, 23, 0.78)",
   border: "1px solid rgba(148, 163, 184, 0.3)",
   borderRadius: 14,
   backdropFilter: "blur(6px)",
   ```

5. **Metrics sub-component pattern:**
   ```typescript
   const Metric = ({ label, value, color, inverse }) => (
     <div style={styles.metricCard}>
       <div style={styles.metricHeader}><span>{label}</span><span>{Math.round(value)}</span></div>
       <div style={styles.meterTrack}><div style={meterStyle(inverse ? 100 - value : value, color)} /></div>
     </div>
   );
   ```

6. **Conditional renders by gameState:**
   ```typescript
   if (gameState === "PRE_INTRO" || gameState === "INTRO") return null;
   if (gameState === "GAME_OVER") return <GameOverScreen />;
   ```

---

### 2.5 Data Layer

**File:** `bridge/data/gameData.ts`

**Quy tắc:**

1. **Const enums:**
   ```typescript
   export const STAGES = {
     STAGE_1_1954_1960: "stage_1_1954_1960",
     // ...
   } as const;
   export type StageId = (typeof STAGES)[keyof typeof STAGES];
   ```

2. **Typed config records:** Mỗi stage có metadata typed đầy đủ:
   ```typescript
   export const STAGE_META: Record<StageId, { title, shortTitle, years, image, quizCount, ... }> = { ... };
   ```

3. **Block definitions:** Mỗi block có `id`, `text`, `type` (stage), `nodeType` (function).

4. **Slot positions:** Predefined 3D positions cho placement slots.

5. **Helper function:**
   ```typescript
   export const getImagePath = (fileName: string): string => encodeURI(`/images/${fileName}`);
   ```

---

### 2.6 Shaders

**File:** `bridge/shaders/stoneMaterial.ts`

**Pattern:** Dùng drei `shaderMaterial()` + fiber `extend()`:
```typescript
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const StoneMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(...), hover: 0 },
  /* vertex GLSL */,
  /* fragment GLSL */
);
extend({ StoneMaterial });
export { StoneMaterial };
```

---

### 2.7 Utils

**File:** `bridge/utils/geometry.ts`

**Pattern:** Pure functions, no side effects. Import `three` for math types:
```typescript
import * as THREE from 'three';
export function generateFlagParticles(count: number) {
  // Returns { positions: Float32Array, colors: Float32Array, count: number }
}
```

---

## 3. Game Architecture

### 3.1 Root Component Flow

```
_app.tsx (Outfit font, security handlers)
  └── index.tsx
      └── Game.tsx
          ├── <video ref> (webcam feed, bottom-left)
          ├── <Canvas> (R3F 3D scene)
          │   └── <Suspense>
          │       ├── PRE_INTRO → <PreIntroEffect>
          │       ├── INTRO    → <IntroEffect>
          │       ├── WON      → <CelebrationEffect>
          │       ├── GAME_OVER → black bg
          │       └── PLAYING  → <SocialEnvironment> + <OrbitControls>
          │                      ├── BUILD  → <Scene> (blocks + hand)
          │                      └── DEFEND → <DefensePhase> (projectiles)
          ├── <HUD>  (metrics overlay)
          └── <QuestionPanel> (quiz overlay)
```

### 3.2 State Machine (Campaign Mode — Mới)

```
PRE_INTRO → BRIEFING → TURN_PLANNING → TURN_RESOLVE
                ↑              ↑               │
                │              │        ┌──────┴──────┐
                │              │        ↓             ↓
                │         STAGE_REPORT   INTEL_QUIZ ──→ STAGE_REPORT
                │              │                              │
                │              ├── turns remaining ──→ TURN_PLANNING
                │              ├── stage pass ──→ STAGE_CLEAR ──→ BRIEFING (next stage)
                │              ├── all stages ──→ CAMPAIGN_CLEAR
                │              └── fail ──→ GAME_OVER
```

### 3.3 Campaign Metrics

| Metric | Range | Direction | Ý nghĩa |
|---|---|---|---|
| `control` | 0-100 | Higher = better | Territorial hold |
| `support` | 0-100 | Higher = better | Population backing |
| `logistics` | 0-100 | Higher = better | Supply capacity |
| `secrecy` | 0-100 | Higher = better | Network concealment |
| `pressure` | 0-100 | **Lower = better** | Enemy intensity |

**Fail:** `pressure >= 100` HOẶC `secrecy <= 0`

---

## 4. Coding Conventions

### 4.1 File Naming
- Components: `PascalCase.tsx` (e.g., `DefensePhase.tsx`)
- Data/Utils/Hooks: `camelCase.ts` (e.g., `gameData.ts`, `useHandTracking.ts`)
- Shaders: `camelCase.ts`
- Styles: `PascalCase.module.css` hoặc `camelCase.css`

### 4.2 Export Style
- Components: `export default ComponentName;`
- Data/Utils: Named exports (`export const ...`, `export function ...`)
- Store: Named export (`export const useGameStore = create<GameStore>(...)`)
- **KHÔNG dùng** barrel exports (không có `index.ts`)

### 4.3 Import Paths
- Relative imports (`../../store/gameStore`)
- `@/styles/globals.css` (alias `@` = project root, chỉ dùng trong `_app.tsx`)
- Three.js: `import * as THREE from 'three'`

### 4.4 TypeScript
- Interfaces cho data shapes
- `as const` cho constant objects
- `Record<K, V>` cho typed maps
- `Partial<T>` cho optional updates
- Props typing là inline hoặc interface (không bắt buộc generic FC)

### 4.5 Component Pattern
```typescript
import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const MyComponent = ({ prop1, prop2 }) => {
  // 1. Store hooks
  const { action1, state1 } = useGameStore();
  // 2. Local state
  const [localState, setLocalState] = useState(initialValue);
  // 3. Refs
  const meshRef = useRef<THREE.Mesh>(null);
  // 4. Effects
  useEffect(() => { ... }, [deps]);
  // 5. Frame loop (3D only)
  useFrame((state, delta) => { ... });
  // 6. Handlers
  const handleAction = () => { ... };
  // 7. Render
  return ( ... );
};

export default MyComponent;
```

---

## 5. Quy Trình Làm Việc

### 5.1 Trước Mỗi Task

1. **ĐỌC** `TASK_PROGRESS.md` — xác nhận phase hiện tại và task tiếp theo
2. **CẬP NHẬT** task status sang `IN_PROGRESS`
3. Kiểm tra `spec/P1_GAME_FOUNDATION_SPEC.md` nếu cần context thiết kế

### 5.2 Khi Tạo Module Mới

1. **Xác định layer:** 3D component, UI component, store extension, hook, data, util, hay shader?
2. **Đặt file đúng thư mục** theo cấu trúc ở mục 1
3. **Tuân theo patterns** của layer tương ứng (mục 2)
4. **Kết nối store:** Import `useGameStore`, dùng selectors, gọi actions
5. **Test:** `npm run dev` trong `bridge/`, check browser console

### 5.3 Khi Sửa Store

1. Thêm type/interface nếu có data shape mới
2. Thêm initial state vào `create()` object
3. Thêm action declarations vào `GameStore` interface
4. Implement action, validation state trước khi mutate
5. Helpers/pure functions đặt NGOÀI `create()`

### 5.4 Khi Tạo 3D Component

1. Đặt trong `components/3d/`
2. Nhận hand data qua props (KHÔNG tự import hook)
3. Dùng `useFrame` cho animation/collision, KHÔNG `setInterval`
4. Smoothing: `ref.lerp(target, factor)` với factor 0.2-0.4
5. Cleanup: Component tự cleanup khi `isDead` hoặc unmount

### 5.5 Khi Tạo UI Component

1. Đặt trong `components/ui/`
2. Dùng inline `React.CSSProperties` hoặc TailwindCSS
3. Dark glassmorphism theme
4. `pointerEvents: "none"` trên root overlay
5. Conditional render theo `gameState` / `campaignState`

### 5.6 Sau Mỗi Task

1. **CẬP NHẬT** `TASK_PROGRESS.md` → task status = `DONE`
2. Thêm entry vào Progress Log
3. Nếu tất cả tasks trong phase = `DONE` → close phase, mở phase tiếp

---

## 6. Lệnh Thường Dùng

```bash
# Dev server
cd bridge && npm run dev

# Build (chỉ khi cần verify)
cd bridge && npm run build

# Install dependencies
cd bridge && npm install
```

---

## 7. Checklist Khi Review Code

- [ ] Có đọc `TASK_PROGRESS.md` chưa?
- [ ] File đặt đúng thư mục?
- [ ] Interface / type khai báo cho data shapes mới?
- [ ] Store actions có validate state trước khi mutate?
- [ ] 3D component có dùng `useFrame` thay vì `setInterval`?
- [ ] UI overlay có `pointerEvents: "none"` trên root?
- [ ] Hand data truyền qua props (không import hook trực tiếp trong 3D components)?
- [ ] Constants/helpers đặt ngoài `create()`?
- [ ] Export style đúng (default cho components, named cho data/utils)?
- [ ] Cập nhật `TASK_PROGRESS.md` sau khi hoàn thành?
