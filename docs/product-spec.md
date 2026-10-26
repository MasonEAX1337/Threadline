# Build Threadline

I want to build a product called **Threadline**. The idea is a shared understanding of a codebase for teams that work with coding agents. Its tagline is **“Shared context for teams that build with agents.”**

Build a polished, fully interactive web application. I have a very specific product, visual direction, demonstration scenario, and behavior in mind, described below. Implement the complete experience, including the details and sample records. Make sensible implementation decisions and carry the work through to a working, verified application. Treat this as an implementation request, not a request for a proposal or a landing page.

## 1. Product idea and scope

When people and agents work on the same software, the hard part is maintaining shared context: what the system contains, why it works that way, what changed, who understands an area, and whether two plans disagree. Threadline should connect development intent, tasks, changes, components, architectural flows, and recorded decisions in one coherent workspace.

A person should be able to describe an outcome in plain language, inspect an agent-generated task, understand its affected components and acceptance criteria, see meaningful overlap with work already underway, and choose whether to record the plan or start it. They should then be able to follow that task into its components, dependencies, changes, and architectural decisions.

The first version is a frontend prototype with repository-owned demonstration knowledge and persistent browser interactions. Build the interactions thoroughly. Represent external integrations as future adapters: GitHub synchronization, real inference, OAuth, remote code execution, and coordination between separate worktrees are outside this version. The interface must be honest about that boundary. “Create & start” updates the task's status and represents implementation intent; it does not run an agent or claim that code has been written.

The application is Threadline. **Borrow** is its selected sample project: a fictional neighborhood lending app for sharing tools, books, camping gear, drills, tents, and ladders. Build the developer workspace about Borrow, not a consumer lending marketplace. Borrow's service paths, commits, PRs, and domain components are illustrative knowledge records; they are not claims that a lending backend exists in this application.

Use these exact project identities:

- Product: Threadline, with a thin outlined cube icon.
- Selected project: Borrow.
- Project description: “Share more. Buy less. Borrow from your neighbors.”
- Project ID: `borrow`; task prefix: `BRW`; default branch: `main`.
- Sample repository: `https://github.com/example/borrow`.
- Other project choices: Gather, “Community event planning”; Trail, “Group trip planning”. Borrow's menu description is “Neighborhood lending”.
- Default session: Mason Brooks, project administrator, ID `mason`, initials MB.
- Browser title: `Threadline — Borrow`.
- Page metadata description: “Your team's shared understanding of the codebase. Explore architecture, understand changes, and coordinate agent-led work.”

The appendices contain the exact data contract and fictional sample records I want. Use them as required input data. Preserve IDs, record order, relationships, names, copy, timestamps, criteria, assumptions, and provenance. UI totals must derive from the data and update when tasks change.

## 2. Technical foundation

Use Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui with Radix primitives, Lucide icons, React Flow (`@xyflow/react`), and Sonner notifications. Use Inter, preferably a locally served variable WOFF2 with weights 100–900 and its font license. Use a system monospace stack for identifiers, file paths, revisions, and keyboard shortcuts.

Use compatible stable package versions and commit a lockfile. Consult the actual installed framework documentation when APIs differ. Keep code strongly typed. Establish reusable UI components and feature components; keep domain content in data records rather than scattering it through JSX.

Suggested structure:

```text
src/app/layout.tsx
src/app/[[...route]]/page.tsx
src/app/globals.css
src/types/index.ts
src/lib/services.ts
src/lib/utils.ts
src/mock/{project,components,architecture,activity,board,planner}.ts
src/components/application.tsx
src/components/project-context.tsx
src/components/shared.tsx
src/components/overview.tsx
src/components/activity.tsx
src/components/graph.tsx
src/components/board.tsx
src/components/people-settings.tsx
src/components/search.tsx
src/components/ui/
.project/
.agents/skills/project-knowledge/SKILL.md
scripts/sync-knowledge.mjs
scripts/validate-knowledge.mjs
tests/product.spec.ts
```

The root workspace should remain mounted during navigation so shared task state and dialogs survive route changes. Load a typed project snapshot through an async service boundary, then provide it to the interactive application. An optional catch-all route is acceptable; every documented URL must also work on a direct visit or refresh. Lazy-load graph-heavy screens with useful loading text. Use a Suspense fallback reading “Loading project knowledge…”.

Expose async services such as `projectService.getSnapshot()`, `projectService.getProject()`, `activityService.getChanges()`, `architectureService.getGraph()`, `taskService.getTasks()`, and `agentService.planTask(request, graph)`. Return isolated copies where appropriate. Keep future provider-specific code outside UI components.

## 3. Visual direction

Make this feel like a quiet, professional developer tool with a highly considered dark interface. Use restrained surfaces, thin borders, compact metadata, small line icons, clear hierarchy, and a warm peach accent. The application should look dense enough for real work while keeping related information easy to scan. Use text, diagrams, and initials avatars; the product does not need stock photography or marketing illustrations.

### Exact base palette

| Token                        | Value     |
| ---------------------------- | --------- |
| App background               | `#111214` |
| Main foreground              | `#ededf0` |
| Card background              | `#17181b` |
| Popover background           | `#1b1c20` |
| Primary peach                | `#edaa83` |
| Text on peach                | `#211610` |
| Primary hover                | `#f0b690` |
| Secondary / accent surface   | `#24262b` |
| Secondary foreground         | `#c5c6ce` |
| Muted surface                | `#202226` |
| Muted foreground             | `#92949f` |
| Borders                      | `#2b2d33` |
| Input borders                | `#34373e` |
| Input background             | `#151619` |
| Destructive                  | `#eb8282` |
| Green                        | `#83d4a5` |
| Blue                         | `#8ab4ee` |
| Sidebar                      | `#141517` |
| Sidebar/header dividing line | `#25272b` |

Use a base radius of 6px, with 4px small controls, 8px larger elements, and 10px only where warranted. Panels have 1px borders, 6px corners, and little or no shadow. Buttons have no heavy shadow. Primary buttons are peach with dark text. Outline buttons have transparent backgrounds and borders around `#3a3d45`.

Use Inter at 14px for the body. Main page titles are 36px, weight approximately 660, line-height 1.25, letter-spacing -1.1px. Section titles are around 16px, weight 620, tracking -0.25px. Page descriptions are 14px in muted gray with 1.6 line-height. Regular controls are generally 12px, with 10–11px secondary metadata and 8–9px graph metadata. Standard SVGs are 18px with a 1.6px stroke. Focus indicators use a visible 2px peach outline with a 4px offset.

Inputs/selects have a 38px minimum height, 9px by 12px padding, and 6px corners. Textareas have 13px by 15px padding and 1.65 line-height. Large action buttons are 44px tall with 18px horizontal padding and 13px labels. Badges use 10px text, 5px corners, and subtle tinted backgrounds. Status indicators must combine words/icons and color.

Dialogs use `#18191d`, a `#383b43` border, 28px padding, up to 90dvh height, vertical scrolling, and a strong soft shadow (`0 24px 100px #0009`). Their overlay is `#000a` with approximately 3px backdrop blur. Dialog titles are 23px with 1.35 line-height and -0.6px tracking. Description text is 13px. Standard task, overlap, and decision dialogs are 700px wide; Describe work is 720px; search is 660px; notifications is at most 550px. All respect `calc(100vw - 32px)`.

Avatars are colored circles with initials, never external profile photos. Small avatars are 29px with 10px initials; large avatars are 46px with 14px initials. Use the record's peach/blue/green/violet/gold/pink color category. The persistent signed-in profile avatar is slate gray (`#444853`) with pale text. Display names must be available as accessible labels/tooltips.

## 4. Persistent shell and navigation

On desktop, use a fixed 248px left sidebar running from top to bottom. Give it 12px horizontal padding and a fine right border. The main area has a matching 248px left offset. The topbar is 71px high with 28px horizontal padding and a bottom border. The main content is centered, maximum width 1700px, with 28px horizontal/top padding and 30px bottom padding.

The sidebar, in order:

1. A 72px-high brand row: peach outline cube approximately 29px, “Threadline” in 23px semibold, 13px gap.
2. A 51px-high project picker with an inset border, a peach B monogram, Borrow, and a chevron. Its dropdown says “Your projects” and lists Borrow, Gather, and Trail with their descriptions and a check beside the selected one.
3. Primary navigation: Overview, Activity, Codebase, Architecture, Board, Team. Use House, Activity, Code2, Workflow, Kanban, and Users icons respectively. The active row has a charcoal fill, brighter label, and a narrow peach stripe at its left edge. Board has a small count badge showing tasks whose status is not done, initially 8.
4. Bottom-anchored search control labeled “Search…” with a `⌘ K` shortcut badge.
5. Settings link with gear icon.
6. A bordered repository connection control with green dot, GitHub icon, and “Sample repository” for Borrow. It opens Settings. Other projects show “Repository preview”.
7. Mason Brooks profile row with initials avatar and dropdown. Menu actions: View team profile, Project settings, Sign out.

The topbar shows project / current section breadcrumbs. A change-detail route adds / Change. Right-side controls are a branch icon, “main”, chevron, a vertical separator, a bell, and the small signed-in avatar. Branch opens a repository-information dialog; bell opens Notifications; avatar opens Team. A peach dot on the bell indicates unread notifications.

Switching to Gather or Trail should persist the selected project, return to `/`, and display a useful empty state: “[Project] is ready for its first knowledge update”. Explain that it is a preview and offer “Explore Borrow” to return to the populated project. Keep the shell and project picker useful in this state.

Escape closes open shell menus. Route changes close the mobile navigation and shell dropdowns. Use proper active-navigation semantics. A URL `?task=BRW-...` opens the corresponding task dialog; closing that dialog removes only the task parameter while preserving other query parameters.

### Routes and links

| Route                     | Screen / behavior                                     |
| ------------------------- | ----------------------------------------------------- |
| `/`                       | Borrow overview                                       |
| `/activity`               | Filterable change feed                                |
| `/activity/:id`           | Detailed change                                       |
| `/activity?component=:id` | Feed filtered to a component                          |
| `/codebase`               | Hierarchical component graph                          |
| `/codebase?node=:id`      | Select and focus a component at the appropriate depth |
| `/architecture`           | Behavioral architecture flows                         |
| `/architecture?flow=:id`  | Select a particular flow                              |
| `/board`                  | Task kanban                                           |
| `/board?tab=milestones`   | Milestone view                                        |
| `/board?task=:id`         | Board with task details open                          |
| `/team`                   | Contributors and expertise                            |
| `/team?member=:id`        | Contributor profile open                              |
| `/search`                 | Full-page knowledge search                            |
| `/settings`               | Project, agent, interface, session preferences        |
| `/login`                  | Mock sign-in, without the workspace shell             |

For an unknown route show “This page isn't in the project”, an explanation, and “Go to overview”. For a missing change use “Change not found” and “Back to activity”.

## 5. Overview

At the top show **Borrow**, a green dot with **Active**, and the project description. Align **View repository** (outline, GitHub and external-link icons) and **Describe work** (peach, sparkle icon) on the right.

Directly below, make one bordered horizontal snapshot strip with four equal cells, thin vertical separators, muted outline icons, prominent 24px values, and smaller labels. Initial values are **8 Contributors**, **38 Components**, **8 Active tasks**, **6 Changes this week**. Calculate these from developers, nodes, non-done tasks, and changes.

Below it use a two-column grid, left:right ratio about 1.32:1, with 14px gaps. Upper-left is Recent important changes; upper-right is This sprint; lower-left is How borrowing works; lower-right is Team activity. Upper panels have roughly 422px minimum height.

**Recent important changes:** show the first three change records in manifest order, each with a colored square line-icon tile, linked title, author and relative time, short summary, two component chips, and a trailing arrow. The first row has an ARCHITECTURAL badge. Initial rows are Double bookings prevented, Waitlists added for popular items, and Pickup reminders added. The header's View all goes to Activity.

