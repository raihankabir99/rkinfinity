# rkInfinity Admin V2 — Production Architecture

## Goal
Evolve the existing admin into a modular, advanced SaaS-style control center while preserving the current rkInfinity dark/futuristic visual identity and all existing public-site behavior.

## Non-negotiable constraints
- No data loss
- No breaking changes
- No public-site UI regression
- No unnecessary component renames
- Reuse existing Supabase tables where possible
- Every new migration must be additive/reversible where practical
- Sensitive operations require server-side authorization
- UI permission checks are not a security boundary

## Current confirmed modules
- /admin — Pulse dashboard
- /admin/analytics — visitor analytics
- /admin/blog — real blog CRUD
- /admin/chats — real chat_messages/chat_users + realtime
- /admin/knowledge — real knowledge_base CRUD + PDF/TXT/MD extraction
- /admin/leads — real leads inbox + realtime
- /admin/trainer — real bot_training CRUD

## Target information architecture
COMMAND CENTER
- Dashboard

CONTENT
- Pages
- Blog
- Media
- SEO

AI
- AI Control Center
- Knowledge
- Training
- Playground
- Unanswered Questions
- Live Chat
- AI Analytics

BUSINESS
- Leads
- Pipeline
- Tasks
- Follow-ups

INSIGHTS
- Analytics
- Activity
- Audit Logs

SYSTEM
- System Health
- Integrations
- Security
- Feature Flags
- Backup
- Import/Export
- Settings

## Target technical boundaries
src/admin/
  dashboard/
  cms/
  ai/
  crm/
  analytics/
  users/
  security/
  audit/
  system/
  settings/

server/
  auth/
  permissions/
  cms/
  ai/
  crm/
  analytics/
  audit/
  system/
  integrations/

## Phase order
1. Foundation: RBAC, server authorization, audit logging, route protection, error boundaries, RLS, activity tracking.
2. Admin shell: responsive sidebar/header, command center, shared table/form/modal/toast/loading/error/empty-state components.
3. CMS: pages, blog improvements, media, SEO, draft/preview/publish, revisions.
4. AI: control center, KB, training, playground, unanswered queue, human takeover, analytics.
5. Business: CRM-lite leads, pipeline, tasks, follow-ups, notifications.
6. Advanced: system health, integrations, feature flags, backup, import/export, approval workflow, advanced analytics.

## UX direction
- Preserve rkInfinity dark/gold/futuristic brand language.
- Use glass effects selectively, not everywhere.
- Prioritize information hierarchy and task completion over decoration.
- Desktop sidebar collapses to icon rail; mobile becomes a drawer.
- Tables become cards on small screens.
- Use consistent status badges, command/search, filters, bulk actions, confirmation dialogs, optimistic-safe updates, loading skeletons and actionable error states.
- Destructive actions require explicit confirmation.
- Sensitive actions should require re-authentication/MFA when implemented.

## Security notes
The current codebase performs client-side admin checks by querying user_roles. This is useful UX gating but must not be treated as the security boundary. Server-side authorization and Supabase RLS must enforce access.

The current database also had public SELECT policies on bot_training and knowledge_base; Admin V2 removes those public read policies while preserving authenticated admin reads. An append-only audit_logs table and audit triggers are added for blog_posts, bot_training, knowledge_base and projects.

## Migration strategy
Do not replace existing tables. Extend them only when a confirmed feature needs new fields. Introduce new tables for genuinely new domains such as revisions, media assets, CRM activities, tasks, AI unanswered questions, feature flags and audit/activity data.

Before each production migration:
1. Inspect current schema and RLS.
2. Create additive migration.
3. Run type/build checks.
4. Verify existing public routes and admin CRUD.
5. Verify rollback path.
6. Deploy to a non-production preview before production.
