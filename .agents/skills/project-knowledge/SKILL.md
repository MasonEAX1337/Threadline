---
name: project-knowledge
description: Read and maintain repository-owned project knowledge while planning and implementing changes. Record intent, overlap evidence, outcomes, decisions, and source provenance honestly.
---

# Project knowledge

Threadline connects intent, tasks, components, architectural flows, changes, and decisions. Use the repository records as shared context, preserve their stable IDs, and keep the distinction between a plan and implemented behavior clear.

## Contract

1. Read relevant project, manifest, components, decisions, and active tasks before implementing.
2. Planning/task-creation requests authorize recording a plan; implementation requests authorize implementation in the requested scope. Distinguish plan creation from execution without repeatedly asking for routine confirmation.
3. Record outcome, acceptance criteria, owner, affected component IDs, expected files, and assumptions in an individual task record.
4. Check shared files, changed interfaces, and incompatible assumptions against active work. Report concrete overlap evidence and coordination recommendations.
5. Separate worktrees require a configured shared publication workflow; uncommitted records are not magically visible to other agents.
6. During implementation, keep scope/status/assumptions current and preserve stable component IDs through renames.
7. Afterwards record summary, actual rationale, implementation overview, components, files, tasks, and source evidence. Record only decisions/alternatives actually considered. Update responsibilities, guarantees, paths, and relationships.
8. Use evidence states recorded, inferred, confirmed honestly. Unknown context remains unknown. Never invent rationale, revisions, test results, human approval, or guarantees.
9. Review means awaiting review; done means acceptance criteria are satisfied. Run knowledge validation, synchronization, and type checking.
10. Explain that Borrow is fictional, browser actions do not execute code or synchronize repositories, and future adapters should carry provenance and source revisions.

## Record locations and ordering

The schema and complete fictional Borrow records are preserved in `docs/product-spec.md`, Appendices A and B, and materialized under `.project/`. Individual component/task/change/decision files live in their respective subdirectories; shared records and the manifest are at the root. Respect manifest order; discover additional files deterministically after listed records. Generate typed `src/mock/` adapters and read them through async services.

Borrow's fixture records describe a fictional lending application, not Threadline's implementation. Do not attribute Threadline development changes to Borrow or manufacture Borrow revisions. Real Threadline implementation decisions belong in `docs/` until its own project knowledge is configured.

## Working with this repository

The exact Borrow records now live in `.project/`. Domain types are in `src/types/index.ts`; generated adapters are in `src/mock/`; async services are in `src/lib/services.ts`. Run `npm run knowledge:validate`, `npm run knowledge:sync`, and `npm run typecheck` after record changes. Validation and synchronization also run before development and production builds.

Browser-created tasks remain local storage overlays; Git publication is a future explicit adapter. See `docs/knowledge-branch.md` for the proposed branch publication model.