**This sprint:** header title at left, a link at right showing Sprint 06 and Sep 28 – Oct 11. Peach progress bar and numeric percentage. Progress is rounded done/total; initially 4/12 = 33%. Show BRW-43, BRW-42, and BRW-44 in that order as clickable rows with status icons, title, truncated description, status pill, and arrow. Footer stats initially read 4 completed, 2 in progress, 4 remaining. “Remaining” means backlog + ready; review is not included in that figure. Include Open sprint board.

**How borrowing works:** subtitle “From a neighbor’s shelf to your next project.” Five compact connected blocks with arrows: Find → Request → Pick up → Return → Share again. Each has the icon and two secondary lines from `overview.json`. They link to their corresponding system node; Pick up points to Borrowing. View architecture links to Architecture.

**Team activity:** three compact avatar rows linked to their changes. Use the prescribed action, detail, and short time values from the overview records.

Below the grid, show a low-height peach-tinted coordination alert when an active overlap exists. Heading: **One overlap worth a look**. Name the two tasks and their shared component. Include **Review overlap**, opening the overlap dialog. Compute it from live tasks so state changes are reflected.

## 6. Activity and change detail

Activity heading: **Activity**. Description: **What changed, why it changed, and what it means for your system.**

Put tabs below the heading: All, Important, Architecture, Features, Fixes, Refactors, Team. Below those, put Search changes, All authors, All components, This week / Last 24 hours, and All branches filters. Author options come from contributors; component options include systems and services; branch choices come from recorded changes.

Filter cumulatively. Search title, summary, rationale, and affected component names, case-insensitively. Important includes important and architectural significance. Architecture selects architectural significance. Features/Fixes/Refactors map to the respective change types. Team is the full team feed, retaining the other filters. Keep the fictional feed's dates stable; for the supplied fixture, Last 24 hours uses the sample cutoff `2026-09-29T18:40:00Z`. This week's default includes all six supplied changes. Do not make the entire demonstration disappear as real time passes.

Show the number of updates and “Newest first”. Render six detailed timeline entries in manifest order. Each has an avatar rail, significance badge, relative time, linked title with arrow, author, short commit SHA, PR number, summary, side-by-side **Why** and **What changed** explanations, optional **System impact** flow, affected component chips, and View change. Flow text splits on `→` into small monospace pieces separated by arrow icons. Keep narrative information prominent rather than reducing the feed to commit messages.

For an empty filter result display “No changes match these filters”, explanatory text, and **Clear filters** that resets every filter. Filtering LoanService should show two entries.

On `/activity/:id`, show All activity, significance, large title, summary, author/avatar/time, and a main-branch badge. Use a wide main column plus a 310px context column, 18px gaps. Main-column panels:

- **Why this changed** and **What changed**, with evidence source and revision.
- **Architecture impact**, showing Before and After when present. Otherwise explain that system boundaries are preserved and behavior is extended within the affected components. Include View in codebase, choosing an affected service when possible.
- **Files changed**, with exact paths and links to the illustrative repository at the record's commit. Explain that source links reference Borrow's illustrative repository.
- **Dependency impact**, up to five related graph edges with navigable source/target names and relationship descriptions.

Context-column panels:

- Change context: commit, PR number, branch, type, recorded date, Open commit.
- Affected components.
- Related work: linked task buttons with status icons and the linked architectural decision when present.
- **Ask about this change**, an input and **Ask AI Agent**. Label it as a prototype response based on recorded context. Disable asking for blank input; support Enter. Questions matching why/reason/motivation return the recorded reason. Dependency/impact/affected questions return the summary plus up to three relevant edge descriptions. Other questions return the recorded implementation. Display the answer inline as a status response. No inference network call is necessary.

Component chips always link to the appropriate selected graph node. Commit links use `/commit/:sha`; source-file links use `/blob/:sha/:path` under the sample repository and open in a new tab with safe link attributes.

## 7. Architectural decision memory

Use one reusable decision dialog from both change details and component inspectors. Show uppercase decision ID, status badge, date, title, “Architectural decision recorded alongside implementation.”, then Context, Decision, Alternatives considered, and linked component chips.

Each alternative has a name and a reason. Use ADR-017 and ADR-018 exactly as supplied. The important LoanService decision is **Keep availability checks in one place**. This is recorded project memory, with actual supplied rationale, not generated generic text.

## 8. Codebase explorer

Heading: **Codebase**. Description: **Start with the system. Follow the connections. Understand the details.**

Use a React Flow canvas and an adjacent inspector. Toolbar: component search at left; depth selector at right with Architecture, Modules, Implementation. A second row says Show and offers independently selectable types: Systems, Modules, Services, Classes, Functions, Data stores, External, Queues, APIs. Functions start disabled; the other types start enabled.

Initial Architecture depth shows exactly these eight system nodes in this order: Items, Borrowing, Returns, Waitlists, Messages, Members, Photos, History. Do not flatten all 38 components onto the first screen.

Use a deterministic layout. For the eight top-level nodes, assign coordinates in manifest order:

```text
Items       (0,0)       Borrowing (285,0)    Returns  (570,0)
History     (0,190)     Messages  (285,190)  Waitlists(570,190)
Photos      (0,380)     Members   (285,380)
```

For other depths use three columns, `x=(index%3)*285`, `y=floor(index/3)*170`. Render only relationships whose endpoints are both visible. Use smooth stepped edges with approximately 14px bends, subdued `#53555e` lines, 1.4px stroke, and arrowheads. On hover increase to 2px peach and show a tooltip explaining the relationship. Preserve relationship types and descriptions.

Graph workspace: a 1px bordered, 6px rounded enclosure, canvas plus 310px inspector. Canvas background `#141619`, minimum height 650px, normal height `calc(100dvh - 288px)`. Dotted background with 22px gap and 1px `#33353a` dots. Top overlay contains All systems, drill-down breadcrumbs, and visible component count. Bottom caption contains a small green dot, **Knowledge at `a83dcf2`**, and **Click to inspect · Double-click to explore**.

Node cards are 205px wide, minimum 114px high, `#202329` background, `#414754` border, 6px radius, 14px padding, and a subtle shadow. Show type icon, uppercase 8px type label, immediate-child count when nonzero, 12px semibold name, and a two-line 9px muted description. Selected cards use peach borders, `#2b2623` background, and a subtle peach outline. Ports are tiny left/right circles. Icons: Layers for systems, Blocks for modules, Box for services, Braces for classes, Code2 for functions, Database for data stores, Globe for external services, ListFilter for queues, Radio for APIs.

Canvas supports pan and zoom, zoom controls, Fit view, and Center. Component nodes stay in their defined layout rather than being draggable. Disable double-click-to-zoom so double-click explores the hierarchy. Use min/max zoom approximately 0.35–1.6, with fit padding 0.18. Center retains the current zoom while centering the visible graph.

Interaction rules:

- Single click selects a node and opens its inspector.
- Double-click a system scopes to that system's modules. Double-click a module scopes to implementation descendants. Explore a service's children to reveal functions.
- Scoping honors parent ancestry and system membership. Modules depth shows modules; Implementation shows non-system, non-module records within the scope.
- Switching the global depth clears the scope. All systems resets to Architecture and clears selection.
- Functions become enabled when drilling to function children or deep-linking to a function.
- Search matches name, description, and source path, with at most seven suggestions. Selecting a suggestion clears query/scope, selects the right depth, ensures its type is enabled, and focuses the node.
- `/codebase?node=...` performs the same selection and focus behavior even on a direct visit. Fit/focus should happen after the graph is ready, with modest motion.
- If filters remove everything, show “No components in this view” and Reset view restoring top-level systems and default types.

The full hierarchy includes eight systems, ten modules, service/class/data/queue/API records, and four functions. In particular, Borrowing has Loan lifecycle and Pickup planning modules. Loan lifecycle includes LoanService, AvailabilityPolicy, and Borrow API. LoanService has requestLoan(). ReturnService has confirmReturn(); WaitlistService has offerNext(); NotificationService has sendReminder(). Use the appendix for exact parents, system IDs, paths, and descriptions.

### Inspector

With nothing selected, show a centered layered icon, **A shared map of your system**, and an explanation that selecting a component reveals purpose, dependencies, decisions, and changes. Include three checklist lines: Responsibilities and guarantees; Changes with source context; Decisions and alternatives.

With a selection, show icon, close control, type badge, name, description, then applicable sections:

1. Location: monospace path.
2. Responsibilities.
3. Important guarantees, with shield icons.
4. Contains: child links and Explore modules / Explore implementation / Explore functions, depending on node type.
5. Depends on · outgoing: target links, relationship types, descriptive tooltips.
6. Used by · incoming: source links.
7. Decision memory: open the linked decision dialog.
8. Recent changes: links and relative times.
9. Footer: View activity links to `/activity?component=...`; View source uses the sample repository's main branch and path.

Navigating a dependency or child link selects and focuses that node. Inspector close returns to its placeholder. Support the complete path Borrowing → Loan lifecycle → LoanService → decision dialog → requestLoan().

## 9. Architecture flows

Heading: **Architecture**. Description: **How requests, data, and decisions move through Borrow.**

This is a behavioral view of the same component data. Put the supplied flow selectors in a three-column grid with 12px gaps, 15px card padding, workflow icons, name, description, and a small selected dot. Selected flow cards have a warm dark fill `#2a2420`, border `#8b6349`, and peach icon.

Below, use a graph plus 310px side panel. The graph header shows the selected flow name and step-count badge. The 600px-high canvas shows nodes in the exact `nodeIds` order, labeled Step 01, Step 02, etc. Use a three-column layout with 270px horizontal and 165px vertical spacing. Connect consecutive nodes with directional stepped edges. Use fit padding 0.12 and zoom bounds approximately 0.3–1.5. Include pan, zoom, Fit view, Center, and dotted background.

With no node selected, the right panel shows flow name, Purpose, Entry point in a code block, Output, Important guarantees, and a source-linked knowledge footer with revision. Clicking a node replaces this with the same component inspector. Closing the inspector restores the flow summary. Changing flow clears node selection. A `flow` URL parameter selects that flow.

The **Return an item** flow must include the guarantee **“An item stays unavailable until its return is confirmed”**. Clicking ReturnService shows that component's actual record. All flows and guarantees come from the appendix, not separate invented content.

## 10. Board and milestones

Heading: **Project board**. Description: **Intent, implementation, and shared context—in one place.** Put Describe work at the upper right.

Tabs: Board and Milestones. Show Sprint 06 and Sep 28 – Oct 11 beside them. Board toolbar contains Search tasks, All members owner filter, and a live link saying “[N] task(s) with overlap”. Count in-progress tasks that have at least one overlap, rather than counting every repeated pair.

Kanban columns in order: **Backlog, Ready, In progress, Review, Done**. Each has an appropriate status icon, label, count, and vertically stacked task cards. Use 5 columns on wide screens and a contained horizontal scrolling board on narrower screens. A card contains task ID, subtle sparkle icon, title, up to two label badges, an overlap indicator when relevant, assignee avatar, and optional due date. Mark active contractual disagreement as Contract overlap; other active shared scope as Shared component.

Task-card click opens details. Native drag and drop between columns updates task status, shows a toast such as “BRW-44 moved to Done”, updates all views/counts, and persists after refresh. Highlight the current drop target. The status dropdown in task details is the accessible alternative. Add the hint **“Drag a task between columns, or change its status in task details.”**

Filter tasks case-insensitively across title, description, ID, and labels, combined with owner. Preserve empty columns, with “No matching tasks” when filtered and “No tasks yet” otherwise.

Initial state is 12 tasks: backlog 2, ready 2, in progress 2, review 2, done 4. Preserve manifest ordering when distributing into columns. Newly created tasks are inserted first. IDs begin at BRW-50 and increment above the current highest suffix.

Milestone cards show an icon, title, description, Upcoming badge, due date, dynamically calculated completed-task progress, “X of Y tasks complete”, checklist of supplied deliverables, and up to four linked task rows. Include **Neighborhood pilot** with the exact supplied records. Compute progress from tasks assigned to each milestone, not the separate deliverable checklist. `/board?tab=milestones` opens this tab.

