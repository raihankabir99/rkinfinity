# Cloudflare Workers Migration — Audit & Implementation Plan

**Status:** Audit complete; implementation not started  
**Branch:** `audit/cloudflare-workers-migration`  
**Base:** `main`  
**Scope:** rkInfinity hosting/runtime migration assessment only  
**Production safety:** No production configuration, DNS, Cloudflare Pages project, secrets, Supabase data, or deployed traffic changed.

## 1. Executive summary

The repository is a Vite + React 19 + TanStack Router frontend with a custom Express 5 server. The current build emits a static Vite app and separately bundles `server.ts` as a Node.js CommonJS server (`dist/server.cjs`). A Cloudflare Worker cannot run that Express/Node server unchanged. A Workers migration is feasible, but it requires a Worker-native HTTP entry point and a deliberate port of the server-side chat integration.

**Recommended approach:** keep the existing Pages deployment intact; create a separate Worker preview deployment from this branch; migrate only after parity and security tests pass. Do not repoint the production domain or remove Pages as part of this plan.

## 2. Repository facts verified on `main`

| Area | Verified state | Implication |
|---|---|---|
| Build | `vite build && esbuild server.ts --bundle --platform=node --format=cjs ... --outfile=dist/server.cjs` | Current production server artifact targets Node, not Workers. |
| Runtime | Express 5 in `server.ts`; listens on `0.0.0.0:3000`; uses `process.env` | Requires a Worker-compatible `fetch(request, env, ctx)` entry point; no direct `app.listen`. |
| Frontend | Vite, React 19, TanStack Router; browser entry is `src/main.tsx` | Static assets can be served by Workers Static Assets. |
| Chat API | `POST /api/chat` in `server.ts`; `GET /api/health` | Preserve these routes and response contracts during migration. |
| Chat UI | `src/components/Chatbot.tsx` posts to same-origin `/api/chat` | A same-origin Worker route can avoid introducing browser CORS requirements. |
| Chat business logic | `src/server/chat.server.ts` | Uses Supabase admin data and Gemini; review portability and input validation before porting. |
| Supabase admin | `src/integrations/supabase/client.server.ts` reads `process.env.SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; service role bypasses RLS | Must never enter client bundle. Use Worker secret bindings and least-privilege data access. |
| Browser Supabase | `src/integrations/supabase/client.ts` uses Vite public env vars | Keep only publishable/anon credentials in browser build; verify production env names. |
| Wrangler config | No `wrangler.toml` or `wrangler.jsonc` found at repository root on `main` | A Worker deployment config still needs to be authored on this branch. |
| Existing `index.js` | Contains an older Worker-style chatbot using `@cloudflare/ai`, wildcard CORS, and a different response/data flow | Treat as legacy/unverified code, not as a safe migration implementation. Do not wire it into production without a separate review. |
| Analytics | Metricool and other analytics are initialized in the browser; Cloudflare Web Analytics beacon is in `index.html` | Keep browser analytics behavior unchanged; validate no duplicate beacon or tracking regressions. |

## 3. Findings and risks

### High priority — security and data access

1. `/api/chat` accepts a client-provided `session_id` and uses a service-role Supabase client to read/write chat and project-related tables. The session ID is not authentication. Before production migration, determine the intended trust boundary, verify session ownership/authorization, and prevent arbitrary project-data disclosure.
2. Validate request JSON shape, message count, role allowlist, per-message length, total payload size, and session ID format. Reject malformed or oversized requests with 4xx responses.
3. Add abuse controls (rate limits, request timeouts, bounded history, and safe error responses). Do not expose raw exception details or secrets.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` as Worker secrets only. Never use `VITE_` names for secrets. Audit built assets and source maps for accidental secret exposure.
5. Check Supabase RLS and table policies independently. Service-role access bypasses RLS; changing hosting does not fix authorization.

### High priority — runtime compatibility

1. Express middleware and `app.listen` are not a drop-in Cloudflare Worker runtime. Implement a Worker-native `fetch` handler (or a supported adapter only after verifying compatibility).
2. The current Supabase server client reads Node `process.env` at module scope/lazy initialization. Refactor to an injected environment-bound client factory so each request uses Worker bindings safely.
3. `GoogleGenAI` SDK compatibility with the Workers runtime must be proven in a preview build. If the SDK depends on unsupported Node APIs, use a Workers-compatible HTTPS client or supported SDK configuration; do not silently switch AI providers/models.
4. Ensure the Vite/TanStack Router output is actually static-compatible for this app. The inspected `vite.config.ts` uses the TanStack Router Vite plugin and React plugin; no server-side rendering entry was verified in this audit.

### Medium priority — deployment and operations

