# Frontend/API compatibility guide

This guide is binding for frontend redesign work. The task is to improve the
presentation and usability of the existing product without changing its
backend contract or replacing working workflows.

## Source of truth

- `docs/openapi.yaml` is the API reference bundled with this frontend
  handoff.
- The canonical, current API contract is the Laravel repository's
  `docs/api/openapi.yaml`. The bundled file is a snapshot; reconcile it with
  the backend before implementing any newly requested API-dependent behavior.
- Existing API calls, schemas, guards, routes, tests, and backend behavior are
  also part of the compatibility boundary.
- If the documentation and implementation conflict, do not invent a
  resolution. Record the exact endpoint, request, or response discrepancy and
  ask for backend-owner confirmation.

## Non-negotiable rules

1. Do not add, remove, rename, or change API routes, HTTP methods, request
   fields, response fields, status codes, permission names, or error semantics.
2. Do not change authentication, tenant selection, account activation, email
   verification, password enforcement, or authorization behavior.
3. Do not replace live API data with hard-coded/demo values or a mock backend.
4. Do not bypass `src/lib/api/client.ts` with direct `fetch` calls for
   application API requests.
5. Preserve the existing React/TanStack architecture, route paths, hooks,
   Zod schemas, and API modules. Avoid dependency or backend changes.
6. Treat permission checks and navigation visibility as user experience only;
   the server remains the authorization authority.
7. Keep tenant data scoped through the existing active-tenant mechanism.
   Never infer that changing a UI tenant ID grants access.
8. Tenant registration allocates generated subdomains under
   `communitygroup.co.ke`. Do not add custom-domain purchase/registration
   flows.
9. Do not expose secrets, verification codes, invitation tokens, or provider
   credentials in UI logs, analytics, screenshots, source, or documentation.
10. If an improved interface genuinely needs new backend behavior, leave the
    API unchanged and raise the requirement separately instead of simulating
    success in the frontend.

## Existing transport and data conventions

The shared client in `src/lib/api/client.ts` implements the current contract:

- API paths are prefixed with `/api/v1`.
- Successful JSON responses are read from the `{ "data": ... }` envelope;
  optional metadata is in `meta`.
- Errors use `{ "error": { "code", "message", "details", "request_id" } }`.
  Field validation messages are exposed through `ApiError.details`.
- Authenticated requests use the stored bearer token. A `401` clears that
  token; preserve this behavior and surface a useful sign-in state.
- Tenant-scoped requests include the active tenant's `X-Tenant-Id` header.
  The backend validates membership; do not make a client-side tenant switch a
  security boundary.
- Multipart uploads must continue using the shared `api.upload` helper so the
  browser sets the multipart boundary correctly. Downloads must continue
  using `api.download`.
- Preserve loading, empty, validation, server-error, success, and retry states.
  Do not convert an API error into a success-shaped fallback.

New API-backed UI should normally call an existing feature API module or
TanStack Query hook, not the transport client from a page component.

## Sensitive workflows to preserve

### Sign-in and account setup

- Keep the existing login, password reset, email verification, mandatory
  initial-password change, and invitation-acceptance pages and routes.
- Invitation acceptance must use its single-use token and the current
  activation request. Do not generate or show an administrator-set password.
- Never assume a frontend redirect enforces account status or access; retain
  the current API flow and server errors.

### Tenant registration and domains

- Request suggestions using the existing business-name registration flow.
- Show available generated subdomains and the full preview.
- The user must explicitly choose/accept a slug before it is reserved.
- The server is authoritative: handle `409` unavailable responses and show
  refreshed suggestions rather than silently changing the selected slug.
- Verification codes are delivered out of band and must never be shown in
  API responses or UI logs.
- Do not claim that a saved tenant subdomain proves DNS or SSL is configured.

### Permissions and tenant isolation

- Preserve all `RequirePermission` gates, role-sensitive controls, tenant
  membership behavior, and platform-versus-tenant route distinctions.
- Do not grant a role, permission, tenant membership, or successful operation
  by changing frontend state alone.
- Preserve server-side denial messages and tenant-scoped API requests.

## Safe redesign boundaries

Generally safe changes:

- Layout, typography, spacing, color, responsive behavior, accessibility,
  visual hierarchy, and component styling.
- Reworking page markup while keeping the same route, API hook, input names,
  validation rules, submit lifecycle, and response handling.
- Shared presentational components, provided they preserve semantics and
  accessible labels.

Changes requiring explicit backend/product review:

- Any endpoint, payload, response, permission, auth, tenant-context, or
  persistence change.
- Any newly claimed capability (including a new setup state, domain action,
  email control, or invitation state) not represented by the contract.
- Removing a form field, filter, action, status, or validation because it is
  visually inconvenient.

## Required workflow and acceptance checks

1. Read the current page, shared component, API module, hook, schema, route,
   and relevant tests before changing a screen.
2. Make the smallest presentation-focused change that meets the design goal.
3. Keep the existing request and response types; do not weaken TypeScript with
   broad casts or `any`.
4. Add or update tests for altered rendering and interactions without
   replacing existing API assertions.
5. Run:

   ```sh
   npm test
   npm run build
   ```

6. For affected workflows, run the relevant Playwright tests and check
   keyboard/focus behavior and narrow/mobile layouts.
7. In the handoff, list changed screens, tests run, and any contract mismatch
   or unresolved backend dependency. Never claim backend compatibility based
   only on a successful visual render.