## 11. Describe work and task planning

This is the central workflow. Clicking Describe work opens a 720px dialog with sparkle icon, title **Describe work**, and description **“Describe the outcome. Your agent will turn it into a plan.”**

The initial field is **What should this accomplish?**, a three-row textarea at least 108px high. Use the waitlist request as its example placeholder. Helper copy: **“Borrow’s prototype agent drafts scope, acceptance criteria, and coordination warnings.”** Below it show suggestion chips for Waitlist offers, Pickup reminders, and Lending history, which populate the prescribed requests.

**Draft task** is disabled for blank input. Clicking it shows a short approximately 600ms state, **Reading project context…**, with spinner. Then display **Proposed task** and an **Agent draft** badge, editable Title, Acceptance criteria as check-icon rows, Scope · affected components as links, and relevant overlap warnings. When no component can be identified say **“Scope needs discovery. The agent has not identified a component from this request.”** Editing the original request invalidates the old draft.

The prototype planner is deterministic and driven by `planner.json`. Use the first matching case-insensitive regex rule in the supplied order. The ordering matters: a waitlist request mentioning a return must select waitlist behavior before the broader return rule. Recognize waitlist, reminders/messages, history/export, returns, photos, search, privacy/membership, pickups, and borrowing/reservations according to those rules.

Also identify any non-system component whose full name appears in the request case-insensitively. Union these IDs with the rule's component IDs, preserving order and uniqueness. Derive resource paths from the identified component records. Default draft fields: ID `draft`, description = trimmed request, status ready, assignee mason, milestone beta, no related changes, `agentCreated: true`. Use rule title/labels/criteria/assumptions where present.

For an unmatched request, derive the title from trimmed input, remove trailing `. ! ?`, and truncate to 90 characters. Use label Feature, empty assumptions, and these criteria:

- Deliver the requested outcome described above.
- Verify the changed behavior and record the results.
- Update affected component knowledge and decisions.

At the bottom, use a sticky footer so actions stay reachable in a tall draft. Copy: **“Creating a task records the plan. Starting also authorizes implementation.”** Buttons: **Create task** (outline) and **Create & start** (peach). Disable both for an empty title. Creating records the task as Ready; creating and starting records it as In progress. Both close/clear the draft, navigate to `/board?task=NEW_ID`, open the new task details, and show an informative success toast. Execution remains simulated in this prototype.

## 12. Overlap detection and coordination

Implement real deterministic detection from the supplied tasks, paths, component references, and assumptions. Do not hard-code a warning banner that always appears.

Compare a candidate task with other tasks whose status is in-progress or review, excluding itself. Compute shared component IDs and exact shared resource paths. No shared component/path means no overlap. Classify:

1. **Contract:** a configured conflict matches a shared component and opposing assumption patterns. Check both directions.
2. **Files:** otherwise, shared resource paths exist.
3. **Component:** otherwise, component scope intersects.

The key conflict involves LoanService. One assumption holds returned items for the next person waiting for 24 hours; the other makes them available to everyone immediately. The explanation must be concrete:

**“One task holds a returned item for the next person waiting. The other makes it available to everyone immediately. Agree on who gets first choice before changing the return rules.”**

For shared files use: “Both tasks modify the same file. Coordinate the implementation order and review the shared contract.” For component-only overlap: “These tasks touch the same component. Check whether their interface and behavior assumptions agree.”

Draft warnings prioritize contract overlaps, display the first prominently, and put additional overlaps in an expandable disclosure. Include the other task's title, owner avatar/name, and status. Use **Potential overlap with [title]**. The exact seeded example is BRW-43 Offer returned items to the waitlist against BRW-42 Make returned items available immediately.

The **Work overlaps** dialog explains “Shared files, components, and assumptions worth coordinating before implementation.” Build unique pairs from in-progress tasks against eligible active tasks; deduplicate by sorted task IDs. Each pair shows Conflicting assumptions / Shared files / Shared component, two clickable task identity blocks with avatars, the explanation, shared component chips, and shared paths. Opening a task closes the overlap dialog first. With no pairs show No active overlaps found and helpful explanatory text.

Warnings advise coordination; they do not claim every overlap is a merge conflict or automatically block planning.

## 13. Task details

Task dialog header shows ID, Agent-created badge, title, and description. A three-field property row contains **Status**, **Owner**, **Milestone** selects. Changes apply immediately to shared state and persistence; no separate save action is required for those selects.

Below, show Acceptance criteria, Related components, Implementation assumptions when present, the first coordination warning when present, and Related changes with titles/PRs when present. Links out to component/change screens close the task dialog.

At the bottom provide **Coordination note**, a single-line input with placeholder **“Record an agreed contract or implementation order…”**, and **Save**. Disable Save for blank input. Append nonblank notes to assumptions as `Coordination: [trimmed note]`, clear the input, and toast **Coordination note saved**. Display the saved note immediately in the assumptions list and persist it across refreshes. Reset the unsaved note field when switching tasks.

## 14. Team and expertise

Heading: **Team**. Description: **Find the people who know your system—and the areas they work in.** Show contributor count and Search people or areas… input. Search name, role, and primary areas.

Use a three-column grid of 6px rounded bordered cards, 17px gaps, 21px padding, roughly 264px minimum height. Each card has a large initials avatar, name, role, chevron, Primary areas badges, Recently section with up to two authored changes, and a footer with “[N] changes this month” plus View profile. For people without authored changes, show an assigned task title, or Project knowledge and documentation.

Use all eight contributors from the appendix with their exact names, roles, biographies, areas, initials, colors, usernames, and change counts. Explain below the grid: **“Activity is context for finding expertise, not a measure of individual performance.”**

A profile opens in a dialog with avatar, name, role, username, biography, expertise badges, current non-done tasks, and authored changes. Selecting work closes the profile and opens task details; selecting a change navigates and closes it. Support member URL deep links. Empty search: No teammates match, with guidance to search by name, role, or primary area.

## 15. Global search

Support `⌘K` and `Ctrl+K` anywhere in the workspace, and the sidebar search button. The shortcut toggles a search dialog. On opening, clear the query and active selection and autofocus the field. Input label: Search project. Placeholder: Search project or jump to…

Search across these grouped categories in order: **Navigation, Components, Architecture, Changes, Tasks, Team, Decisions**. Build results from the current shared data, including newly created tasks. Case-insensitive matching includes title, descriptive text, and ID. Cap nonblank matches at 35. Group them under small uppercase labels, with category icons, strong result titles, muted one-line subtitles, and trailing arrows.

Blank search shows navigation shortcuts, the suggested LoanService/WaitlistService/ReturnService components, and the first two changes. Navigation shortcuts include Go to Overview, Go to Codebase, Go to Board, Open recent changes, Go to Architecture.

Destinations: components → selected node; flows → selected architecture flow; changes → detail; tasks → board plus task dialog; teammates → member profile; decisions → the first affected component's inspector, where decision memory can be opened.

Arrow keys move selection with wrapping. Mouse hover updates selection. Enter opens the active result. Escape closes. Keep the active result scrolled into view. Footer hints: Enter to open, ↑ ↓ to navigate, Search across Borrow. Empty search result: No matching knowledge. Full search route uses the same result engine, with a large field and grouped results under **Search project**; its empty state is No results found.

## 16. Notifications and repository information

Notifications dialog title: **Notifications**. Description: **Important updates from your project.** Render supplied notifications with type icon, title, description, time, and navigable target. Opening an item marks it read and closes the dialog. Each row also has a check-icon button with accessible label Dismiss [notification title], which marks that item read without navigating. **Mark all as read** persists dismissal of every remaining item. When empty display **You're all caught up** and **New project updates will appear here.** The bell dot disappears when no unread items remain and stays gone after refresh.

View repository and the main branch control open a dialog titled **Borrow repository** with a GitHub icon. Description: **Borrow is a fictional sample project. Repository and source links show where real integrations will connect.** Show three labeled monospace fields: Repository (the sample URL), Default branch (`main`), and Knowledge revision (`a83dcf2 · 18 minutes ago`, derived from the manifest and first change). Include an outline **Explore the codebase** button with Code2 and external-arrow icons; it closes the dialog and navigates to `/codebase`.

## 17. Settings and mock session

Heading: **Settings**. Description: **Your repository, your knowledge, your choice of agent.** Use a main column and a 310px side column with 21px gaps; stack bordered sections with 24px padding.

Main sections:

- **Project:** read-only Borrow name, repository URL with GitHub icon and Sample badge, green check with Repository skill included and `.agents/skills/project-knowledge/SKILL.md`.
- **Agent & inference:** explain that agents contribute structured knowledge and the platform is provider-independent. Knowledge source options: Repository agent skill; OpenAI-compatible endpoint · future adapter; Local inference · future adapter. Selecting compatible reveals Endpoint URL, placeholder `https://inference.example.com/v1`. Save preferences persists the choice/URL and changes the button to Saved with a checkmark; editing resets that label. Helper copy explicitly says these preferences describe future adapters and this prototype makes no inference requests.
- **Interface:** Compact information density switch, description Reduce spacing in lists and board cards. Appearance row says A restrained dark interface for focused work, with a Dark badge. Compact mode reduces spacing in overview change rows, activity bodies, and task cards.

Side sections:

- **Frontend prototype:** describe Borrow as fictional and explain browser persistence. Name GitHub sync, shared agent coordination, OAuth, and inference as future integrations. Include Reset sample data.
- **Your session:** Mason Brooks avatar/name, Project administrator, Sign out.

Reset opens a confirmation dialog: **Reset the sample project?** Explain that it restores Borrow tasks, interface preferences, and notifications and removes browser-created tasks. Buttons Cancel and Reset sample data. Confirming restores seed tasks, Borrow selection, unread notifications, and non-compact density. Preserve separately stored inference preferences. Toast Sample project restored.

The initial visit opens the workspace as Mason Brooks, without forcing sign-in. Session key `codebase:session` stores the demo identity or literal `signed-out`. Sign out sets signed-out and navigates to `/login`; subsequent protected workspace visits redirect to login. This is mock navigation state, not a production authentication boundary.

Login is a standalone dark page with Threadline brand at upper left and a centered approximately 380px form panel. Show a peach B monogram and the two-line headline **Your system. / Shared understanding.** Supporting copy: **Sign in to explore Borrow’s codebase and coordinate your next change.** Include full-width Continue with GitHub, a divider saying or continue with email, labeled Email and Password inputs, and a peach Sign in button with arrow. Use browser-required/email validation; a nonempty password suffices for the demonstration. Either sign-in path creates the Mason demo session, routes to `/`, and toasts Welcome to Borrow. Never transmit or persist the entered email/password. Display **Demo session. No credentials are sent or stored.** Footer: **Codebase knowledge, maintained by the agents doing the work.**

## 18. State and persistence

Maintain one project context with immutable seed snapshot plus live task state, selected project, dismissed notification IDs, compact density, and hydration status. Shared context actions include addTask, updateTask, selectProject, dismissNotification, setCompact, and reset.

Persist task edits/new tasks, selected project, dismissed notifications, and compact density under **`codebase:borrow:v1`**. Inference preferences live under **`codebase:settings`**. Session state lives under **`codebase:session`**. Do not import unrelated project namespaces into Borrow.

Hydrate before saving so the first render does not overwrite stored work. Validate saved tasks enough to reject malformed data: string IDs/titles and arrays for component IDs, resources, criteria, and assumptions. Check saved selectedProject against valid project IDs. If parsing fails or browser storage is unavailable, fall back to the intact sample and keep in-memory interactions working. Expose a hydration marker such as `data-ready` on the shell for reliable tests.

Creating a task derives the next ID from the highest current BRW numeric suffix, with a minimum starting baseline of 49. Prepend it. Persist immediately so navigation/reload cannot discard it. Reset should deep-copy the seed tasks. All counts, search entries, cards, profiles, milestone progress, overlap notices, and task dialogs must read the shared live task collection.

