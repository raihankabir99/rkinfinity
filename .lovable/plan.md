# Golden Bot Ecosystem + Admin Command Center + Automation

This is a large multi-part request. I'll group it into focused, shippable phases. Dark Luxury UI with gold accents is preserved throughout.

## Phase 1 — Database & Realtime

New/updated tables (single migration):

- `chat_users` — `id (uuid)`, `session_id (text unique)`, `user_name`, `ip_address`, `country`, `city`, `device`, `last_seen_at`, `created_at`. Public insert/upsert by `session_id`; admin read.
- `chat_messages` — `id`, `session_id` (FK to chat_users.session_id), `role` ('user'|'assistant'|'admin'), `content`, `created_at`. Public insert + select where `session_id = current session` (we pass via filter); admin read all.
- `projects` — `id (uuid)`, `project_id (text unique, short code)`, `client_name`, `status`, `progress (int)`, `tracking_url`, `notes`, timestamps. Public select by `project_id`; admin write.
- `kb_files` — already covered by `knowledge_base`; we'll just add `source` (`text` default 'manual') and `file_name` columns.
- Add column `mode` ('ai'|'manual') to `chat_users` (default 'ai') so admin can take over.
- Enable realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages, chat_users;` (set REPLICA IDENTITY FULL).
- Keep existing `chat_logs` for backwards compat.

## Phase 2 — Golden Bot upgrades (`src/components/Chatbot.tsx`)

- On mount: read/create `session_id` in localStorage; upsert `chat_users` row with IP/geo from existing visitor tracking hook + UA-derived device.
- Load last 50 messages from `chat_messages` for the session — replay history.
- If `user_name` exists → greet "Welcome back, [Name]!". Otherwise show new welcome:  
  _"Hi! I'm rkInfinity's assistant 🤖✨ Ask me anything about SEO, digital marketing, web dev, or RK's services. You can also track your project here using your unique ID — just type away."_
- Capture name when user introduces themselves (regex: "my name is X" / "I'm X") → update `chat_users.user_name`.
- Smart Navigation: server function detects intents (services/tools/blog/contact/about) → returns reply with link.
- Project Tracking: if message matches `/^[A-Z0-9]{4,}$/` or starts with "track" → server looks up `projects.project_id` and returns status + link.
- Persist every user/assistant message to `chat_messages` (also keep existing `chat_logs` insert).
- Subscribe to realtime: if `chat_users.mode = 'manual'` and admin posts a message → display it instantly (skip AI call).
- Server function `runChat` updated to skip Lovable AI when mode='manual' (just persist user message and wait).

## Phase 3 — Admin Command Center

`/admin/chats` updates:

- Switch from `chat_logs` to `chat_messages` + `chat_users` (richer data: name, location, device, new vs returning based on `created_at`).
- Per-session toggle "AI Mode / Manual Mode" → updates `chat_users.mode`.
- Admin reply input → inserts into `chat_messages` with role='admin'.
- Realtime subscription for new messages (both directions).
- Browser push notifications: request `Notification.permission` on load; on new inbound user message, show notification (when tab not focused).

`/admin/analytics` (new route):

- Cards: live visitors (last 5 min), today's sessions, total today, returning %.
- Device breakdown (donut), Country list (top 10), recent visits table.
- Data from existing `visitor_tracking` table.

`/admin/projects` (new route):

- CRUD for `projects` table so admin can manage project IDs/status.

## Phase 4 — Knowledge Base file upload

In `/admin/knowledge` "New Article" section:

- Add "Upload PDF / Text File" button.
- Client parses `.txt` and `.md` directly. For `.pdf` use `pdfjs-dist` (browser, no native deps) — extract text, populate the content textarea, set title from filename.
- Save flows through existing knowledge_base insert (so the bot retrieves it via the existing trained-answer logic — we'll also extend the chat server to do simple keyword search across `knowledge_base.content`).

## Phase 5 — Automation

- `.github/workflows/weekly-report.yml` — runs Mondays 09:00 UTC, curls existing `/api/public/weekly-report` route with `Authorization: Bearer ${{ secrets.WEEKLY_REPORT_SECRET }}`. Uses `EMAIL_SERVER_PASSWORD` only if the existing weekly-report route needs it (it currently uses Gmail connector, so the workflow just triggers the endpoint).

## Phase 6 — Security

- All admin routes already gated by `has_role(auth.uid(), 'admin')` check + RLS. New tables get matching policies:
  - `chat_users`: public insert + select by own session_id (we'll pass via header/filter); admin full.
  - `chat_messages`: public insert (role in 'user'); public select by session; admin full.
  - `projects`: public select by `project_id` only; admin write.
  - `kb_files`/extended `knowledge_base`: unchanged.

## Out of scope clarifications

- "messages" and "users" tables — I'll use `chat_messages`/`chat_users` to avoid clashing with auth.users and any future generic tables. Same data, clearer names.
- Email server password: I'll reference `EMAIL_SERVER_PASSWORD` in the workflow as requested, but the existing weekly-report route uses the Gmail connector — the secret is only forwarded if needed.

## Order of operations

1. Migration (Phase 1) — needs your approval.
2. After approval: Phase 2 (chatbot) + Phase 3 (admin) + Phase 4 (KB upload) + Phase 5 (workflow) in one batch.
3. Verify build, smoke-test chatbot greeting and admin inbox.

Approve the plan and I'll start with the migration.
