# P1 Game Foundation Spec

Date: 2026-03-09
Scope: P1-T1, P1-T2, P1-T3, P1-T4
Related data source: `bridge/questions-revolution-network.json`

## 1) Product Direction (P1-T1)

Game concept finalized: **Command Room 1954-1965**

High-level pitch:
- Player is not "builder" anymore.
- Player is "campaign commander" making strategic decisions by turns.
- Core action is command planning + command execution, not drag-drop blocks.
- Quiz is now integrated as an intelligence system that changes decision power.

Hard differentiation from old game:
- No block placement loop.
- No projectile defense loop.
- No "build -> defend -> quiz" structure.
- New structure is "briefing -> turn planning -> turn resolve -> intel quiz -> report".

## 2) State Machine (P1-T2)

Canonical state machine:
- `PRE_INTRO`
- `BRIEFING`
- `TURN_PLANNING`
- `TURN_RESOLVE`
- `INTEL_QUIZ`
- `STAGE_REPORT`
- `STAGE_CLEAR`
- `CAMPAIGN_CLEAR`
- `GAME_OVER`

Transition rules:
- `PRE_INTRO -> BRIEFING` when player starts session.
- `BRIEFING -> TURN_PLANNING` when briefing is acknowledged.
- `TURN_PLANNING -> TURN_RESOLVE` when player commits command.
- `TURN_RESOLVE -> INTEL_QUIZ` on quiz checkpoints (turn 2/4/6) or critical event.
- `TURN_RESOLVE -> STAGE_REPORT` on non-quiz turns after simulation.
- `INTEL_QUIZ -> STAGE_REPORT` after answer + simulation effect.
- `STAGE_REPORT -> TURN_PLANNING` if stage not finished and not failed.
- `STAGE_REPORT -> STAGE_CLEAR` when stage objectives met at final turn.
- `STAGE_REPORT -> GAME_OVER` when fail condition met.
- `STAGE_CLEAR -> BRIEFING` for next stage.
- `STAGE_CLEAR -> CAMPAIGN_CLEAR` after stage 3.

Per-stage pacing:
- 6 turns per stage.
- 25-35 seconds planning window per turn.
- 3 quiz checkpoints per stage by default (turn 2, 4, 6).

## 3) Win/Lose Metrics (P1-T3)

Primary runtime metrics:
- `control` (0-100): territorial/operational hold.
- `support` (0-100): population and political backing.
- `logistics` (0-100): transport and supply capacity.
- `secrecy` (0-100): network concealment level.
- `pressure` (0-100): enemy pressure and crisis intensity.

Interpretation:
- Higher is better for `control`, `support`, `logistics`, `secrecy`.
- Higher is worse for `pressure`.

Global fail conditions:
- `pressure >= 100`, or
- `secrecy <= 0`, or
- mission critical objective missed at turn 6.

Stage clear thresholds (initial balancing targets):
- Stage 1:
  - `control >= 45`
  - `support >= 50`
  - `logistics >= 35`
  - `secrecy >= 40`
  - `pressure <= 70`
- Stage 2:
  - `control >= 60`
  - `support >= 58`
  - `logistics >= 52`
  - `secrecy >= 45`
  - `pressure <= 75`
- Stage 3:
  - `control >= 75`
  - `support >= 65`
  - `logistics >= 62`
  - `secrecy >= 50`
  - `pressure <= 78`

Question impact model:
- Correct answer:
  - `control +4`
  - `support +4`
  - `secrecy +3`
  - `pressure -6`
  - `commandPoints +1`
- Wrong answer:
  - `support -4`
  - `secrecy -6`
  - `pressure +8`
  - temporary lock one command category for next turn

## 4) Implementation Spec: Components + Data Flow (P1-T4)

### 4.1 New module layout

Add new UI/gameplay modules:
- `bridge/components/command-room/CommandRoomRoot.tsx`
- `bridge/components/command-room/BriefingPanel.tsx`
- `bridge/components/command-room/TimelineFeed.tsx`
- `bridge/components/command-room/CommandMap.tsx`
- `bridge/components/command-room/DirectiveDeck.tsx`
- `bridge/components/command-room/IntelConsole.tsx`
- `bridge/components/command-room/StageReport.tsx`
- `bridge/components/command-room/CampaignResult.tsx`
- `bridge/components/command-room/TurnTimer.tsx`
- `bridge/components/command-room/GestureIntentHUD.tsx`

Add domain configs:
- `bridge/data/campaignConfig.ts` (stage thresholds, event pools, turn rules)
- `bridge/data/directiveCatalog.ts` (commands and their metric deltas)

### 4.2 Store shape changes

Create/extend campaign store state:
- `campaignState`
- `currentStage`
- `turnIndex`
- `turnTimeLeft`
- `commandPoints`
- `activeEvent`
- `selectedDirective`
- `selectedRegion`
- `metrics { control, support, logistics, secrecy, pressure }`
- `quizState { currentQuestionId, askedIds, correctCount, wrongCount }`

Core store actions:
- `startCampaign()`
- `startStage(stageId)`
- `startTurn()`
- `selectDirective(directiveId)`
- `selectRegion(regionId)`
- `commitTurnCommand()`
- `resolveTurnOutcome()`
- `enterQuizCheckpoint()`
- `submitQuizAnswer(index)`
- `advanceAfterReport()`

### 4.3 Question integration contract

Input:
- existing `bridge/questions-revolution-network.json`

Rules:
- only draw questions by current `stageId`.
- avoid repetition in same stage until pool exhausted.
- quiz checkpoints triggered by turn rules, not by placement milestones.

Output effects:
- update metrics and command economy immediately after answer.
- store historical answer log for stage report.

### 4.4 Gesture intent contract

Raw input:
- `leftHand`, `rightHand`, `gestureLeft`, `gestureRight`

Derived intents:
- `allocate_resource`
- `select_region`
- `cycle_directive`
- `commit_command`
- `cancel_action`
- `emergency_policy`

Intent layer is an adapter between hand tracking and command-room store.

### 4.5 UI Direction

Visual identity:
- War-room tactical board style.
- 3-column layout with strong hierarchy.
- CRT/radar/situation-room language, no floating neon block cards.

Core screen composition:
- Left: timeline + live event feed.
- Center: command map and impact overlays.
- Right: directive deck + resource sliders + commit action.
- Bottom: turn timer + gesture intent hints + mini stat strip.

## 5) P1 Acceptance Criteria

P1 is complete when:
- New concept and gameplay identity are documented and fixed.
- State machine is defined with transition rules.
- Win/lose metrics and stage thresholds are defined.
- Technical blueprint for component and store/data flow is documented.
- Ready to execute P2 without re-opening foundational decisions.

## 6) Next Phase Entry Conditions (for P2)

Before starting P2:
- user approves this foundation spec.
- no unresolved ambiguity in state names, metrics, and quiz impact rules.
- `TASK_PROGRESS.md` is updated to close P1 and open P2.

