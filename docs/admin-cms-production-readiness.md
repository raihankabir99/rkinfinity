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
- [ ] Replace 50-row client-side visitor calculations with server-side date-filtered counts and distinct session metrics.
- [ ] Add explicit date range and timezone handling.
- [ ] Add query error, empty, loading and retry states for each data panel.
- [ ] Verify Realtime subscriptions, duplicate handling and cleanup.
- [ ] Make the shared shell responsive on mobile/tablet and add accessible navigation controls.

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
