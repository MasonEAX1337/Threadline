# Verification record

Verified locally on October 26, 2026 against the production build, with Node 24 and the committed npm lockfile.

- `npm run check`: passed knowledge validation, ESLint, TypeScript, all 9 unit tests, and formatting.
- `npm run test:e2e`: production build passed; 85 browser tests passed across desktop Chromium, mobile Chromium, and mobile WebKit. Two native desktop drag tests were intentionally skipped in the touch projects; status editing was tested on both mobile engines.
- `git diff --check`: passed.
- All 67 repository JSON records compare exactly with the supplied Appendix B. Manifest order and discovery of unlisted files are tested.

## Stateful product coverage

| Requested workflow                                                                                        | Evidence                                                                                |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Initial 8 contributors / 38 components / 8 active tasks / 6 changes, 12 tasks, 33% sprint                 | `product.spec.ts`, `knowledge.test.ts`                                                  |
| Waitlist request → contract warning → renamed Ready task → Review → coordination note → reload            | `product.spec.ts`                                                                       |
| Lending history → Create & start → In progress, with honest simulated-execution copy                      | `product.spec.ts`                                                                       |
| Reverse immediate-return conflict, unrelated request with no invented scope                               | `completion.spec.ts`, `knowledge.test.ts`                                               |
| Eight systems → two Borrowing modules → Loan lifecycle → LoanService → ADR alternatives → requestLoan()   | `exploration.spec.ts`, `state.test.ts`                                                  |
| Search LoanService → focused inspector → two-entry Activity filter → empty result → clear to six          | `exploration.spec.ts`                                                                   |
| Native drag to Done, reload, updated counters; accessible status selector                                 | `completion.spec.ts`, `product.spec.ts`                                                 |
| Milestone progress reacts to status and assignment changes                                                | `product.spec.ts`, `resilience.spec.ts`                                                 |
| Return flow guarantee, ReturnService inspector, child function exploration                                | `exploration.spec.ts`, `resilience.spec.ts`                                             |
| All-read and individual notification dismissal survive refresh                                            | `product.spec.ts`, `resilience.spec.ts`                                                 |
| Sign-out protects direct visits; GitHub/email mock entry; credentials not sent or stored                  | `product.spec.ts`, `completion.spec.ts`                                                 |
| Density/inference preferences persist, no external inference calls, confirmed reset preserves preferences | `completion.spec.ts`                                                                    |
| Project preview and Explore Borrow return                                                                 | `product.spec.ts`                                                                       |
| Search keyboard wrapping/Escape, component/task/member/flow deep links, missing routes/changes            | `completion.spec.ts`, `exploration.spec.ts`, `foundation.spec.ts`, `resilience.spec.ts` |
| All seven main screens at 390 × 844 without document overflow, mobile navigation opens/routes/closes      | `completion.spec.ts`, `foundation.spec.ts`                                              |
| Corrupt/unavailable browser storage, immutable seed fallback, owner/profile updates, task-link dismissal  | `resilience.spec.ts`, `state.test.ts`                                                   |

## Visual review

Reviewed the running UI in the browser at desktop size and 390 × 844: overview hierarchy and counts, codebase nodes/inspector, architecture selectors, board cards/scrolling, team cards, Activity filters/narratives, and Settings wrapping. Corrected narrow mobile Activity filters, contributor toolbar spacing, profile work rows, off-canvas keyboard exposure, and missing green token references. Restored the browser to its desktop viewport after review.

The graph interaction regression was caused by React Flow temporarily hiding selected nodes while remeasuring them. Explicit deterministic node dimensions preserve the double-click target. The browser hierarchy test covers this path on all three projects.

## Deliberate boundaries

No GitHub synchronization, real inference, OAuth, code execution, worktree publication, or lending backend is implemented or claimed. Browser state is local, with no shared-device or cross-tab reconciliation guarantee. Borrow source links are illustrative. The future dedicated knowledge branch is described in `knowledge-branch.md`; the app does not silently publish to it.

Tests validate the requested prototype behaviors; they are not a production security or authentication certification. GitHub Actions runs the same checks on each pushed revision.
