# Threadline

**Shared context for teams that build with agents.**

Threadline connects development intent, tasks, components, architecture, changes, and recorded decisions in one developer workspace. **Borrow** is the fictional sample project: “Share more. Buy less. Borrow from your neighbors.” This is an interactive frontend prototype, with repository-owned knowledge and persistent browser edits.

## Run locally

Use Node.js 24 and npm 11. No API keys, credentials, or environment variables are required.

```sh
nvm use
npm ci
npm run dev
```

Open http://localhost:3000. For a production server:

```sh
npm run build
npm start
```

Both development and production builds validate the knowledge records and regenerate typed adapters first. Direct dependencies and `package-lock.json` are pinned; use `npm ci` for reproducible installs.

## Try the main workflow

1. Choose **Describe work → Waitlist offers → Draft task**. Inspect the concrete disagreement with BRW-42 about who gets first choice after a return.
2. Edit the title to **Fair waitlist offers**, then choose **Create task**. The plan appears as BRW-50 in Ready.
3. Change its status to Review, save a coordination note, and reload. The task, status, owner, milestone, and notes remain in this browser.
4. Search for **LoanService** with ⌘K or Ctrl+K. Inspect its responsibilities, dependencies, ADR-017, and related changes.
5. Explore **Borrowing → Loan lifecycle → LoanService → requestLoan()**. The architecture view shows behavioral flows through the same records.

**Create & start** records In progress implementation intent. It does not execute an agent, run code, create a worktree, or claim implementation is complete. The planner uses ordered deterministic rules from `.project/planner.json`. Overlap detection compares active task component IDs, exact resource paths, and opposing assumptions; it does not label every overlap a merge conflict.

## Routes

All routes support direct visits and refreshes.

| Route                              | Purpose                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                                | Overview, live counts, sprint progress, important changes                                 |
| `/activity`                        | Cumulative category, author, component, time, branch, and text filters                    |
| `/activity/:id`                    | Recorded rationale, implementation, source evidence, dependencies, and contextual answers |
| `/activity?component=loan-service` | Component-filtered feed                                                                   |
| `/codebase`                        | Hierarchical system, module, and implementation map                                       |
| `/codebase?node=loan-service`      | Selected and focused component inspector                                                  |
| `/architecture?flow=return`        | Behavioral flow, guarantees, and shared component inspector                               |
| `/board`                           | Live kanban with native desktop drag/drop and accessible status selects                   |
| `/board?tab=milestones`            | Milestone progress calculated from live tasks                                             |
| `/board?task=BRW-43`               | Task details; `task` also works on other workspace routes                                 |
| `/team?member=alex`                | Contributors, expertise, and linked profile work                                          |
| `/search`                          | Full-page search across current project knowledge and local tasks                         |
| `/settings`                        | Project information, interface density, future adapter preferences, reset, session        |
| `/login`                           | Mock sign-in without credential transmission or storage                                   |

Unknown routes and missing changes have recovery links. Gather and Trail are persisted project previews with a route back to the populated Borrow workspace.

## Architecture and knowledge

- `.project/`: all 67 supplied JSON records, including individual components, tasks, changes, and decisions. The manifest supplies stable presentation order and revision `a83dcf2`.
- `scripts/knowledge.mjs`: record discovery and validation of shapes, IDs, relationships, parent ancestry, evidence, and planner configuration. Unlisted record files follow manifest records in deterministic alphabetical order.
- `scripts/sync-knowledge.mjs`: generates typed, JSON-importing `src/mock/` adapters. Edit repository records, not generated adapters.
- `src/types/index.ts`: the product's domain contract.
- `src/lib/services.ts`: async, isolated snapshot services. Future providers belong behind this boundary, outside UI components.
- `src/lib/planning.ts`, `graph.ts`, `storage.ts`: deterministic planning/overlap rules, hierarchy selection, and validated browser overlays.
- `src/app/layout.tsx`: async snapshot loading with Suspense and a persistent client workspace. The catch-all route permits deep links without remounting shared state.
- `src/components/`: focused workspace, task, activity, graph, team/settings, and search features. React Flow loads only when a graph screen is visited.
- `src/components/ui/`: Radix-based shadcn primitives. `globals.css` owns the supplied palette, compact density, responsive layout, and focus treatment.
- `.agents/skills/project-knowledge/SKILL.md`: reusable agent contract, linked from `AGENTS.md`.

