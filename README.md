# Threadline

**Shared context for teams that build with agents.**

Threadline connects development intent, tasks, components, architecture, changes, and decisions in a shared developer workspace. **Borrow** is its fictional neighborhood lending project: “Share more. Buy less. Borrow from your neighbors.”

## Current stage

Stage 1, the application foundation, is implemented. The app starts and builds, has the requested dark theme and local Inter font, and includes reusable Radix-based UI primitives. The root page explicitly reports this foundation state. The populated workspace and its interactions are subsequent stages; see the [implementation plan](docs/implementation-plan.md) and [full product specification](docs/product-spec.md).

## Run locally

Use Node.js 24 and npm 11. `.nvmrc`, package engines, and the lockfile pin the expected environment; no credentials or environment variables are needed.

```sh
nvm use
npm ci
npm run dev
```

Open http://localhost:3000. To run the production server:

```sh
npm run build
npm start
```

## Verification

```sh
npm run check          # ESLint, route generation + TypeScript, formatting
npm run build          # Production compile and prerender
npm run test:install   # Install Chromium and WebKit for Playwright
npm run test:e2e       # Build, launch isolated production server, run tests
npm run test:e2e:ui    # Interactive Playwright runner
npm run format        # Apply Prettier and Tailwind class formatting
```

Browser tests cover the foundation, local font delivery, keyboard navigation, the unknown-route recovery path, and page width on desktop and 390 × 844 mobile Chromium/WebKit. They do not yet verify the planned Borrow workflows. The test server uses port 3100 by default; set `PLAYWRIGHT_PORT` to use another free port. It deliberately never reuses an unrelated running server.

GitHub Actions runs clean installation, static checks, and production browser tests on pushes and pull requests. Browser artifacts are retained only for failed CI runs.

`knowledge:validate` and `knowledge:sync` will be implemented with the actual records in stage 2, then wired into the build lifecycle. There are no success-only placeholders for those commands.

## Architecture

- `src/app/`: App Router root layout, metadata, local font, loading fallback, temporary foundation page, and not-found recovery.
- `src/components/ui/`: shadcn primitives based on Radix, customized to Threadline's dimensions, focus treatment, and semantic palette.
- `src/components/brand.tsx`: reusable outline-cube identity.
- `src/app/globals.css`: exact product palette, typography, radii, and reduced-motion treatment.
- `src/lib/`: shared utilities; async provider/service boundaries arrive with the knowledge stage.
- `public/fonts/`: committed Inter Latin variable WOFF2 (weights 100–900), provenance, and SIL Open Font License.
- `tests/`: Playwright browser verification against the production application.
- `.agents/skills/project-knowledge/SKILL.md`: reusable agent contract; `AGENTS.md` provides repository guidance.

The stack is Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui with Radix, Lucide, React Flow (`@xyflow/react`), and Sonner. Direct dependencies and the npm lockfile are pinned. React Flow is installed for the upcoming graph screens and is not loaded on the foundation page.

ESLint 10 is supported by the installed Next.js configuration. npm may warn because some of its bundled plugins still declare ESLint 9 peer ranges; this is documented in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md`. Use the committed lockfile rather than `--force` or disabling peer checks.

## Planned workflow and routes

Describe an outcome → deterministic task draft → inspect components and overlaps → create a Ready task or record In progress implementation intent → follow its architecture, changes, and decisions. “Create & start” will not execute code.

Only `/` and unknown-route recovery are implemented at this stage. Planned screens:

| Route                        | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `/`                          | Borrow overview                                    |
| `/activity`, `/activity/:id` | Change feed and recorded implementation context    |
| `/codebase`                  | Hierarchical components and dependencies           |
| `/architecture`              | Behavioral flows                                   |
| `/board`                     | Tasks and milestones                               |
| `/team`                      | Contributors and expertise                         |
| `/search`                    | Shared knowledge search                            |
| `/settings`                  | Project, interface, and future adapter preferences |
| `/login`                     | Standalone mock sign-in                            |

Task, member, component, flow, and milestone deep links are specified in the product brief and will be added with their feature stages.

## Persistence and integration boundaries

Browser persistence is not implemented yet. Its specified keys are `codebase:borrow:v1` for task overlays/project selection/dismissed notifications/density, `codebase:settings` for future inference preferences, and `codebase:session` for the mock demo identity. Hydration must finish before saving. Reset will restore the sample while retaining inference preferences.

Borrow's paths, commits, PRs, and architectural guarantees are illustrative records; there is no lending backend here. GitHub sync, OAuth, inference, remote execution, and shared worktree coordination are future integrations. Browser actions must never silently publish Git files or send credentials. See [the knowledge-branch direction](docs/knowledge-branch.md) for the proposed shared Git store.

## Licensing

Threadline uses [Apache-2.0](LICENSE). Inter retains its [SIL Open Font License](public/fonts/OFL.txt). The vendored shadcn/ui component source retains its [MIT notice](docs/licenses/shadcn-MIT.txt). Other installed packages retain their respective licenses.