## 19. Repository-owned knowledge and agent contract

Store one JSON file per component, task, change, and decision in `.project/components`, `.project/tasks`, `.project/changes`, `.project/decisions`. Store the shared project, project choices, developers, milestones, notifications, overview, planner, architecture edges/flows, and manifest records at the root of `.project`.

`manifest.json` records schema version 1, knowledge revision `a83dcf2`, recorded time, and display order. Respect explicit manifest order for records. New files not listed in the order should still be discovered, sorted after listed records with deterministic alphabetical ordering.

Create `knowledge:sync` to discover record files and generate typed `src/mock/` adapters. Generated adapters should import repository records and clearly say they are generated. The application reads these adapters through services. Browser edits remain localStorage overlays; they do not silently write Git files or publish work.

Create `knowledge:validate` to check unique/nonempty IDs, valid node and task types, required fields, valid owners/milestones, resolvable component/task/change/decision links, valid edge endpoints and flow nodes, valid parent/system links, acyclic parent chains, supported schema version, and evidence source/revision/status. Fail clearly with actionable record IDs. Run validation and synchronization before builds.

Include a reusable `.agents/skills/project-knowledge/SKILL.md` with this contract:

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

Add project-level agent guidance pointing to this contract and a README covering product purpose, setup, routes, the main workflow, architecture, verification commands, persistence/reset, and prototype integration boundaries. Use Apache-2.0 for the project and retain the font's appropriate license.

## 20. Responsive behavior and accessibility

Build for desktop and an iPhone-sized viewport of **390 × 844**. The document itself must not overflow horizontally. Graphs and the board may have intentional internal pan/scroll regions.

- At widths above 1650px use content padding about 36px vertical / 42px horizontal, overview ratio 1.4:1, upper panels at least 440px high, and slightly roomier change rows.
- At 1250px and below, sidebar/main offset becomes 210px, content padding 24px, graph/detail/settings side panels around 280px, and team grid two columns.
- At 1050px and below, overview becomes one column ordered important changes, borrowing flow, sprint, team activity. Wrap page actions/toolbars. Detail/settings stack. Architecture selector grid becomes two columns. Kanban becomes a horizontal flex scroller with columns at least 185px wide. Graph side panel is around 260px while space permits.
- At 760px and below, sidebar is hidden off-canvas, 248px wide when opened. Add Open navigation in the topbar and a dim full-screen clickable backdrop. Choosing a nav link closes it. Main offset is zero. Topbar is about 59px high with 14px side padding; content padding is 22px by 17px; main headings are 30px. Primary heading actions share a full-width row. Snapshot becomes a 2×2 grid with appropriate dividing lines.
- Mobile graph/architecture layouts stack the inspector under the canvas. Codebase canvas is around 510px high; architecture canvas around 500px. Hide the empty inspector placeholder on mobile; show actual selected details. Keep all controls reachable and node selection useful on touch, including explicit Explore buttons.
- Mobile team grid is one column; task property controls stack; overlap pairs stack; dialog padding becomes 20px. Search palette fits the viewport. Draft footer actions remain visible without covering content. Keep long source paths wrapping or internally scrollable.
- Use semantic headings, labels, buttons, links, dialogs, switches, and keyboard-operable controls. Provide accessible names for icon-only buttons, meaningful focus states, dialog focus management, and Escape dismissal. Dropdown status editing must provide a usable alternative to drag-and-drop.
- Respect reduced-motion preferences. Avoid animation beyond subtle hover changes, small menu transitions, graph focus, and a short loading spinner.

## 21. Quality bar and verification

Finish every route and interaction above. Avoid dead buttons, arbitrary placeholder text, unrelated analytics widgets, hard-coded counters disconnected from live state, and duplicated inconsistent data. Preserve the warm dark visual system throughout. Keep product copy focused on what the user can do; reserve detailed implementation explanations for Settings/README where they are useful.

Provide commands for development, production build/start, typecheck, browser tests, knowledge validation, and knowledge sync. Verify:

1. Clean initial state shows Borrow with 8 contributors, 38 components, 8 active tasks, 6 changes, 12 total tasks, and 33% sprint progress.
2. Waitlist request → Draft task → conflict against Make returned items available immediately → edit title to Fair waitlist offers → Create task → Ready task details → change to Review → save a coordination note → close → refresh → task, status, and note persist.
3. The lending-history request through Create & start produces an In progress task.
4. Returning items immediately detects the waitlist conflict in the opposite direction. Unrelated work does not display fabricated conflicts.
5. Codebase initially has 8 nodes. Double-click Borrowing to see 2 modules. Explore Loan lifecycle, select LoanService, see Check item availability, open Keep availability checks in one place, inspect alternatives, close it, and Explore functions to see requestLoan().
6. Global search for LoanService focuses its inspector. View activity applies its filter and shows 2 entries. An unmatched search produces the empty state; Clear filters restores 6 entries.
7. Drag Download my lending history to Done; refresh and confirm its new column and updated counters. Also test status editing without dragging.
8. Milestones shows Neighborhood pilot and live completion progress.
9. Return an item flow displays its exact owner-confirmation guarantee; clicking ReturnService displays its inspector.
10. Mark all notifications read; refresh and confirm the bell dot remains absent.
11. Sign out; direct visit to `/` returns to login. Continue with GitHub returns to Borrow. Email/password demo submits without sending or storing credentials.
12. Compact density and inference preferences persist. Changing inference preferences makes no model requests. Reset requires its UI confirmation and restores the defined sample state.
13. Gather/Trail show useful preview states; Explore Borrow restores the populated project.
14. Search keyboard navigation, Escape, task/component/flow/member deep links, unknown routes, and missing change IDs behave coherently.
15. At 390×844, Overview, Codebase, Architecture, Board, Team, Activity, and Settings have visible headings and no page-level horizontal overflow. Mobile navigation opens, routes, and closes correctly.
16. Knowledge validation, type checking, and production build pass. Test the real stateful workflows rather than merely checking that pages render.

Inspect the finished UI in a browser and correct spacing, wrapping, clipping, empty states, and functional defects. When finished, give me the project location, how to run it, what you verified, and any remaining real limitations. Continue through implementation and verification without stopping at scaffolding.

## Appendix A — Data contract

Use the following TypeScript contract for the domain records. These are the planned data shapes for this product.

```typescript
export type ChangeSignificance =
  "minor" | "normal" | "important" | "architectural";
export type NodeType =
  | "system"
  | "module"
  | "service"
  | "class"
  | "function"
  | "database"
  | "external-service"
  | "queue"
  | "api";
export type RelationshipType =
  | "depends-on"
  | "calls"
  | "reads-from"
  | "writes-to"
  | "publishes-to"
  | "consumes-from"
  | "contains"
  | "implements";
export type TaskStatus =
  "backlog" | "ready" | "in-progress" | "review" | "done";
export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  defaultBranch: string;
  updatedAt: string;
  componentCount: number;
  taskPrefix: string;
}
export interface Developer {
  id: string;
  name: string;
  username: string;
  role: string;
  primaryAreas: string[];
  initials: string;
  color: string;
  changes: number;
  bio: string;
}
export interface Evidence {
  source: string;
  revision: string;
  status: "recorded" | "inferred" | "confirmed";
}
export interface Change {
  id: string;
  title: string;
  summary: string;
  reason: string;
  implementation: string;
  type: "feature" | "fix" | "refactor" | "architecture" | "maintenance";
  significance: ChangeSignificance;
  authorId: string;
  timestamp: string;
  relativeTime: string;
  commitSha: string;
  pullRequestNumber: number;
  branch: string;
  componentIds: string[];
  files: string[];
  architectureBefore?: string;
  architectureAfter?: string;
  relatedTaskIds: string[];
  decisionId?: string;
  evidence: Evidence;
}
export interface ArchitectureNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  path?: string;
  responsibilities: string[];
  parentId?: string;
  systemId?: string;
  guarantees?: string[];
  decisionId?: string;
}
export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  description: string;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  labels: string[];
  componentIds: string[];
  relatedChangeIds: string[];
  milestoneId: string;
  dueDate?: string;
  acceptanceCriteria: string[];
  assumptions: string[];
  resources: string[];
  agentCreated?: boolean;
}
export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  deliverables: { title: string; complete: boolean }[];
}
export interface ArchitectureFlow {
  id: string;
  name: string;
  description: string;
  purpose: string;
  entryPoint: string;
  output: string;
  guarantees: string[];
  nodeIds: string[];
}
export interface Decision {
  id: string;
  title: string;
  date: string;
  context: string;
  decision: string;
  alternatives: { name: string; reason: string }[];
  componentIds: string[];
  status: string;
}
export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  type: "architecture" | "change" | "milestone";
}
export interface OverviewData {
  currentTaskIds: string[];
  suggestedComponentIds: string[];
  pipelineDescription: string;
  workSuggestions: { label: string; request: string }[];
  pipeline: {
    id: string;
    name: string;
    icon: "items" | "borrowing" | "pickup" | "returns" | "waitlists";
    line1: string;
    line2: string;
  }[];
  teamActivity: {
    changeId: string;
    action: string;
    detail: string;
    time: string;
  }[];
}
export interface Snapshot {
  project: Project;
  projects: { id: string; name: string; description: string }[];
  developers: Developer[];
  changes: Change[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  tasks: Task[];
  milestones: Milestone[];
  flows: ArchitectureFlow[];
  decisions: Decision[];
  notifications: Notification[];
  overview: OverviewData;
  knowledge: {
    schemaVersion: number;
    knowledgeRevision: string;
    recordedAt: string;
  };
}
export interface Overlap {
  task: Task;
  componentIds: string[];
  sharedResources: string[];
  level: "contract" | "files" | "component";
  explanation: string;
}
```

## Appendix B — Complete fictional project seed

The JSON object below maps relative filenames to their intended JSON contents. Materialize every entry at its indicated path. This is the full demonstration dataset, not optional inspiration. Keep the sample content intact and let all screens link through these shared records. The supplied order in `.project/manifest.json` determines the initial presentation order.

