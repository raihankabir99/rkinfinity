# Admin Dashboard & CMS Production Readiness

Branch: `fix/admin-cms-production-readiness`
Base: `feature/admin-v2-foundation`
Scope: isolated remediation only. No production, database, or deployment changes.

## Safety rules
- Do not merge this branch into `main` until review and checks pass.
- Do not run Supabase migrations or alter production data from this workstream.
- Preserve existing routes, content, auth behavior, theme, and public-site UX.
- Keep LiveKit/chat feature changes out of the Admin/CMS release unless separately reviewed.

## Verified remediation started
- [x] Fix Admin index route's undefined `PageShell` usage by using the already-imported shared `AdminShell` for all route states.
- [x] Load saved SEO metadata when an existing blog post is opened for editing.
- [x] Prevent saving SEO metadata while its existing values are still loading.
- [x] Reset SEO/revision editor state when leaving the current post.

## Remaining implementation / verification
### Critical
- [ ] Run production build, TypeScript and lint checks; fix all errors.
- [x] Add a Cloudflare Pages Function that verifies the Supabase access token with Auth and checks the admin role using the authenticated user's RLS-scoped `user_roles` read; all seven Admin routes now use this server-verified check for their access gate.
- [ ] Confirm that each direct table operation remains protected by its table's RLS policy; the Pages Function is an identity/role gate, not a replacement for database authorization.
- [ ] Verify Supabase RLS for blog posts, SEO metadata, revisions, leads, chats, knowledge and analytics tables.
- [x] Keep the Cloudflare Pages admin-session check on the publishable key and caller's bearer token; it does not use the service-role key.
- [ ] Audit all other server-only service-role usage and ensure it is never imported into browser bundles.
- [ ] Verify Admin errors are surfaced rather than silently rendering partial metrics.

### Dashboard
- [x] Remove the 50-row client-side visitor calculation error; 24-hour KPIs now use all rows returned by paginated date-filtered reads. (A server-side aggregate RPC remains a future optimization.)
- [ ] Add explicit date range and timezone handling.
- [ ] Add query error, empty, loading and retry states for each data panel (the primary dashboard refresh now reports failures; per-panel states remain).
- [ ] Verify Realtime subscriptions, duplicate handling and cleanup.
- [x] Make the shared shell responsive on mobile/tablet and add accessible navigation controls.
- [x] Use the shared AdminShell consistently across Dashboard, Blog, Knowledge, Chats, Trainer, Leads and Analytics routes.
- [x] Calculate Dashboard 24-hour pageviews and distinct sessions from all matching visitor rows, while retaining only the latest 50 rows for the visitor table.
- [x] Paginate Analytics visitor reads in 1,000-row ranges for the full 30-day window; do not silently replace a complete result with a partial page after query failure.

### CMS
- [ ] Connect SEO metadata to public blog route head/meta generation, including canonical, Open Graph and noindex.
- [ ] Confirm SEO metadata is retained when editing older posts and when no metadata row exists.
- [ ] Add duplicate/empty slug validation and safe multilingual slug behavior.
- [ ] Add draft-first publishing, autosave, unsaved-change guard and pagination.
- [ ] Add rich text/Markdown preview that matches public rendering.
- [ ] Add category/tag management and scheduled publishing only after schema/permissions review.
- [ ] Build Media Library with MIME/size validation, upload progress, reuse and safe orphan handling.
- [ ] Add revision diff, restore confirmation and concurrency-safe versioning.

### Release checks
- [ ] Build and test on this branch only.
- [ ] Deploy Preview only; do not promote to Production.
- [ ] Run admin/non-admin authorization tests and blog create/edit/publish/unpublish/delete/SEO/revision regression tests.
- [ ] Review changed files and PR diff for unrelated LiveKit/chat/package changes.
- [ ] Open a dedicated PR to `main` only after Admin/CMS changes are isolated and green.


## Latest isolated changes
- Shared AdminShell now provides a compact horizontal navigation on small screens; all existing Admin child routes use the same shell.
- Dashboard visitor KPIs now read the complete rolling 24-hour result in 1,000-row pages. The visible visitor table remains capped at 50 recent records by design.
- Analytics reads the complete rolling 30-day result in 1,000-row pages. If any page fails, the UI reports that the report could not be fully loaded instead of showing a silently truncated dataset.
- Static migration review confirms the initial `user_roles` table has RLS enabled, self/admin read policies, and admin-only role management; the visitor, leads, site-errors, chat-logs, blog, knowledge and bot-training tables also have RLS enabled with admin-gated access for sensitive reads/writes. This is a source review only, not proof that every migration is applied correctly in the connected production Supabase project.
- Security limitation: the Admin pages perform client-side session/role checks for navigation and UX. These checks are not a substitute for server-side authorization. The Cloudflare Pages Function `functions/api/admin/session.js` now validates the supplied access token with `supabase.auth.getUser(token)` and then checks `user_roles` using that same user-scoped client. This prevents a browser-supplied user ID from being trusted as proof of identity. It is an Admin route access gate; direct reads/writes still depend on RLS policies. The Express `server.ts` was deliberately left unchanged so the Cloudflare Pages deployment does not depend on the Node server endpoint.
- The current visitor pagination is a correctness improvement but still downloads rows to the browser. A server-side aggregate function with explicit RLS/auth validation is a later optimization and would require a separately reviewed migration; none has been created or applied here.
- Validation status at the time of this update: GitHub reports the PR branch mergeable and Vercel Preview check pending. Build, lint, typecheck and browser regression tests have not yet been confirmed green.


## Server-verified Admin access update
- Added `GET /api/admin/session` as a Cloudflare Pages Function. It requires a Bearer access token, verifies it with Supabase Auth, then queries the caller's own `user_roles` row using the publishable key and that same bearer token. No service-role key is used by this Pages Function.
- Updated Dashboard, Blog, Knowledge, Chats, Trainer, Leads and Analytics routes to use the Pages Function instead of trusting a client-supplied user ID for the role check.
- The function fails closed: missing/invalid token returns 401, authenticated non-admin returns 403, and missing configuration or lookup failures return 503.
- The Express `server.ts` was restored to its base-branch version; Cloudflare Pages Functions are the active architecture for this endpoint.
- Static migration review: `user_roles` has RLS enabled and a self-read policy, which the Pages Function relies on. Sensitive tables such as leads, visitor_tracking, site_errors, chat_logs and admin writes for blog/knowledge/bot-training have admin role policies. `knowledge_base` and `bot_training` also have public SELECT policies in the initial migration; confirm that public reads are intentional before treating those datasets as private. SEO metadata and revision policies still require separate verification.
- No migration was applied, no production data was read or changed, and no deployment was promoted.
