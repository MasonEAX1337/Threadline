# Shared knowledge on a Threadline branch

Status: proposed architecture direction; no publisher, orphan branch, or synchronization has been implemented.

The team discussed storing Threadline knowledge on a dedicated `threadline` orphan branch of each participating repository. The application source in this repository still lives on `main`. The knowledge branch belongs to repositories that adopt Threadline; it is distinct from an implementation branch for building Threadline itself.

## Separate current truth from work in progress

- **Published understanding:** components, architecture, and recorded decisions tied to a specific commit on the repository's default branch.
- **Active work:** task intent, owner, affected components, expected files, and assumptions across developers' branches.
- **Proposed updates:** implementation-derived knowledge linked to its source branch, source commit, and pull request, pending integration.

Publish plans early so incompatible assumptions can be noticed before either implementation merges. Promote implementation-derived knowledge only when its source change is integrated. Keep abandoned or superseded proposals distinguishable. A moving branch name is not sufficient provenance.

## Publication boundary

A future Git adapter should fetch the latest knowledge branch, apply record changes, validate, and publish using optimistic concurrency. If the branch moved, fetch and reapply independent changes; do not silently overwrite conflicting edits to the same record. Never force-push to settle concurrent publication.

The development branch should contain a small skill/configuration pointer so agents know where knowledge lives and how to publish. Separate worktrees see each other's updates only through that configured publication workflow.

## Prototype boundary

For the initial frontend prototype, `.project/` will hold the supplied Borrow fixture on the application branch. Services read generated typed adapters; browser task edits remain localStorage overlays. No UI action writes a Git commit, runs an agent, or publishes a branch. Keep future GitHub/publication code behind a provider adapter so the UI does not depend on storage mechanics.

The publication schema, merge promotion rules, and access model still need an implementation design when real synchronization is commissioned. Do not retrofit invented branch/revision evidence into the supplied Borrow records.