```json
{
  ".project/architecture.json": {
    "flows": [
      {
        "id": "borrow",
        "name": "Borrow an item",
        "description": "From finding a drill to reserving it for pickup.",
        "purpose": "Lets a neighbor request an item while making sure it is reserved for only one person.",
        "entryPoint": "A neighbor selects “Request to borrow” · POST /loans",
        "output": "A reserved item and an agreed pickup",
        "guarantees": [
          "An item can have only one active borrower",
          "Only signed-in members can request items",
          "Pickup details stay private until confirmation"
        ],
        "nodeIds": [
          "api",
          "member-service",
          "item-service",
          "loan-service",
          "availability-policy",
          "postgres",
          "pickup-service",
          "notification-service"
        ]
      },
      {
        "id": "return",
        "name": "Return an item",
        "description": "Owner confirmation makes the item ready for its next loan.",
        "purpose": "Records the end of a loan and checks what should happen to the returned item.",
        "entryPoint": "The owner selects “Confirm return” · POST /loans/:id/return",
        "output": "A completed loan and updated item availability",
        "guarantees": [
          "Only the owner can confirm the return",
          "An item stays unavailable until its return is confirmed",
          "The same availability rules apply to returns and new requests"
        ],
        "nodeIds": [
          "api",
          "member-service",
          "return-service",
          "loan-service",
          "availability-policy",
          "history-service",
          "postgres"
        ]
      },
      {
        "id": "waitlist",
        "name": "Join a waitlist",
        "description": "Get in line for an item that is already borrowed.",
        "purpose": "Gives neighbors a fair queue for popular items, with automatic offers planned for the next update.",
        "entryPoint": "A neighbor selects “Join waitlist” · POST /items/:id/waitlist",
        "output": "A saved queue position",
        "guarantees": [
          "A member can join an item waitlist only once",
          "Positions follow the order members joined",
          "Automatic offers are planned work, not a shipped feature"
        ],
        "nodeIds": ["api", "member-service", "waitlist-service", "postgres"]
      },
      {
        "id": "reminders",
        "name": "Pickup reminders",
        "description": "A useful nudge before the owner and borrower meet.",
        "purpose": "Reduces missed pickups by reminding both neighbors before their agreed time.",
        "entryPoint": "An agreed pickup time",
        "output": "One reminder per member and pickup",
        "guarantees": [
          "Cancelled pickups do not send reminders",
          "Retried jobs do not send duplicate emails"
        ],
        "nodeIds": [
          "pickup-service",
          "notification-service",
          "message-queue",
          "email"
        ]
      },
      {
        "id": "photos",
        "name": "List an item with photos",
        "description": "Help neighbors recognize what they are borrowing.",
        "purpose": "Creates a listing with a clear title, category, and photo preview.",
        "entryPoint": "The owner selects “List an item” · POST /items",
        "output": "A searchable item listing with photos",
        "guarantees": [
          "Only the owner can edit a listing",
          "Original photos are preserved",
          "Large photos use small previews in search"
        ],
        "nodeIds": [
          "api",
          "member-service",
          "photo-service",
          "object-storage",
          "item-service",
          "postgres",
          "search-service"
        ]
      },
      {
        "id": "history",
        "name": "Download lending history",
        "description": "A private record of things you have borrowed and lent.",
        "purpose": "Planned export lets a member keep a copy of their own lending history.",
        "entryPoint": "The member selects “Download my history” · GET /history/export",
        "output": "CSV containing the member’s own loans",
        "guarantees": [
          "Only your own loans are included",
          "Private pickup details are excluded",
          "Export does not change the original records"
        ],
        "nodeIds": ["api", "member-service", "history-service", "postgres"]
      }
    ],
    "edges": [
      {
        "id": "edge-0",
        "source": "items",
        "target": "borrowing",
        "type": "calls",
        "description": "An item listing can receive a borrowing request"
      },
      {
        "id": "edge-1",
        "source": "borrowing",
        "target": "returns",
        "type": "calls",
        "description": "A loan ends when its owner confirms the return"
      },
      {
        "id": "edge-2",
        "source": "returns",
        "target": "waitlists",
        "type": "calls",
        "description": "Returned items can become available to waiting neighbors"
      },
      {
        "id": "edge-3",
        "source": "waitlists",
        "target": "messages",
        "type": "calls",
        "description": "Offers notify the next person waiting"
      },
      {
        "id": "edge-4",
        "source": "members",
        "target": "borrowing",
        "type": "calls",
        "description": "A signed-in member requests an item"
      },
      {
        "id": "edge-5",
        "source": "photos",
        "target": "items",
        "type": "calls",
        "description": "Photos help neighbors recognize listed items"
      },
      {
        "id": "edge-6",
        "source": "borrowing",
        "target": "history",
        "type": "calls",
        "description": "Loan state changes appear in the item history"
      },
      {
        "id": "edge-7",
        "source": "api",
        "target": "member-service",
        "type": "calls",
        "description": "Checks the identity and permissions of the requesting member"
      },
      {
        "id": "edge-8",
        "source": "api",
        "target": "loan-service",
        "type": "calls",
        "description": "Receives a request to borrow an item"
      },
      {
        "id": "edge-9",
        "source": "loan-service",
        "target": "item-service",
        "type": "depends-on",
        "description": "Checks the listing and its owner"
      },
      {
        "id": "edge-10",
        "source": "loan-service",
        "target": "availability-policy",
        "type": "depends-on",
        "description": "Applies the shared rules before reserving an item"
      },
      {
        "id": "edge-11",
        "source": "loan-service",
        "target": "postgres",
        "type": "writes-to",
        "description": "Saves one reservation atomically"
      },
      {
        "id": "edge-12",
        "source": "loan-service",
        "target": "pickup-service",
        "type": "calls",
        "description": "Arranges a handoff for the reserved item"
      },
      {
        "id": "edge-13",
        "source": "pickup-service",
        "target": "notification-service",
        "type": "calls",
        "description": "Schedules reminders for the agreed pickup"
      },
      {
        "id": "edge-14",
        "source": "notification-service",
        "target": "message-queue",
        "type": "publishes-to",
        "description": "Queues reminder messages for delivery"
      },
      {
        "id": "edge-15",
        "source": "notification-service",
        "target": "email",
        "type": "calls",
        "description": "Sends reminders to the relevant neighbors"
      },
      {
        "id": "edge-16",
        "source": "return-service",
        "target": "loan-service",
        "type": "calls",
        "description": "Completes the loan after owner confirmation"
      },
      {
        "id": "edge-17",
        "source": "return-service",
        "target": "waitlist-service",
        "type": "calls",
        "description": "Checks whether anyone is waiting for this item; automatic offers are planned"
      },
      {
        "id": "edge-18",
        "source": "waitlist-service",
        "target": "loan-service",
        "type": "depends-on",
        "description": "Shares the availability contract used by borrowing and returns"
      },
      {
        "id": "edge-19",
        "source": "waitlist-service",
        "target": "postgres",
        "type": "writes-to",
        "description": "Records waitlist order without duplicate entries"
      },
      {
        "id": "edge-20",
        "source": "loan-service",
        "target": "history-service",
        "type": "calls",
        "description": "Adds loan state changes to the history"
      },
      {
        "id": "edge-21",
        "source": "history-service",
        "target": "postgres",
        "type": "writes-to",
        "description": "Stores private lending records"
      },
      {
        "id": "edge-22",
        "source": "member-service",
        "target": "postgres",
        "type": "reads-from",
        "description": "Checks membership and loan participants"
      },
      {
        "id": "edge-23",
        "source": "photo-service",
        "target": "object-storage",
        "type": "writes-to",
        "description": "Stores originals and resized previews"
      },
      {
        "id": "edge-24",
        "source": "item-service",
        "target": "photo-service",
        "type": "calls",
        "description": "Attaches uploaded photos to the listing"
      },
      {
        "id": "edge-25",
        "source": "item-service",
        "target": "postgres",
        "type": "writes-to",
        "description": "Saves item ownership and listing details"
      },
      {
        "id": "edge-26",
        "source": "search-service",
        "target": "postgres",
        "type": "reads-from",
        "description": "Finds matching items in the neighborhood"
      }
    ]
  },
  ".project/changes/availability-check.json": {
    "id": "availability-check",
    "title": "Double bookings prevented",
    "summary": "Every borrowing request now checks the same availability rules before reserving an item.",
    "reason": "Two neighbors could request the same drill at the same time. Availability checks in separate screens could disagree.",
    "implementation": "LoanService now owns reservation state. AvailabilityPolicy checks whether an item is available, already borrowed, or held. The database commits the reservation as one operation.",
    "type": "architecture",
    "significance": "architectural",
    "authorId": "mason",
    "timestamp": "2026-10-01T18:22:00Z",
    "relativeTime": "18 minutes ago",
    "commitSha": "a83dcf2",
    "pullRequestNumber": 142,
    "branch": "main",
    "componentIds": [
      "borrowing",
      "loan-service",
      "availability-policy",
      "postgres"
    ],
    "files": ["src/loans/loan.service.ts", "src/loans/availability-policy.ts"],
    "relatedTaskIds": ["BRW-36", "BRW-42"],
    "evidence": {
      "source": "PR #142 · ADR-017",
      "revision": "a83dcf2",
      "status": "recorded"
    },
    "architectureBefore": "Browse screen → availability check\nRequest screen → separate availability check",
    "architectureAfter": "All borrowing requests → LoanService → one reservation check",
    "decisionId": "adr-017"
  },
  ".project/changes/member-privacy.json": {
    "id": "member-privacy",
    "title": "Pickup details kept private",
    "summary": "Contact and pickup details are visible only to the owner and their confirmed borrower.",
    "reason": "A public listing should help people find an item without exposing a neighbor’s address or phone number.",
    "implementation": "MemberService verifies the people involved in the loan before returning pickup details. Public listings show the neighborhood only.",
    "type": "refactor",
    "significance": "important",
    "authorId": "priya",
    "timestamp": "2026-10-01T15:22:00Z",
    "relativeTime": "Yesterday",
    "commitSha": "b13a8cf",
    "pullRequestNumber": 139,
    "branch": "main",
    "componentIds": ["member-service", "api"],
    "files": ["src/members/member.service.ts", "src/api/routes.ts"],
    "relatedTaskIds": ["BRW-38"],
    "evidence": {
      "source": "PR #139 · ADR-018",
      "revision": "b13a8cf",
      "status": "recorded"
    },
    "decisionId": "adr-018"
  },
  ".project/changes/photo-previews.json": {
    "id": "photo-previews",
    "title": "Faster item photo previews",
    "summary": "Listing cards now use smaller photo previews so browsing feels faster.",
    "reason": "Large phone photos slowed down the item list, especially on mobile connections.",
    "implementation": "PhotoService creates a thumbnail during upload and preserves the original for the item detail page.",
    "type": "feature",
    "significance": "normal",
    "authorId": "noah",
    "timestamp": "2026-10-01T13:22:00Z",
    "relativeTime": "3 days ago",
    "commitSha": "f5d83c2",
    "pullRequestNumber": 137,
    "branch": "main",
    "componentIds": ["photos", "photo-service", "object-storage"],
    "files": ["src/photos/photo.service.ts"],
    "relatedTaskIds": ["BRW-48"],
    "evidence": {
      "source": "PR #137",
      "revision": "f5d83c2",
      "status": "recorded"
    }
  },
  ".project/changes/pickup-reminders.json": {
    "id": "pickup-reminders",
    "title": "Pickup reminders added",
    "summary": "Owners and borrowers receive a reminder before their agreed pickup time.",
    "reason": "Missed pickups left owners waiting and kept items reserved longer than necessary.",
    "implementation": "PickupService schedules a reminder through NotificationService. Cancelled loans cancel their pending reminders.",
    "type": "feature",
    "significance": "normal",
    "authorId": "sarah",
    "timestamp": "2026-10-01T16:22:00Z",
    "relativeTime": "3 hours ago",
    "commitSha": "e124a9d",
    "pullRequestNumber": 140,
    "branch": "main",
    "componentIds": ["messages", "notification-service", "pickup-service"],
    "files": [
      "src/messages/notification.service.ts",
      "src/loans/pickup.service.ts"
    ],
    "relatedTaskIds": ["BRW-37", "BRW-45"],
    "evidence": {
      "source": "PR #140",
      "revision": "e124a9d",
      "status": "recorded"
    }
  },
  ".project/changes/reminder-dedup.json": {
    "id": "reminder-dedup",
    "title": "Duplicate reminders fixed",
    "summary": "A retried message job no longer sends the same pickup reminder twice.",
    "reason": "A temporary email delivery error could cause a reminder job to retry after the email had already been sent.",
    "implementation": "Each reminder uses a stable loan-and-event key. NotificationService checks the delivery record before sending again.",
    "type": "fix",
    "significance": "normal",
    "authorId": "eli",
    "timestamp": "2026-10-01T14:22:00Z",
    "relativeTime": "2 days ago",
    "commitSha": "9ed31b4",
    "pullRequestNumber": 138,
    "branch": "main",
    "componentIds": ["notification-service", "message-queue", "email"],
    "files": ["src/messages/notification.service.ts"],
    "relatedTaskIds": ["BRW-37"],
    "evidence": {
      "source": "PR #138",
      "revision": "9ed31b4",
      "status": "recorded"
    }
  },
  ".project/changes/waitlists-added.json": {
    "id": "waitlists-added",
    "title": "Waitlists added for popular items",
    "summary": "Neighbors can join a queue when the drill, tent, or ladder they need is already borrowed.",
    "reason": "Repeatedly checking a listing was frustrating. People wanted a fair way to hear when an item was back.",
    "implementation": "WaitlistService records a member’s position and prevents duplicate joins. Automatic offers after return are the next task; the current queue is visible to the owner.",
    "type": "feature",
    "significance": "important",
    "authorId": "alex",
    "timestamp": "2026-10-01T17:22:00Z",
    "relativeTime": "1 hour ago",
    "commitSha": "c90bf71",
    "pullRequestNumber": 141,
    "branch": "main",
    "componentIds": ["waitlists", "waitlist-service", "loan-service"],
    "files": ["src/waitlists/waitlist.service.ts", "src/loans/loan.service.ts"],
    "relatedTaskIds": ["BRW-43"],
    "evidence": {
      "source": "PR #141",
      "revision": "c90bf71",
      "status": "recorded"
    }
  },
  ".project/components/api.json": {
    "id": "api",
    "name": "Borrow API",
    "type": "api",
    "description": "Receives requests from the neighborhood lending app.",
    "responsibilities": ["Route item, loan, and member requests"],
    "parentId": "loan-lifecycle",
    "systemId": "borrowing",
    "path": "src/api/routes.ts"
  },
  ".project/components/availability-policy.json": {
    "id": "availability-policy",
    "name": "AvailabilityPolicy",
    "type": "class",
    "description": "Decides whether an item is available, on loan, or held for someone waiting.",
    "responsibilities": [
      "Keep one availability rule across requests and returns",
      "Reject competing reservations"
    ],
    "parentId": "loan-lifecycle",
    "systemId": "borrowing",
    "path": "src/loans/availability-policy.ts",
    "guarantees": ["An item has at most one active reservation or loan"]
  },
  ".project/components/borrowing.json": {
    "id": "borrowing",
    "name": "Borrowing",
    "type": "system",
    "description": "Requests, reservations, and pickup arrangements.",
    "responsibilities": ["Requests, reservations, and pickup arrangements."]
  },
  ".project/components/confirm-return.json": {
    "id": "confirm-return",
    "name": "confirmReturn()",
    "type": "function",
    "description": "Record that the owner has received the item back.",
    "responsibilities": ["Record that the owner has received the item back."],
    "parentId": "return-service",
    "systemId": "returns",
    "path": "src/returns/return.service.ts"
  },
  ".project/components/email.json": {
    "id": "email",
    "name": "Email delivery",
    "type": "external-service",
    "description": "Delivers pickup reminders and waitlist offers to members.",
    "responsibilities": ["Send transactional email"],
    "parentId": "message-delivery",
    "systemId": "messages"
  },
  ".project/components/history-service.json": {
    "id": "history-service",
    "name": "LoanHistoryService",
    "type": "service",
    "description": "Records requests, handoffs, and returns in an item timeline.",
    "responsibilities": [
      "Record who changed a loan",
      "Show the owner and borrower their loan history",
      "Export a member’s own lending history"
    ],
    "parentId": "loan-history",
    "systemId": "history",
    "path": "src/history/loan-history.service.ts"
  },
  ".project/components/history.json": {
    "id": "history",
    "name": "History",
    "type": "system",
    "description": "A record of who borrowed what and when.",
    "responsibilities": ["A record of who borrowed what and when."]
  },
  ".project/components/item-discovery.json": {
    "id": "item-discovery",
    "name": "Finding items",
    "type": "module",
    "description": "Browse nearby items by category and keyword.",
    "responsibilities": ["Browse nearby items by category and keyword."],
    "parentId": "items",
    "systemId": "items"
  },
  ".project/components/item-listings.json": {
    "id": "item-listings",
    "name": "Item listings",
    "type": "module",
    "description": "Create and update shareable item listings.",
    "responsibilities": ["Create and update shareable item listings."],
    "parentId": "items",
    "systemId": "items"
  },
  ".project/components/item-service.json": {
    "id": "item-service",
    "name": "ItemService",
    "type": "service",
    "description": "Manages listings for things neighbors want to lend.",
    "responsibilities": [
      "Save item descriptions and categories",
      "Keep ownership and listing visibility current"
    ],
    "parentId": "item-listings",
    "systemId": "items",
    "path": "src/items/item.service.ts"
  },
  ".project/components/items.json": {
    "id": "items",
    "name": "Items",
    "type": "system",
    "description": "Tools, books, and camping gear neighbors can share.",
    "responsibilities": ["Tools, books, and camping gear neighbors can share."]
  },
  ".project/components/loan-history.json": {
    "id": "loan-history",
    "name": "Loan records",
    "type": "module",
    "description": "Preserve the timeline of item handoffs.",
    "responsibilities": ["Preserve the timeline of item handoffs."],
    "parentId": "history",
    "systemId": "history"
  },
  ".project/components/loan-lifecycle.json": {
    "id": "loan-lifecycle",
    "name": "Loan lifecycle",
    "type": "module",
    "description": "Manage a request from reservation to completed loan.",
    "responsibilities": [
      "Manage a request from reservation to completed loan."
    ],
    "parentId": "borrowing",
    "systemId": "borrowing"
  },
  ".project/components/loan-service.json": {
    "id": "loan-service",
    "name": "LoanService",
    "type": "service",
    "description": "Reserves an item so two neighbors cannot borrow it at once.",
    "responsibilities": [
      "Check item availability",
      "Reserve an item for one borrower",
      "Record pickup and return dates"
    ],
    "parentId": "loan-lifecycle",
    "systemId": "borrowing",
    "path": "src/loans/loan.service.ts",
    "guarantees": ["An item has at most one active reservation or loan"],
    "decisionId": "adr-017"
  },
  ".project/components/member-profiles.json": {
    "id": "member-profiles",
    "name": "Member profiles",
    "type": "module",
    "description": "Keep neighborhood identity and private contact details.",
    "responsibilities": [
      "Keep neighborhood identity and private contact details."
    ],
    "parentId": "members",
    "systemId": "members"
  },
  ".project/components/member-service.json": {
    "id": "member-service",
    "name": "MemberService",
    "type": "service",
    "description": "Checks who is borrowing and keeps private contact details protected.",
    "responsibilities": [
      "Sign members in",
      "Check item ownership",
      "Share contact details only for agreed pickups"
    ],
    "parentId": "member-profiles",
    "systemId": "members",
    "path": "src/members/member.service.ts",
    "decisionId": "adr-018"
  },
  ".project/components/members.json": {
    "id": "members",
    "name": "Members",
    "type": "system",
    "description": "Neighborhood profiles, sign-in, and trust.",
    "responsibilities": ["Neighborhood profiles, sign-in, and trust."]
  },
  ".project/components/message-delivery.json": {
    "id": "message-delivery",
    "name": "Reminder delivery",
    "type": "module",
    "description": "Schedule and deliver useful reminders.",
    "responsibilities": ["Schedule and deliver useful reminders."],
    "parentId": "messages",
    "systemId": "messages"
  },
  ".project/components/message-queue.json": {
    "id": "message-queue",
    "name": "Reminder queue",
    "type": "queue",
    "description": "Schedules messages without making the borrower wait.",
    "responsibilities": ["Deliver reminder jobs reliably"],
    "parentId": "message-delivery",
    "systemId": "messages"
  },
  ".project/components/messages.json": {
    "id": "messages",
    "name": "Messages",
    "type": "system",
    "description": "Pickup reminders and updates for borrowers and owners.",
    "responsibilities": [
      "Pickup reminders and updates for borrowers and owners."
    ]
  },
  ".project/components/notification-service.json": {
    "id": "notification-service",
    "name": "NotificationService",
    "type": "service",
    "description": "Sends pickup reminders and tells neighbors when an item is ready.",
    "responsibilities": [
      "Schedule pickup reminders",
      "Deliver waitlist offers",
      "Avoid duplicate messages"
    ],
    "parentId": "message-delivery",
    "systemId": "messages",
    "path": "src/messages/notification.service.ts"
  },
  ".project/components/object-storage.json": {
    "id": "object-storage",
    "name": "Photo storage",
    "type": "database",
    "description": "Stores the original listing photos and their previews.",
    "responsibilities": ["Keep photos outside the application database"],
    "parentId": "photo-processing",
    "systemId": "photos"
  },
  ".project/components/offer-next.json": {
    "id": "offer-next",
    "name": "offerNext()",
    "type": "function",
    "description": "Offer a returned item to the next person waiting.",
    "responsibilities": ["Offer a returned item to the next person waiting."],
    "parentId": "waitlist-service",
    "systemId": "waitlists",
    "path": "src/waitlists/waitlist.service.ts"
  },
  ".project/components/photo-processing.json": {
    "id": "photo-processing",
    "name": "Photo uploads",
    "type": "module",
    "description": "Store and resize listing photos.",
    "responsibilities": ["Store and resize listing photos."],
    "parentId": "photos",
    "systemId": "photos"
  },
  ".project/components/photo-service.json": {
    "id": "photo-service",
    "name": "PhotoService",
    "type": "service",
    "description": "Uploads clear item photos and creates small previews.",
    "responsibilities": [
      "Validate photo size and format",
      "Create thumbnails",
      "Remove photos when their owner deletes them"
    ],
    "parentId": "photo-processing",
    "systemId": "photos",
    "path": "src/photos/photo.service.ts"
  },
  ".project/components/photos.json": {
    "id": "photos",
    "name": "Photos",
    "type": "system",
    "description": "Pictures that help neighbors recognize an item.",
    "responsibilities": ["Pictures that help neighbors recognize an item."]
  },
  ".project/components/pickup-planning.json": {
    "id": "pickup-planning",
    "name": "Pickup planning",
    "type": "module",
    "description": "Agree on when and where an item changes hands.",
    "responsibilities": ["Agree on when and where an item changes hands."],
    "parentId": "borrowing",
    "systemId": "borrowing"
  },
  ".project/components/pickup-service.json": {
    "id": "pickup-service",
    "name": "PickupService",
    "type": "service",
    "description": "Helps the owner and borrower agree on a pickup.",
    "responsibilities": ["Suggest pickup times", "Confirm the agreed handoff"],
    "parentId": "pickup-planning",
    "systemId": "borrowing",
    "path": "src/loans/pickup.service.ts"
  },
  ".project/components/postgres.json": {
    "id": "postgres",
    "name": "PostgreSQL",
    "type": "database",
    "description": "Stores items, loans, waitlist positions, and member records.",
    "responsibilities": [
      "Persist lending records",
      "Keep reservations consistent"
    ],
    "parentId": "loan-history",
    "systemId": "history"
  },
  ".project/components/request-loan.json": {
    "id": "request-loan",
    "name": "requestLoan()",
    "type": "function",
    "description": "Reserve an available item for one neighbor.",
    "responsibilities": ["Reserve an available item for one neighbor."],
    "parentId": "loan-service",
    "systemId": "borrowing",
    "path": "src/loans/loan.service.ts"
  },
  ".project/components/return-checks.json": {
    "id": "return-checks",
    "name": "Return confirmation",
    "type": "module",
    "description": "Confirm returns before another loan starts.",
    "responsibilities": ["Confirm returns before another loan starts."],
    "parentId": "returns",
    "systemId": "returns"
  },
  ".project/components/return-service.json": {
    "id": "return-service",
    "name": "ReturnService",
    "type": "service",
    "description": "Records an owner-confirmed return before the item can be borrowed again.",
    "responsibilities": [
      "Require the owner to confirm a return",
      "Update the item state",
      "Tell the waitlist that the item is back"
    ],
    "parentId": "return-checks",
    "systemId": "returns",
    "path": "src/returns/return.service.ts"
  },
  ".project/components/returns.json": {
    "id": "returns",
    "name": "Returns",
    "type": "system",
    "description": "Confirm that an item is back with its owner.",
    "responsibilities": ["Confirm that an item is back with its owner."]
  },
  ".project/components/search-service.json": {
    "id": "search-service",
    "name": "ItemSearchService",
    "type": "service",
    "description": "Finds nearby items such as a drill, tent, or ladder.",
    "responsibilities": [
      "Search by name and category",
      "Filter items by neighborhood"
    ],
    "parentId": "item-discovery",
    "systemId": "items",
    "path": "src/items/search.service.ts"
  },
  ".project/components/send-reminder.json": {
    "id": "send-reminder",
    "name": "sendReminder()",
    "type": "function",
    "description": "Send one reminder for an upcoming pickup.",
    "responsibilities": ["Send one reminder for an upcoming pickup."],
    "parentId": "notification-service",
    "systemId": "messages",
    "path": "src/messages/notification.service.ts"
  },
  ".project/components/waitlist-order.json": {
    "id": "waitlist-order",
    "name": "Queue and offers",
    "type": "module",
    "description": "Order requests and offer returned items to waiting neighbors.",
    "responsibilities": [
      "Order requests and offer returned items to waiting neighbors."
    ],
    "parentId": "waitlists",
    "systemId": "waitlists"
  },
  ".project/components/waitlist-service.json": {
    "id": "waitlist-service",
    "name": "WaitlistService",
    "type": "service",
    "description": "Keeps interested neighbors in order and manages offers when an item returns.",
    "responsibilities": [
      "Join or leave an item waitlist",
      "Choose the next eligible neighbor",
      "Track and expire an offer"
    ],
    "parentId": "waitlist-order",
    "systemId": "waitlists",
    "path": "src/waitlists/waitlist.service.ts"
  },
  ".project/components/waitlists.json": {
    "id": "waitlists",
    "name": "Waitlists",
    "type": "system",
    "description": "A fair queue for items that are already borrowed.",
    "responsibilities": ["A fair queue for items that are already borrowed."]
  },
  ".project/decisions/adr-017.json": {
    "id": "adr-017",
    "title": "Keep availability checks in one place",
    "date": "Sep 29, 2026",
    "context": "Separate availability checks let two neighbors reserve the same item at once.",
    "decision": "LoanService owns item reservations. Every borrowing request and return uses the same availability rules before changing item state.",
    "alternatives": [
      {
        "name": "Check availability in each screen",
        "reason": "Rejected: separate screens could disagree or change at the same time."
      },
      {
        "name": "Let owners resolve double bookings manually",
        "reason": "Rejected: creates avoidable frustration for owners and borrowers."
      }
    ],
    "componentIds": ["loan-service", "availability-policy"],
    "status": "Accepted"
  },
  ".project/decisions/adr-018.json": {
    "id": "adr-018",
    "title": "Share pickup details only after confirmation",
    "date": "Sep 28, 2026",
    "context": "Neighbors need to find nearby items without making their address public.",
    "decision": "Public listings show a neighborhood. Only the owner and confirmed borrower can see the exact pickup location and contact details.",
    "alternatives": [
      {
        "name": "Show the address on every listing",
        "reason": "Rejected: exposes private location details to anyone browsing."
      },
      {
        "name": "Require a separate chat for every pickup",
        "reason": "Rejected: adds unnecessary work when both members have already agreed."
      }
    ],
    "componentIds": ["member-service", "pickup-service"],
    "status": "Accepted"
  },
  ".project/developers.json": [
    {
      "id": "mason",
      "name": "Mason Brooks",
      "username": "mason",
      "role": "Technical Lead",
      "primaryAreas": ["Borrowing", "Returns", "Availability"],
      "initials": "MB",
      "color": "peach",
      "changes": 24,
      "bio": "Keeps borrowing rules consistent. Ask Mason how an item moves from available to borrowed and back."
    },
    {
      "id": "alex",
      "name": "Alex Rivera",
      "username": "alex",
      "role": "Backend Engineer",
      "primaryAreas": ["Waitlists", "Returns", "Messages"],
      "initials": "AR",
      "color": "blue",
      "changes": 19,
      "bio": "Builds fair waitlists and reliable return handoffs. Ask Alex what happens when a popular item comes back."
    },
    {
      "id": "sarah",
      "name": "Sarah Chen",
      "username": "sarah",
      "role": "Frontend Engineer",
      "primaryAreas": ["Item browsing", "Photos", "Design system"],
      "initials": "SC",
      "color": "green",
      "changes": 18,
      "bio": "Makes it easy to discover a drill, a tent, or a book nearby. Owns item browsing and listing photos."
    },
    {
      "id": "jamie",
      "name": "Jamie Park",
      "username": "jamie",
      "role": "Backend Engineer",
      "primaryAreas": ["Loan history", "API", "Storage"],
      "initials": "JP",
      "color": "violet",
      "changes": 15,
      "bio": "Keeps lending history understandable and private. Owns loan records and the history export."
    },
    {
      "id": "noah",
      "name": "Noah Williams",
      "username": "noah",
      "role": "Full Stack Engineer",
      "primaryAreas": ["Photo uploads", "Reminder delivery", "Storage"],
      "initials": "NW",
      "color": "gold",
      "changes": 12,
      "bio": "Makes photo uploads quick and reminder delivery reliable."
    },
    {
      "id": "priya",
      "name": "Priya Shah",
      "username": "priya",
      "role": "Security Engineer",
      "primaryAreas": ["Member privacy", "Sign-in", "Ownership"],
      "initials": "PS",
      "color": "pink",
      "changes": 11,
      "bio": "Protects member privacy and checks who can see pickup details."
    },
    {
      "id": "eli",
      "name": "Eli Turner",
      "username": "eli",
      "role": "Full Stack Engineer",
      "primaryAreas": ["Pickup planning", "Messages", "Item listings"],
      "initials": "ET",
      "color": "blue",
      "changes": 9,
      "bio": "Builds the pickup experience and notifications for owners and borrowers."
    },
    {
      "id": "riley",
      "name": "Riley Morgan",
      "username": "riley",
      "role": "Developer Experience",
      "primaryAreas": ["Onboarding", "Documentation", "Accessibility"],
      "initials": "RM",
      "color": "green",
      "changes": 8,
      "bio": "Makes Borrow easy to join. Works on neighborhood onboarding and helpful documentation."
    }
  ],
  ".project/manifest.json": {
    "schemaVersion": 1,
    "knowledgeRevision": "a83dcf2",
    "recordedAt": "2026-10-01T18:22:00Z",
    "order": {
      "components": [
        "items",
        "borrowing",
        "returns",
        "waitlists",
        "messages",
        "members",
        "photos",
        "history",
        "item-listings",
        "item-discovery",
        "loan-lifecycle",
        "pickup-planning",
        "return-checks",
        "waitlist-order",
        "message-delivery",
        "member-profiles",
        "photo-processing",
        "loan-history",
        "item-service",
        "search-service",
        "loan-service",
        "availability-policy",
        "pickup-service",
        "return-service",
        "waitlist-service",
        "notification-service",
        "member-service",
        "photo-service",
        "history-service",
        "postgres",
        "object-storage",
        "message-queue",
        "email",
        "api",
        "request-loan",
        "confirm-return",
        "offer-next",
        "send-reminder"
      ],
      "tasks": [
        "BRW-43",
        "BRW-42",
        "BRW-44",
        "BRW-45",
        "BRW-46",
        "BRW-47",
        "BRW-48",
        "BRW-49",
        "BRW-38",
        "BRW-35",
        "BRW-36",
        "BRW-37"
      ],
      "changes": [
        "availability-check",
        "waitlists-added",
        "pickup-reminders",
        "member-privacy",
        "reminder-dedup",
        "photo-previews"
      ],
      "decisions": ["adr-017", "adr-018"]
    }
  },
  ".project/milestones.json": [
    {
      "id": "beta",
      "title": "Neighborhood pilot",
      "description": "Help the first neighborhood share everyday items with confidence.",
      "dueDate": "2026-10-31",
      "deliverables": [
        {
          "title": "Item listings",
          "complete": true
        },
        {
          "title": "Member sign-in",
          "complete": true
        },
        {
          "title": "Safe reservations",
          "complete": true
        },
        {
          "title": "Waitlist offers",
          "complete": false
        },
        {
          "title": "Lending history download",
          "complete": false
        },
        {
          "title": "Return improvements",
          "complete": false
        }
      ]
    },
    {
      "id": "v1",
      "title": "Borrow 1.0",
      "description": "Make sharing useful for more neighborhoods.",
      "dueDate": "2026-11-30",
      "deliverables": [
        {
          "title": "Listing photos",
          "complete": true
        },
        {
          "title": "Pickup reminders",
          "complete": true
        },
        {
          "title": "Neighborhood onboarding",
          "complete": false
        },
        {
          "title": "Item condition reports",
          "complete": false
        }
      ]
    }
  ],
  ".project/notifications.json": [
    {
      "id": "notice-1",
      "title": "Double bookings prevented",
      "description": "Borrowing requests now share one availability check.",
      "time": "18m",
      "href": "/activity/availability-check",
      "type": "architecture"
    },
    {
      "id": "notice-2",
      "title": "Waitlists are here",
      "description": "Alex added a queue for items that are already borrowed.",
      "time": "1h",
      "href": "/activity/waitlists-added",
      "type": "change"
    },
    {
      "id": "notice-3",
      "title": "Neighborhood pilot approaching",
      "description": "The first neighborhood launches October 31. Three deliverables remain.",
      "time": "Yesterday",
      "href": "/board?tab=milestones",
      "type": "milestone"
    }
  ],
  ".project/overview.json": {
    "pipeline": [
      {
        "id": "items",
        "name": "Find",
        "icon": "items",
        "line1": "Nearby items",
        "line2": "Drill, tent, book"
      },
      {
        "id": "borrowing",
        "name": "Request",
        "icon": "borrowing",
        "line1": "Choose dates",
        "line2": "One borrower"
      },
      {
        "id": "borrowing",
        "name": "Pick up",
        "icon": "pickup",
        "line1": "Meet the owner",
        "line2": "Agreed time"
      },
      {
        "id": "returns",
        "name": "Return",
        "icon": "returns",
        "line1": "Confirm return",
        "line2": "Ready to share"
      },
      {
        "id": "waitlists",
        "name": "Share again",
        "icon": "waitlists",
        "line1": "Next neighbor",
        "line2": "Fair queue"
      }
    ],
    "pipelineDescription": "From a neighbor’s shelf to your next project.",
    "currentTaskIds": ["BRW-43", "BRW-42", "BRW-44"],
    "suggestedComponentIds": [
      "loan-service",
      "waitlist-service",
      "return-service"
    ],
    "workSuggestions": [
      {
        "label": "Waitlist offers",
        "request": "When an item is returned, offer it to the next person on the waitlist for 24 hours."
      },
      {
        "label": "Pickup reminders",
        "request": "Let members choose when they receive pickup reminders."
      },
      {
        "label": "Lending history",
        "request": "Let members download their own lending history."
      }
    ],
    "teamActivity": [
      {
        "changeId": "availability-check",
        "action": "prevented double bookings",
        "detail": "One availability check for every request",
        "time": "18m"
      },
      {
        "changeId": "waitlists-added",
        "action": "added item waitlists",
        "detail": "A fair queue for popular items",
        "time": "1h"
      },
      {
        "changeId": "pickup-reminders",
        "action": "added pickup reminders",
        "detail": "Less waiting, fewer missed handoffs",
        "time": "3h"
      }
    ]
  },
  ".project/planner.json": {
    "rules": [
      {
        "match": "waitlist|waiting|in line|queue|first choice",
        "components": [
          "loan-service",
          "waitlist-service",
          "return-service",
          "notification-service"
        ],
        "title": "Offer returned items to the next person waiting",
        "labels": ["Feature", "Waitlists"],
        "criteria": [
          "Choose the first eligible person on the waitlist",
          "Hold the returned item for 24 hours while they decide",
          "Offer it to the next person if they decline or the offer expires"
        ],
        "assumptions": [
          "Returned items are held for the next person waiting for 24 hours"
        ]
      },
      {
        "match": "reminder|notification|email|message",
        "components": [
          "notification-service",
          "pickup-service",
          "member-service"
        ],
        "title": "Let members choose pickup reminders",
        "labels": ["Feature", "Messages"],
        "criteria": [
          "Save each member’s reminder preference",
          "Send the reminder before the agreed pickup time",
          "Cancel reminders when the pickup is cancelled"
        ],
        "assumptions": ["Essential pickup updates remain enabled"]
      },
      {
        "match": "history|export|download|csv",
        "components": ["history-service", "postgres", "member-service"],
        "title": "Download my lending history",
        "labels": ["Feature", "History"],
        "criteria": [
          "Export only the signed-in member’s own loans",
          "Include item names, dates, and loan outcomes",
          "Exclude private pickup addresses and contact details"
        ],
        "assumptions": ["Members can export only their own loan records"]
      },
      {
        "match": "return|bring back|available immediately|available to everyone",
        "components": ["loan-service", "return-service", "availability-policy"],
        "title": "Make returned items available immediately",
        "labels": ["Feature", "Returns"],
        "criteria": [
          "Require the owner to confirm the return",
          "Show the returned item as available to everyone",
          "Allow a new borrowing request immediately"
        ],
        "assumptions": [
          "Returned items become available to everyone immediately"
        ]
      },
      {
        "match": "photo|image|upload",
        "components": ["photo-service", "object-storage", "item-service"],
        "title": "Make listing photos faster to browse",
        "labels": ["Feature", "Photos"],
        "criteria": [
          "Validate the photo format and size",
          "Create a small preview for listing cards",
          "Keep the original photo and its orientation"
        ],
        "assumptions": ["Only the listing owner can change its photos"]
      },
      {
        "match": "search|category|find|filter|browse",
        "components": ["search-service", "item-service"],
        "title": "Find nearby items by category",
        "labels": ["Feature", "Items"],
        "criteria": [
          "Filter items by category and neighborhood",
          "Keep keyword search available",
          "Show a helpful empty state when no items match"
        ],
        "assumptions": [
          "Public listings show the neighborhood, not an exact address"
        ]
      },
      {
        "match": "sign.?in|login|privacy|profile|member",
        "components": ["member-service", "api", "pickup-service"],
        "title": "Protect member pickup details",
        "labels": ["Privacy", "Members"],
        "criteria": [
          "Show exact pickup details only after confirmation",
          "Allow only the owner and confirmed borrower to view them",
          "Keep public listings limited to the neighborhood"
        ],
        "assumptions": [
          "Private contact details are never part of a public listing"
        ]
      },
      {
        "match": "pickup|collect|handoff",
        "components": [
          "pickup-service",
          "loan-service",
          "notification-service"
        ],
        "title": "Help neighbors agree on a pickup time",
        "labels": ["Feature", "Borrowing"],
        "criteria": [
          "Let the owner propose pickup times",
          "Let the borrower confirm a time",
          "Notify both people when the time changes"
        ],
        "assumptions": ["A pickup can be arranged only for a reserved item"]
      },
      {
        "match": "borrow|loan|reserv",
        "components": ["loan-service", "availability-policy", "item-service"],
        "title": "Reserve an item for one borrower",
        "labels": ["Feature", "Borrowing"],
        "criteria": [
          "Check that the item is available",
          "Reserve it for only one neighbor at a time",
          "Explain when an item is on loan or held for someone waiting"
        ],
        "assumptions": ["An item has at most one active reservation or loan"]
      }
    ],
    "conflicts": [
      {
        "componentId": "loan-service",
        "firstPattern": "held for the next person waiting",
        "secondPattern": "available to everyone immediately",
        "explanation": "One task holds a returned item for the next person waiting. The other makes it available to everyone immediately. Agree on who gets first choice before changing the return rules."
      }
    ]
  },
  ".project/project.json": {
    "id": "borrow",
    "name": "Borrow",
    "description": "Share more. Buy less. Borrow from your neighbors.",
    "repositoryUrl": "https://github.com/example/borrow",
    "defaultBranch": "main",
    "updatedAt": "2026-10-01T18:22:00Z",
    "componentCount": 38,
    "taskPrefix": "BRW"
  },
  ".project/projects.json": [
    {
      "id": "borrow",
      "name": "Borrow",
      "description": "Neighborhood lending"
    },
    {
      "id": "gather",
      "name": "Gather",
      "description": "Community event planning"
    },
    {
      "id": "trail",
      "name": "Trail",
      "description": "Group trip planning"
    }
  ],
  ".project/tasks/BRW-35.json": {
    "id": "BRW-35",
    "title": "Create item listings",
    "description": "Let owners list a drill, ladder, book, or camping tent to lend.",
    "status": "done",
    "assigneeId": "mason",
    "labels": ["Feature"],
    "componentIds": ["item-service", "photo-service"],
    "relatedChangeIds": [],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Save title, category, and description",
      "Attach listing photos",
      "Allow only the owner to edit"
    ],
    "assumptions": [],
    "resources": ["src/items/item.service.ts", "src/photos/photo.service.ts"],
    "agentCreated": true
  },
  ".project/tasks/BRW-36.json": {
    "id": "BRW-36",
    "title": "Reserve an item safely",
    "description": "Prevent two borrowing requests from reserving the same item.",
    "status": "done",
    "assigneeId": "mason",
    "labels": ["Feature"],
    "componentIds": ["loan-service", "availability-policy", "postgres"],
    "relatedChangeIds": ["availability-check"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Allow one reservation per item",
      "Explain when an item is unavailable"
    ],
    "assumptions": [],
    "resources": [
      "src/loans/loan.service.ts",
      "src/loans/availability-policy.ts"
    ],
    "agentCreated": true
  },
  ".project/tasks/BRW-37.json": {
    "id": "BRW-37",
    "title": "Send pickup reminders",
    "description": "Remind the owner and borrower before their agreed pickup time.",
    "status": "done",
    "assigneeId": "eli",
    "labels": ["Feature"],
    "componentIds": ["notification-service", "message-queue", "email"],
    "relatedChangeIds": ["pickup-reminders", "reminder-dedup"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Send one reminder per pickup",
      "Cancel reminders after cancellation"
    ],
    "assumptions": [],
    "resources": ["src/messages/notification.service.ts"],
    "agentCreated": true
  },
  ".project/tasks/BRW-38.json": {
    "id": "BRW-38",
    "title": "Add member sign-in",
    "description": "Let neighbors sign in before requesting an item.",
    "status": "done",
    "assigneeId": "priya",
    "labels": ["Feature"],
    "componentIds": ["member-service", "api"],
    "relatedChangeIds": ["member-privacy"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Protect member-only requests",
      "Keep contact details private"
    ],
    "assumptions": [],
    "resources": ["src/members/member.service.ts", "src/api/routes.ts"],
    "agentCreated": true
  },
  ".project/tasks/BRW-42.json": {
    "id": "BRW-42",
    "title": "Make returned items available immediately",
    "description": "Update the return screen so an owner-confirmed return makes the item available to everyone right away.",
    "status": "review",
    "assigneeId": "mason",
    "labels": ["Feature", "Returns"],
    "componentIds": ["loan-service", "return-service", "availability-policy"],
    "relatedChangeIds": ["availability-check"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Require the owner to confirm the return",
      "Show the item as available on the browse screen",
      "Allow a new request immediately"
    ],
    "assumptions": ["Returned items become available to everyone immediately"],
    "resources": [
      "src/loans/loan.service.ts",
      "src/returns/return.service.ts",
      "src/loans/availability-policy.ts"
    ],
    "agentCreated": true
  },
  ".project/tasks/BRW-43.json": {
    "id": "BRW-43",
    "title": "Offer returned items to the waitlist",
    "description": "When a drill or tent comes back, give the next neighbor waiting 24 hours to accept before anyone else can borrow it.",
    "status": "in-progress",
    "assigneeId": "alex",
    "labels": ["Feature"],
    "componentIds": [
      "loan-service",
      "waitlist-service",
      "return-service",
      "notification-service"
    ],
    "relatedChangeIds": ["waitlists-added"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Choose the first eligible person waiting",
      "Hold the item for 24 hours while they decide",
      "Offer it to the next person if they decline or the offer expires"
    ],
    "assumptions": [
      "Returned items are held for the next person waiting for 24 hours"
    ],
    "resources": [
      "src/loans/loan.service.ts",
      "src/waitlists/waitlist.service.ts",
      "src/returns/return.service.ts",
      "src/messages/notification.service.ts"
    ],
    "agentCreated": true
  },
  ".project/tasks/BRW-44.json": {
    "id": "BRW-44",
    "title": "Download my lending history",
    "description": "Let members download their own borrowing and lending history as a CSV file.",
    "status": "ready",
    "assigneeId": "jamie",
    "labels": ["Feature", "History"],
    "componentIds": ["history-service", "postgres", "member-service"],
    "relatedChangeIds": [],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Export only the signed-in member’s records",
      "Include item, dates, and outcome",
      "Keep private contact details out of the export"
    ],
    "assumptions": ["Members can export only their own loan records"],
    "resources": [
      "src/history/loan-history.service.ts",
      "src/members/member.service.ts"
    ],
    "agentCreated": true
  },
  ".project/tasks/BRW-45.json": {
    "id": "BRW-45",
    "title": "Pickup reminder preferences",
    "description": "Let borrowers choose whether to receive an email the day before pickup.",
    "status": "in-progress",
    "assigneeId": "eli",
    "labels": ["Feature"],
    "componentIds": ["notification-service", "member-service"],
    "relatedChangeIds": ["pickup-reminders"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Save each member’s preference",
      "Skip reminders when a member opts out",
      "Keep essential handoff messages enabled"
    ],
    "assumptions": [],
    "resources": [
      "src/messages/notification.service.ts",
      "src/members/member.service.ts"
    ],
    "agentCreated": true
  },
  ".project/tasks/BRW-46.json": {
    "id": "BRW-46",
    "title": "Search by item category",
    "description": "Help neighbors find tools, books, and camping equipment without browsing every listing.",
    "status": "backlog",
    "assigneeId": "sarah",
    "labels": ["Feature"],
    "componentIds": ["search-service", "item-service"],
    "relatedChangeIds": [],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Filter by category",
      "Keep keyword search active",
      "Show a helpful state when no nearby items match"
    ],
    "assumptions": [],
    "resources": ["src/items/search.service.ts", "src/items/item.service.ts"],
    "agentCreated": true
  },
  ".project/tasks/BRW-47.json": {
    "id": "BRW-47",
    "title": "Report a damaged item",
    "description": "Let owners describe damage noticed when an item is returned.",
    "status": "backlog",
    "assigneeId": "alex",
    "labels": ["Feature", "Returns"],
    "componentIds": ["return-service", "history-service"],
    "relatedChangeIds": [],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Attach the report to a loan",
      "Let both people see the report",
      "Keep the item unavailable while the owner reviews it"
    ],
    "assumptions": [],
    "resources": [
      "src/returns/return.service.ts",
      "src/history/loan-history.service.ts"
    ],
    "agentCreated": true
  },
  ".project/tasks/BRW-48.json": {
    "id": "BRW-48",
    "title": "Compress listing photos",
    "description": "Resize large phone photos so item listings load quickly.",
    "status": "review",
    "assigneeId": "noah",
    "labels": ["Feature"],
    "componentIds": ["photo-service", "object-storage"],
    "relatedChangeIds": ["photo-previews"],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Create a small preview",
      "Keep the original photo",
      "Preserve orientation"
    ],
    "assumptions": [],
    "resources": ["src/photos/photo.service.ts"],
    "agentCreated": true
  },
  ".project/tasks/BRW-49.json": {
    "id": "BRW-49",
    "title": "Welcome new neighbors",
    "description": "Explain how borrowing, pickup, and returns work when someone joins.",
    "status": "ready",
    "assigneeId": "riley",
    "labels": ["Feature"],
    "componentIds": ["member-service", "item-service"],
    "relatedChangeIds": [],
    "milestoneId": "beta",
    "dueDate": "2026-10-06",
    "acceptanceCriteria": [
      "Show three simple onboarding steps",
      "Let returning members skip the tour",
      "Include neighborhood lending guidelines"
    ],
    "assumptions": [],
    "resources": ["src/members/member.service.ts", "src/items/item.service.ts"],
    "agentCreated": true
  }
}
```
