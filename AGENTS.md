<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## BrathaMatu project rules
- Routes are declared in `src/app/routes.ts` (virtual route config, wired in both `vite.config.ts` and `tsr.config.json`); every page is a flat child of the root so route IDs equal URL paths — pages rely on `useParams({ from: '<path>' })`.
- Workspace route files set `ssr: false` because auth guards and pages read the session token from browser storage; only the public homepage at `/` is server-rendered for SEO.
- Auth guards live in `src/app/routeGuards.ts`; the Laravel API contract (endpoints, envelopes, enums, permissions) in `src/lib/api` is the source of truth and must not change from the frontend.
- Homepage code lives in `src/features/home`; its colours, radii and shadows come from semantic tokens in `src/styles.css`, while workspace pages keep the original `brand-*`/`ink-*` tokens.
