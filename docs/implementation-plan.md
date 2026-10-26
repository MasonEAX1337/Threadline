# Implementation stages

Each stage should contain focused, reviewable commits and be verified before pushing. The user requested frequent pushes of coherent changes. Only stage 1 is currently implemented.

1. **Foundation — implemented.** Next.js App Router, pinned stack and lockfile, TypeScript, lint/format/build scripts, local Inter with its license, visual tokens, initial Radix UI primitives, repository guidance, CI, and browser smoke tests. The current `/` is a temporary foundation screen, not the Borrow overview.
2. **Knowledge — next.** Materialize Appendix B exactly, define Appendix A types, discover files in manifest order, implement validation and generated adapters, and expose isolated async service snapshots. Add validation/synchronization to the build lifecycle.
3. **Workspace.** Persistent shell/provider, responsive navigation, Borrow overview, browser persistence, project previews, and mock session.
4. **Planning.** Live board/milestones, deterministic planner, overlap detection, task editing, coordination notes, and drag/drop with keyboard alternatives.
5. **Exploration.** Hierarchical codebase graph, behavioral architecture flows, narrative activity/change detail, and decision memory.
6. **Completion.** Team/expertise, global search, notifications, settings/reset, full stateful browser tests, responsive review, and documentation update.

The original detailed specification and fictional data are preserved in `product-spec.md`. Later conversation added the future knowledge-branch design in `knowledge-branch.md`; actual multi-developer publication is outside the frontend prototype.
