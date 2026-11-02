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
- [ ] Verify every Admin route enforces server-verified identity and role authorization; client-side role checks are UX only.
- [ ] Verify Supabase RLS for blog posts, SEO metadata, revisions, leads, chats, knowledge and analytics tables.
- [ ] Audit server-only service-role usage and ensure it is never imported into browser bundles.
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
- Security limitation: the Admin pages perform client-side session/role checks for navigation and UX. These checks are not a substitute for server-side authorization. The server helper `requireAdmin(userId)` checks a role for a supplied ID but does not itself validate a signed request/session, and repository search did not find call sites for it. Treat it as unused until a server route authenticates the request before passing the verified user ID.
- The current visitor pagination is a correctness improvement but still downloads rows to the browser. A server-side aggregate function with explicit RLS/auth validation is a later optimization and would require a separately reviewed migration; none has been created or applied here.
- Validation status at the time of this update: GitHub reports the PR branch mergeable and Vercel Preview check pending. Build, lint, typecheck and browser regression tests have not yet been confirmed green.
