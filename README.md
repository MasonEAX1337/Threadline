# Threadline

**Shared context for teams that build with agents.**

Threadline is an open-source, frontend-first prototype for a team's shared understanding of its codebase. It connects development intent, tasks, changes, components, and architectural decisions so people and coding agents can coordinate their work. The sample project, **Borrow**, is a fictional neighborhood lending app where people share tools, books, and camping gear. Its systems cover item listings, borrowing, pickups, returns, waitlists, messages, photos, and loan history.

## Run

Requires Node.js 20.9 or later.

```sh
git clone https://github.com/MasonEAX1337/threadline.git
cd threadline
npm ci
npm run dev
```

Open http://localhost:3000. The initial demo opens as Mason Brooks. Settings → Sign out opens the mocked GitHub/email sign-in flow. No credentials are sent or stored.

## Try the main workflow

1. Click **Describe work** and request a 24-hour waitlist offer when an item is returned.
2. Draft the task. Inspect its scope, acceptance criteria, and overlap with the task that makes returned items available to everyone immediately. Agree on whether the next person waiting gets first choice.
3. **Create task** records the plan in Ready. **Create & start** additionally moves it to In progress; execution is simulated.
4. Open the task to change its owner/status or save a coordination note. Drag cards between columns.
5. Explore Codebase: double-click a system, drill into modules and services, and inspect dependencies and decisions.
6. Use ⌘K / Ctrl+K to search components, flows, changes, tasks, and teammates.

## Screens

`/` overview · `/activity` feed · `/activity/:id` change details · `/codebase` progressive graph · `/architecture` behavior flows · `/board` tasks and milestones · `/team` expertise · `/search` project-wide search · `/settings` preferences · `/login` mock authentication.

## Architecture

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui with Radix primitives, Lucide, React Flow, Sonner.
- `src/types/` defines the data contract.
- `.project/` holds repository-owned JSON records, one file per component, task, change, and decision.
- `src/mock/` contains generated typed imports of those records. `npm run knowledge:sync` discovers new records and refreshes adapters.
- `src/lib/services.ts` is the replaceable async service boundary. UI screens receive one snapshot through a shared project provider.
- Feature components own UI behavior. The project context owns persistent browser state.
- `.agents/skills/project-knowledge/SKILL.md` is the reusable draft skill for repository agents.

The website reads repository records. Browser edits persist locally under `codebase:borrow:v1`; they do **not** write repository files. Real GitHub synchronization, agent execution, inference, shared worktree coordination, and OAuth are intentionally outside this MVP.

Source links point at an illustrative `github.com/example/borrow` URL. The source code for Borrow's fictional services is not included.

## Verify

```sh
npm run knowledge:validate
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Browser tests cover task creation, overlap evidence, persistent status changes, graph exploration, project-wide search, notifications, mock authentication, and mobile layout.

## Reset

Settings → Reset sample data restores tasks, dismissed notifications, and interface density. Inference adapter preferences are stored separately; none cause network requests.

## License

Threadline is licensed under [Apache 2.0](LICENSE). The bundled Inter font retains its [SIL Open Font License](public/fonts/OFL.txt).