1. Add a Wrangler config with a unique Worker name, pinned `compatibility_date`, static asset directory matching the actual Vite output, and an explicit Worker entry point.
2. Route `/api/*` to the Worker handler and static paths to built assets; preserve SPA fallback behavior without shadowing API routes.
3. Keep preview URL separate from the existing `pages.dev` production URL. Configure secrets only in the preview Worker environment.
4. Verify custom-domain, DNS, cache, redirects, headers, logs, rollback, and deployment permissions before any production cutover.
5. No evidence was gathered from the live Cloudflare dashboard, existing Pages build settings, environment variable inventory, or production logs. Those remain external validation items.

## 4. Target architecture

- **Worker entry:** a new Worker-native `fetch(request, env, ctx)` module.
- **Static assets:** Vite build output served through Workers Static Assets; verify actual output directory before finalizing Wrangler config.
- **API routes:** `POST /api/chat` and `GET /api/health`; keep same-origin frontend contract.
- **Chat domain logic:** retain existing intent/training/knowledge-base/project behavior where secure and portable; inject dependencies rather than importing a process-global service-role client.
- **Secrets:** Worker bindings for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY`; secrets configured separately for preview and production.
- **Data:** continue using the existing Supabase project and schema initially. No migrations, table changes, data copies, or deletion are included in the hosting migration.
- **Observability:** structured request IDs, safe error logs, latency/error metrics, and rate-limit telemetry without logging message content or credentials.

## 5. Phased implementation plan

### Phase 0 — baseline and safeguards
- Record the current Pages project, deployed commit, build command/output directory, environment variable *names* (never values), domains, redirects, and rollback path.
- Capture baseline smoke tests for homepage, key routes, assets, chatbot, project tracking, Supabase reads/realtime, and analytics.
- Confirm branch protections and ensure all work remains isolated from `main`.

### Phase 1 — Worker foundation (preview only)
- Add Wrangler configuration and Worker entry on this branch.
- Serve the existing Vite output as static assets.
- Add `GET /api/health` with a minimal non-sensitive response.
- Deploy to a separate `workers.dev` preview; do not bind the production domain.
- Verify SPA deep links, 404 behavior, static asset caching, security headers, and build reproducibility.

### Phase 2 — chat API port
- Extract/refactor chat business logic to accept injected dependencies and Worker env bindings.
- Port `POST /api/chat` while preserving the existing JSON response shape.
- Preserve Supabase table semantics and Gemini model behavior unless a separately approved change is needed.
- Add schema validation, bounded payloads, timeouts, rate limits, authorization/session controls, and safe errors.
- Keep service-role key server-only; inspect output bundle and source maps.

### Phase 3 — parity and regression validation
- Test valid/invalid payloads, empty history, oversized history, invalid session IDs, concurrent requests, Supabase outage, missing secrets, Gemini timeout, and rate-limit responses.
- Verify chat history, manual handoff, trained answers, knowledge-base answers, project tracking, and realtime admin messages.
- Verify mobile/desktop UI, routing, analytics events, metadata, canonical URL, and page performance.
- Compare preview behavior against Pages baseline. Record every pass/fail and unresolved risk.

### Phase 4 — controlled production cutover (separate approval required)
- Prepare an explicit cutover/rollback runbook and maintenance window if needed.
- Confirm custom domain is eligible and managed by Cloudflare; prepare DNS and route plan.
- Deploy a production Worker without changing traffic, run smoke tests, then switch traffic only after explicit approval.
- Keep the Pages project and prior deployment available for rollback. Do not delete Pages or old deployments as part of this work.
- Monitor errors, latency, chat success, Supabase usage, and Worker usage/cost after cutover.

## 6. Acceptance criteria

- Production Pages URL, custom domain, DNS, and current deployment remain unchanged until explicit cutover approval.
- Worker preview builds and deploys independently on `workers.dev`.
- All existing public routes and assets behave as before, including SPA deep links.
- `/api/health` and `/api/chat` preserve expected contracts.
- Chat functionality and Supabase persistence/realtime are verified end-to-end.
- Service-role and Gemini secrets are absent from client assets, logs, and source maps.
- Authorization, validation, rate limits, and failure handling pass security tests.
- Analytics are not duplicated or broken.
- Rollback is documented and tested; Pages remains available.

## 7. Explicit non-goals / prohibited during this audit

- No changes to `main`.
- No production Pages settings, domains, DNS, routes, or traffic changes.
- No deletion or replacement of the existing Pages project or deployments.
- No Supabase schema/data migration, table deletion, or key rotation.
- No UI redesign, route rename, chat feature removal, or AI provider/model change.
- No production secret values committed to Git.
- No merge or production cutover without a separate explicit approval.

## 8. Next required inputs before implementation

- Cloudflare Pages project name and current `pages.dev` URL.
- Current Pages build command and output directory from dashboard.
- Confirmation whether the deployed Pages project currently uses Functions or only static assets.
- Environment variable *names* configured in Pages (do not paste secret values).
- Whether the existing `index.js` Worker file is legacy/unused or is referenced by any current deployment.
