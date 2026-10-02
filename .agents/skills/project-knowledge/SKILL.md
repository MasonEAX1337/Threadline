---
name: project-knowledge
description: Maintain repository-owned project plans, component knowledge, and implementation decisions while coordinating work with other developers and agents.
---

# Project knowledge

This repository demonstrates an agent-maintained knowledge contract using the fictional Borrow project. When adopting this skill in a real project, replace Borrow records with evidence from that repository. Do not claim the sample services are implemented in this frontend.

## Interpret intent

- "Create a task", "plan", or "add this to the board" authorizes planning and record creation, not implementation.
- "Implement", "build", or "fix" authorizes implementation within the requested scope and corresponding knowledge updates.
- Create and update routine records without repeated confirmation. Ask only when a material ambiguity blocks the requested work.

## Before implementation

1. Read `.project/project.json`, `.project/manifest.json`, relevant `.project/components/`, `.project/decisions/`, and active `.project/tasks/` records.
2. Record the requested outcome, acceptance criteria, assignee, affected component IDs, expected file paths, and implementation assumptions in one task file.
3. Check active tasks for shared files, changed interfaces, and incompatible assumptions. State concrete evidence and a coordination recommendation; overlap does not guarantee a merge conflict.
4. If other agents work on separate branches, publish the plan through the team's configured shared planning workflow. Uncommitted records in one worktree are not visible in another. This prototype has no shared coordination service.

## During implementation

- Move authorized work to `in-progress`. Keep scope, blockers, and assumptions current as implementation changes.
- Preserve stable component IDs. A rename should not create a second conceptual component.
- Coordinate shared contracts before changing them. Record agreed implementation order or exceptions as task assumptions.
- Update the individual task record, not a central append-only list.

## After implementation

1. Record the result in `.project/changes/<change-id>.json`: summary, stated rationale, implementation overview, affected components, source files, related task IDs, and source evidence.
2. Record explicit architectural decisions and alternatives actually considered in `.project/decisions/`. Do not manufacture motivation, rejected alternatives, review, test results, or source revisions. Label inferred claims as inferred.
3. Update affected component responsibilities, guarantees, paths, and relationships in `.project/architecture.json`.
4. Link tasks, changes, decisions, and components using existing IDs. `review` means awaiting review; `done` means the task's stated acceptance criteria are satisfied. Record validation accurately.
5. Run `npm run knowledge:validate`, then `npm run knowledge:sync` and `npm run typecheck`. The sync command generates frontend adapters and discovers newly added record files.

## Data boundaries

- `.project/` is the version-controlled knowledge source of truth.
- `src/mock/` contains generated, typed adapters. Edit repository records instead of generated adapters.
- Frontend drag-and-drop, task drafts, preferences, and session changes persist only in browser localStorage. They do not write Git files, publish plans, or execute implementation.
- The prototype task planner uses deterministic domain templates. It is not an inference integration.
- A real adapter should submit structured updates with source revisions and provenance. Keep provider-specific APIs outside UI components.

## Task record shape

Use the `Task` interface in `src/types/index.ts`. Required fields include `id`, `title`, `description`, `status`, `assigneeId`, `labels`, `componentIds`, `relatedChangeIds`, `milestoneId`, `acceptanceCriteria`, `assumptions`, `resources`, and `agentCreated`. IDs must be unique; references must resolve.

## Knowledge integrity

Evidence states are `recorded`, `inferred`, and `confirmed`. Unknown context remains unknown. A generated explanation never counts as evidence of implementation or a human decision. Link recorded rationale to a PR, issue, approved design, or decision record; use real revisions once connected to a real repository.
