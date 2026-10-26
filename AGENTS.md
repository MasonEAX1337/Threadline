# Working on Threadline

Threadline is a developer workspace: “Shared context for teams that build with agents.” Borrow is its fictional sample project, not a lending backend implemented here.

## Scope and source of truth

- Follow the user's latest authorized stage. The full product specification in `docs/product-spec.md` describes the destination, not permission to implement later stages when the user requested one increment.
- Read `.agents/skills/project-knowledge/SKILL.md` before planning or changing project knowledge. Preserve sample records, manifest ordering, IDs, copy, and provenance when the knowledge stage lands.
- See `docs/implementation-plan.md` for current completion and upcoming work, and `docs/knowledge-branch.md` for future shared publication architecture.
- Keep domain content in records, provider-specific code behind services, and UI in focused feature components.
- Never imply that the prototype executes an agent, authenticates against OAuth, publishes repository changes, or synchronizes worktrees.

## Stack and conventions

- Node 24, npm 11, Next.js App Router, React, strict TypeScript, Tailwind v4, Radix-based shadcn/ui, Lucide, React Flow, and Sonner. Commit `package-lock.json`; use `npm ci` for reproducible installation.
- Before using framework APIs, read the matching documentation in `node_modules/next/dist/docs/`. This installed version may differ from remembered Next.js behavior.
- Import through `@/`. Use Server Components by default and explicit client boundaries for browser state and interactions.
- Keep the future workspace provider mounted across route changes, outside route-specific content. Keep the mock login outside the workspace shell. Do not load React Flow eagerly in the shell.
- Use semantic CSS tokens in `src/app/globals.css`, the local Inter variable font, and the system monospace stack. Add primitives through the configured shadcn Radix registry; preserve the project's customized variants.
- Use dialog titles/descriptions, accessible control names, visible focus, and keyboard alternatives. Respect reduced motion and prevent document overflow at 390 × 844; board/canvas regions may scroll internally.
- Keep package and font license notices intact. Never commit secrets, `.env` values, credentials, build outputs, or browser test artifacts.

## Verification and commits

- Run `npm run check` and `npm run build` for a meaningful implementation change. Run `npm run test:e2e` when affected interactions or route behavior warrant browser verification.
- Add meaningful stateful product tests as features land; foundation smoke tests are not proof of completed product workflows.
- When knowledge tooling exists, validate and synchronize records before building. Do not create stub commands that report success without validation.
- Make small, coherent commits with descriptive messages. Verify each increment and push regularly as the user requested; don't collect the entire product in one commit. Do not force-push or rewrite shared history.
- State what changed, what checks actually ran, and what remains outside the completed scope.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
