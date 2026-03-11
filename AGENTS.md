# AGENTS.md

## Mandatory Workflow Rule
- Before starting any new task, Codex must read `TASK_PROGRESS.md`.
- Codex must update `TASK_PROGRESS.md` immediately after:
  - starting a phase/task (`IN_PROGRESS`),
  - completing a task (`DONE`),
  - or hitting a blocker (`BLOCKED`).
- Codex must keep progress status accurate in every turn where work is performed.

## Execution Checklist (Every New Task)
1. Open and read `TASK_PROGRESS.md`.
2. Confirm current active phase and next actionable task.
3. Execute the task.
4. Update task and phase statuses in `TASK_PROGRESS.md`.
5. Add a short entry to the Progress Log section.

## Scope
- These rules apply to all implementation, refactor, test, and documentation tasks in this repository.

