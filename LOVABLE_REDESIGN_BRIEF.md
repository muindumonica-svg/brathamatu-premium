# Lovable frontend redesign brief

Redesign the complete BrathaMatu Stocktake frontend as a polished, premium SaaS product. The goal is a confident, modern operations dashboard with refined business forms, a well-organized sidebar, and a cohesive visual system across every existing screen—not a marketing-only mockup or a replacement for the working application.

## Non-negotiable: preserve the API contract

This is a frontend presentation and usability redesign. Do not change, rename, remove, or invent backend endpoints, HTTP methods, request fields, response fields, permission names, or authentication behavior. Keep the existing Laravel API as the source of truth.

- Preserve the API client in `src/lib/api/client.ts`, including the `/api/v1` prefix, JSON `data` envelopes, error handling, bearer-token authentication, active-tenant `X-Tenant-Id` header, multipart uploads, and downloads.
- Preserve every existing route, page, query/mutation, Zod schema, and permission guard. Do not replace real data or workflows with hardcoded dashboard data.
- Keep tenant scoping, role- and permission-aware navigation, password-change enforcement, email verification, invitation activation, and registration behavior intact.
- Preserve all form field names, payload shapes, validation rules, loading states, success behavior, server field errors, and API error messages.
- Keep the generated tenant-subdomain registration workflow. Custom business domains are not supported.
- Do not add a new API, proxy, authentication provider, backend dependency, or database model.
- If an interface change requires new backend behavior, leave the contract unchanged and flag the requirement rather than silently implementing a frontend-only workaround.

## Product and visual direction

Build a premium, modern operations workspace: editorial hierarchy, disciplined spacing, crisp typography, restrained color, subtle depth, clear data density, and purposeful status colors. The interface should feel trustworthy and polished for retailers and stocktake operations—not like a generic admin template.

- Establish one design system for typography, page widths, spacing, borders, elevation, radii, focus, interactive states, tables, dialogs, badges, alerts, and form controls.
- Create a refined responsive application shell with a collapsible desktop sidebar, clear active navigation, grouped sections, a compact mobile navigation pattern, tenant switcher, user/profile menu, page title/breadcrumb area, and contextual actions.
- Make the most-used dashboards immediately useful with clear metric cards, trends, actionable queues, recent activity, and helpful empty states, all backed by the existing API data.
- Make forms feel deliberate and easy to complete: clear labels and descriptions, logical grouping, optional/required indicators, inline validation, server-error summaries, helpful defaults, responsive layouts, and visible submit/loading/success states.
- Improve information-heavy pages with readable tables, filter/search toolbars, pagination, status badges, row actions, and mobile-friendly alternatives without removing existing controls or data.
- Maintain accessible contrast, keyboard navigation, visible focus, semantic headings, form labels, and reduced-motion support.
- Ensure layouts work from small phones to wide desktop screens; avoid horizontal overflow and hidden essential actions.
- Use existing assets and dependencies where practical. Do not install a large component library or introduce unnecessary dependencies without a clear need.

## Scope

The archive contains the full current frontend project: all React pages and shared components, API and auth utilities, schemas, tests, end-to-end tests, static assets, and Vite/TypeScript/package configuration. Review the whole application before settling the design. Apply the system consistently to tenant, platform-admin, workforce, marketing, POS, stocktake, finance, catalogue, inventory, support, onboarding, and authentication surfaces.

Keep the existing React, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind, and Zod stack. Prefer evolving the existing shared UI components and layout rather than replacing working application architecture.

## Required delivery and verification

Return production-quality application code, not just a visual concept. Summarize changed files and any deliberate interaction changes. Run the existing frontend build, unit tests, and relevant browser tests. Verify desktop and mobile layouts, authentication and tenant switching, permission-dependent navigation, registration, invitation acceptance, representative forms, and API-backed dashboard states. Do not claim API compatibility without preserving and testing the existing contracts.