The stack is Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui with Radix, Lucide, React Flow, and Sonner. Inter is served locally as a variable WOFF2. See [the product specification](docs/product-spec.md) for the complete records and behavior contract, and [the implementation stages](docs/implementation-plan.md) for the delivered increments.

## Verification

```sh
npm run knowledge:validate  # Record shapes, IDs, links, hierarchy, evidence
npm run knowledge:sync      # Discover records and regenerate typed adapters
npm run typecheck          # Generate route types and check TypeScript
npm run test:unit          # Exact fixtures, validation, planning, hierarchy, storage
npm run check              # Knowledge validation, lint, types, unit tests, formatting
npm run build              # Validate, synchronize, and compile production
npm run test:install       # Install Chromium and WebKit for Playwright
npm run test:e2e           # Build and test a separate production server
npm run test:e2e:ui        # Interactive browser test runner
npm run format            # Apply Prettier and Tailwind formatting
```

Browser tests cover stateful planning/persistence, conflict detection in both directions, status editing and desktop drag/drop, graph hierarchy and decisions, search keyboard navigation, activity filters, architecture guarantees, team links, notifications, sign-in/out, preferences/reset, unknown routes, and 390 × 844 layout in mobile Chromium/WebKit. Desktop drag tests are intentionally skipped on touch configurations; both mobile browsers test status editing instead. The test server uses port 3100; set `PLAYWRIGHT_PORT` to select another free port.

GitHub Actions runs a clean install, checks, and production browser tests on pushes and pull requests, retaining failed browser artifacts. ESLint 10 is supported by the installed Next.js configuration; some bundled plugins still declare older peer ranges, as described by the installed Next.js docs. Do not bypass checks with `--force`.

## Persistence and reset

| Browser key          | Stored state                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| `codebase:borrow:v1` | Task overlays, selected project, dismissed notification IDs, compact density |
| `codebase:settings`  | Future knowledge-source preference and optional endpoint URL                 |
| `codebase:session`   | Mason's demo identity, or literal `signed-out`                               |

Hydration finishes before saving. Task mutations persist synchronously before navigation. Malformed saved data falls back to intact sample records; unavailable storage still permits in-memory interaction. State is local to a browser profile, with no cross-device or cross-tab coordination guarantee.

**Settings → Reset sample data** requires its confirmation dialog. It restores seed tasks, Borrow selection, unread notifications, and regular density; it preserves inference preferences. Sign-out redirects subsequent workspace visits to mock login. This is navigation state, not a production authentication boundary. Email and password values are never transmitted or persisted.

## Integration boundaries

Borrow's service paths, commits, PRs, and architectural guarantees are illustrative knowledge records. There is no lending backend in this repository, and its sample GitHub links are not expected to resolve to real code.

GitHub synchronization, real inference, OAuth, remote execution, and coordination between separate worktrees are future adapters. Browser edits do not write Git files or publish records. The proposed dedicated `threadline` knowledge branch is documented in [knowledge-branch.md](docs/knowledge-branch.md); a shared publication/reconciliation workflow is not implemented in this frontend version.

The feed uses its supplied fictional timestamps and stable relative labels. “This week” retains all six records; the Last 24 hours fixture cutoff is `2026-09-29T18:40:00Z`, so the demonstration does not disappear over time.

## Licensing

Threadline uses [Apache-2.0](LICENSE). Inter retains its [SIL Open Font License](public/fonts/OFL.txt). The vendored shadcn/ui source retains its [MIT notice](docs/licenses/shadcn-MIT.txt). Other installed packages retain their respective licenses.
