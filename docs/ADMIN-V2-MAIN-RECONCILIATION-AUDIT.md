# Admin V2 / CMS / LiveKit reconciliation audit

Audit base: `main` at `ff54f3b2f0510fab63cbac2c368fa799b4a09f7d`.

## Existing production foundation verified on main

- `src/lib/admin-session.ts` calls `/api/admin/session` and fails closed when verification is unavailable.
- `functions/api/admin/session.js` validates the Supabase access token with `auth.getUser`, then checks `user_roles.role = admin`; it returns 401/403/503 on failure and sets private no-store caching.
- The current `/admin`, `/admin/blog`, `/admin/knowledge`, `/admin/chats`, `/admin/analytics`, `/admin/leads`, and `/admin/trainer` routes already use the existing admin-session helper.
- The current project uses its existing Vite/TanStack Router application and existing Cloudflare Pages Functions layout.

## Admin V2 branch review

Reviewed `feature/admin-v2-foundation` and its PR #6 (54 changed files).

Do not merge the branch wholesale. It combines:
- a replacement admin shell and route-tree changes;
- server-only Supabase service-role modules and Express/server changes;
- dependency and lockfile changes;
- LiveKit endpoints and client changes;
- multiple Supabase migrations.

The proposed `src/server/supabase-admin.server.ts` requires `SUPABASE_SERVICE_ROLE_KEY` at module import time. This is not a safe drop-in for the current Cloudflare Pages Functions architecture without verifying runtime compatibility and production secret bindings. Never expose this key to browser code.

## Migration risks identified

- `20261007010000_admin_v2_foundation_security.sql` removes public SELECT policies on `bot_training` and `knowledge_base`. This may affect public chatbot retrieval and must be tested against current read paths before deployment.
- It adds audit triggers and an `audit_logs` table; schema and trigger behavior need validation against the actual production schema.
- `20261007020000_cms_v2_revisions_seo.sql` adds revisions and SEO tables with RLS; integration requires matching application queries and type generation.
- LiveKit migrations add chat attachments, admission requests, and scheduled meetings. Admission/schedule tables revoke client access; server endpoints and authorization must be verified end-to-end before enabling these features.

## Safe integration order

1. Preserve the current main branch and Cloudflare Functions architecture.
2. Port UI shell components only after route ownership and existing admin route behavior are mapped; do not replace existing CRUD screens.
3. Keep authorization in the existing server verification path; add server endpoints only with explicit token and role checks. Do not depend on a service-role module that cannot run in the target runtime.
4. Add CMS revisions/SEO only after schema, RLS, type generation, and rollback behavior are tested.
5. Integrate LiveKit separately after reviewing every endpoint, rate-limit binding, room ownership/admission rules, secret bindings, and migration policies.
6. Run install, typecheck, lint, build, and route smoke tests before proposing a PR to main.

## Current result

No application code or database migration has been merged from the large feature branches. This is intentional: the review found no safe wholesale merge candidate. This branch is a protected integration workspace; production remains on main.
