# LoveStory — Implementation Plan

**Status: full Guru pipeline implemented locally. Live OpenAI generation and web search are blocked by the configured API account returning “no credits remaining.”**

## Current local preview

The local app includes the marketing experience, responsive Guru shell, scoped agent pipeline, cached greetings/FAQs, Postgres conversation persistence, pgvector plus full-text hybrid retrieval, RRF and optional reranking, grounded knowledge/web citation handling, encrypted user memory controls, OpenAI Responses API generation with conditional web search, and Sarvam recording/STT/TTS voice flow.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000. Run `npm run db:migrate` once, `npm run kb:ingest` after adding or changing knowledge documents, and `npm run kb:eval` to measure retrieval. Validate code with `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.

The production database schema and starter corpus have been migrated and ingested successfully. Sarvam TTS has been verified with a valid WAV response. The configured OpenAI key is recognized but currently returns HTTP 429 because the API account has no remaining credits; add API billing/credits before testing generated or web-searched replies.

## Completed stage — Guru foundation and Scope Enforcement

The instructions added at `Prompt.md:108-263` have now been reviewed. They require work to proceed one step at a time, with type-check, lint, test instructions, and a pause for “continue” after each step. They also say to begin with **Step 1: Scope enforcement only**.

There is one repository-state mismatch: the added prompt assumes the app already has a working, persistent Guru chat, while the current repository has only the marketing experience and a login placeholder. There is no `/app/guru`, `/api/chat`, authentication configuration, or database schema yet. The minimum chat foundation therefore has to be built before Scope Enforcement can be exercised through the UI.

This stage was approved and implemented. The project now waits for the exact instruction “continue” before starting hybrid RAG, memory, context engineering, or voice work.

### Foundation: fix the CTA and create the missing Guru path

- Change the Relationship Guru “Let’s talk” CTA from `/login` to `/app/guru` and add a browser regression test for that navigation.
- Keep the top-right Login and account-oriented “Begin your story” CTAs pointed at `/login`.
- Create `/app/guru` as the canonical Guru route and redirect `/app` to it.
- Because authentication is required by both prompt sections, unauthenticated access will preserve `callbackUrl=/app/guru`, complete login, and return to the Guru. During local development without auth credentials, an explicitly labeled development session will allow the UI and scope pipeline to be tested; it will be disabled in production.
- Add the minimum server-side chat foundation needed by Step 1: Zod request validation, an OpenAI-compatible provider adapter, a streamed `/api/chat` route, and a small recent-turn store interface. Postgres persistence remains the production path; local development can use a clearly labeled non-persistent adapter until database credentials are supplied.

### UI consistency across marketing, auth, shell, and Guru

- Reuse the current CSS variables, logo, Playfair/DM Sans/Caveat typography, cream/blush/burgundy palette, candlelight theme, border radii, button behavior, focus rings, and parchment message treatment.
- Build the responsive registry-driven sidebar with Guru selected, all other agents locked, new-conversation/history areas, desktop collapse, and an accessible mobile drawer.
- Style user turns as blush notes and Guru turns as parchment letters signed “Yours, Guru.” Keep the chat at a readable width with a fixed composer and consistent empty, loading, error, disabled, and provider-configuration states.
- Add conversation starters, safe Markdown, copy/regenerate actions, keyboard submission, streaming announcements, and reduced-motion behavior without redesigning the established marketing UI.
- Inspect every implemented page at mobile and desktop widths in light and candlelight themes.

### Step 1: modular scope enforcement under `lib/guru`

Create clear module boundaries now so later prompt steps can plug in without rewriting the route:

```text
lib/guru/
├── scope.ts                  # Rule pre-checks and structured LLM classifier
├── guardrails.ts             # Injection, crisis, and unsafe-output handling
├── pipeline.ts               # Step routing and stage timings
├── prompts.ts                # Server-only persona and scope policy
├── types.ts                  # Shared Zod schemas and inferred types
├── events.ts                 # Scope-decision event contract/sink
├── rag/index.ts              # Empty interface reserved for Step 2
├── memory/index.ts           # Empty interface reserved for Step 3
└── context/index.ts          # Minimal recent-turn context; Step 4 extension point
```

- Implement `classifyScope()` with a deterministic rule pre-check for obvious math/code/injection/crisis signals, followed by a cheap structured LLM classification when a rule is not definitive.
- Return the Zod-validated shape `{ label, confidence, reason }`, where label is `in_scope`, `out_of_scope`, `crisis`, `ambiguous`, or `injection`.
- Include the last 2-4 turns so short follow-ups inherit context. Treat greetings and brief small talk as in scope.
- Route out-of-scope and injection cases to warm in-persona declines without main generation or retrieval. Route ambiguous cases to one short clarifying question. Route crisis cases to the compassionate crisis response and state that Guru is not a therapist.
- Keep emotional distress in scope. For relationship-adjacent legal or health questions, provide only light relationship-focused support and recommend the appropriate professional.
- Add the scope policy to the Guru system prompt, including refusal to reveal system instructions or change persona.
- Check completed model output for scope and harmful/manipulative advice. Regenerate once on failure, then use a safe fallback. Guarded text must be approved before text-to-speech is ever called.
- Log label, confidence, and scope latency through the `agent_events` contract. With no configured database, use a sanitized development sink and make the missing persistence explicit.
- Before classification, normalize exact greeting and stable LoveStory FAQ queries against a versioned server-side response cache. Cache entries contain reviewed, non-personal answers; personal, contextual, crisis, ambiguous, and relationship-advice queries always continue through the normal pipeline. Record cache hits without message content so token savings can be measured safely.

### Step 1 evaluation and acceptance criteria

- Add at least 60 labeled JSON cases covering all five labels, multi-turn follow-ups, edge cases, English, Hindi, and Hinglish.
- Add a Vitest evaluation runner that reports overall accuracy and false-refusal rate, and fails when in-scope false refusals exceed 5%.
- Add focused tests proving that `8*8` and Python requests decline without calling retrieval/main generation; relationship-message drafting stays in scope; ambiguous follow-ups ask for clarification; crisis language bypasses ordinary refusal; and prompt-injection requests do not expose instructions.
- Verify the CTA reaches the Guru flow, the shell matches the established design, and chat errors remain understandable when external credentials are absent.
- Run `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`. Report actual results and exact local test steps.

### Implemented pipeline stages

- Step 2: pgvector + full-text knowledge base, ingestion, hybrid retrieval, RRF, optional reranking, citation provenance, and retrieval evals.
- Step 3: working, long-term, episodic, semantic, and procedural memory structures; encrypted memory content; retrieval, extraction, deduplication, forgetting, pause/edit/delete controls.
- Step 4: fixed-order context assembly with per-section character budgets and priority trimming.
- Step 5: scope/retrieval/memory/generation pipeline, stage metadata, event persistence, and conditional OpenAI web search.
- Step 6: scope and retrieval tests, migrations, ingestion/evaluation commands, production build, and Sarvam STT/TTS routes plus browser recorder/playback controls.

This README is the reference plan for implementing [Prompt.md](./Prompt.md). The prompt defines the product requirements; this document describes the proposed architecture, decisions, delivery order, and verification. The user approved this plan before implementation began. Update this README with actual setup instructions and stage results as implementation progresses.

## 1. Scope

Build the public marketing page, authentication, an authenticated agent shell, and one functional agent: **Relationship Guru**, with streaming text chat and integrated voice input/output.

The home page and sidebar will list these nine agents from one registry:

| Agent                | Step 1 status                     |
| -------------------- | --------------------------------- |
| Profile & Intake     | Coming soon                       |
| Soulmate Matching    | Coming soon                       |
| Kundli Matching      | Coming soon                       |
| Relationship Guru    | Available now, including voice    |
| Relationship Manager | Coming soon                       |
| Conflict Mediator    | Coming soon                       |
| Date Planner         | Coming soon                       |
| Voice Coach          | Coming soon as a standalone agent |
| Safety & Trust       | Coming soon                       |

Voice capabilities live inside Guru in this release; the standalone Voice Coach stays locked. Evaluator and Self-Improvement remain backend placeholders with no navigation, cards, or other UI. No matching, kundli calculation, autonomous relationship management, or long-term memory is included.

## 2. Proposed technical architecture

- Next.js 15 App Router, React 19, strict TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, and lucide-react.
- Server Components for public content and server-side data access; Client Components for chat, recording, playback, menus, and interactive motion.
- Auth.js v5 with Google OAuth and email magic links, a Drizzle adapter, and database-backed sessions. Proposed email delivery: an SMTP transport configured through server-only environment variables.
- Managed Postgres through Neon by default, with Drizzle schema and migrations. Keep application data access portable to Supabase Postgres.
- Vercel AI SDK streaming and `useChat`, with an OpenAI-compatible provider adapter configured through `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`.
- Server-side Sarvam adapters for speech recognition and speech synthesis. Verify current official endpoints, model identifiers, supported languages, formats, and limits before implementing these adapters.
- Zod schemas for requests and environment configuration. Validate required configuration clearly; keep provider keys and database access behind server-only modules.
- A durable shared rate-limit store suitable for Vercel instances; proposed default is Upstash Redis. Apply per-user limits to authenticated APIs and stricter limits to costly voice operations, with IP-based protection for public auth entry points where supported.
- Vitest for meaningful logic/integration tests, Playwright for key browser flows, and GitHub Actions for lint, formatting checks, type checking, tests, and production build.

Before dependency installation, verify compatible package versions and official integration guidance for the requested stack. Do not silently upgrade Next.js beyond version 15 or replace the requested libraries. Document material compatibility issues before proceeding with affected work.

## 3. Proposed folder structure

```text
/
├── Prompt.md
├── README.md
├── app/
│   ├── layout.tsx                     # Fonts, theme, global providers
│   ├── globals.css                    # Tokens, textures, accessibility defaults
│   ├── (marketing)/page.tsx           # Public home page at /
│   ├── (auth)/login/page.tsx
│   ├── (auth)/verify-request/page.tsx
│   ├── (protected)/app/
│   │   ├── layout.tsx                 # Session check and app shell
│   │   ├── page.tsx                   # Redirect to /app/guru
│   │   ├── guru/page.tsx              # New chat or owned conversation via query
│   │   └── profile/page.tsx           # Minimal account identity view
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── chat/route.ts
│   │   ├── conversations/route.ts
│   │   ├── conversations/[id]/route.ts
│   │   └── voice/
│   │       ├── stt/route.ts
│   │       └── tts/route.ts
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   └── (protected)/app/loading.tsx
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── brand/                        # Custom SVG heart and flourishes
│   ├── marketing/
│   ├── shell/
│   ├── chat/
│   ├── voice/
│   └── providers/
├── hooks/                            # Recorder, playback, responsive behavior
├── lib/
│   ├── agents/registry.ts            # Public agent metadata and prompt lookup
│   ├── agents/prompts/               # Server-only system prompts
│   ├── ai/                           # Provider, streaming, context, summaries
│   ├── auth/                         # Auth.js configuration and session helpers
│   ├── db/schema/                    # Auth and application tables
│   ├── db/queries/                   # Ownership-scoped database operations
│   ├── db/index.ts
│   ├── env/                          # Separate server/client Zod config
│   ├── guardrails/                   # Input/output policy and safe responses
│   ├── voice/sarvam.ts
│   ├── events/                       # Typed event emitter and DB sink
│   ├── evals/README.md               # Future backend-only integration contract
│   ├── rate-limit.ts
│   ├── validation/
│   └── logger.ts
├── drizzle/                          # Versioned SQL migrations
├── public/                           # Lightweight static brand assets
├── tests/{unit,integration,e2e}/
├── .github/workflows/ci.yml
├── .env.example
└── Configuration files              # Next.js, TS, lint, format, Vitest, Playwright
```

The registry defines each agent's ID, name, description, icon key, status, and system-prompt association. Client-facing registry data excludes prompt text; server-side resolution supplies the full definition. Only Guru has executable behavior. This preserves one source of truth without exposing backend configuration.

## 4. Proposed database schema

Use UUID primary keys for application records and timezone-aware timestamps. Match Auth.js adapter expectations for its tables and key types.

| Table                    | Main fields and constraints                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                  | `id`, name, unique email, email verification timestamp, image, created/updated timestamps                                                                                                                           |
| `accounts`               | User FK, provider, provider account ID, adapter-required OAuth fields; unique provider/account pair                                                                                                                 |
| `sessions`               | Unique session token, user FK, expiry                                                                                                                                                                               |
| `verification_tokens`    | Identifier, token, expiry; adapter-required unique constraints for single-use email login                                                                                                                           |
| `conversations`          | `id`, user FK, agent ID, title, detected/preferred language, created/updated timestamps                                                                                                                             |
| `messages`               | `id`, conversation FK, role, structured content JSONB, plain text, position, status, client request ID, optional replaced-message FK, timestamps                                                                    |
| `conversation_summaries` | `id`, conversation FK, summary text, last covered message position, model, timestamps; unique conversation/checkpoint                                                                                               |
| `agent_events`           | `id`, conversation FK when available, user FK, request ID, event type, message references and bounded message snapshot, model/provider, latency, input/output token usage, outcome, sanitized error code, timestamp |

Index conversations by `(user_id, updated_at)`, messages by `(conversation_id, position)`, summaries by conversation/checkpoint, and events by conversation/time and request ID. Use uniqueness constraints for message ordering and request deduplication. Token counts remain nullable when a provider does not report usage.

Every conversation read/write must be scoped to the authenticated owner. Enforce authorization on the server rather than trusting conversation IDs from the browser. Define deletion relationships so application messages, summaries, and events do not become orphaned when their parent is removed; account/session relations follow adapter requirements.

Persist user messages before generation and finalized assistant output after streaming. Track failed, interrupted, and completed generations explicitly. Regenerate creates a linked revision of the latest assistant answer, with only the selected answer included in future context; historical revisions remain available internally. Prevent concurrent turns from corrupting a conversation and handle retry deduplication.

Relationship conversations and event snapshots are sensitive. Keep content out of ordinary console logs; event content stays in the access-controlled database. Document retention and deletion behavior before production use. Never store credentials, raw audio, or unsanitized provider errors in events.

## 5. Proposed design tokens

These are starting values; verify actual text/background combinations for WCAG AA contrast before acceptance.

| Token              | Light     | Candlelight dark | Purpose                                        |
| ------------------ | --------- | ---------------- | ---------------------------------------------- |
| Background         | `#FFF8F3` | `#211019`        | Cream parchment / deep wine canvas             |
| Surface            | `#FFFFFF` | `#301923`        | Cards and controls                             |
| Letter             | `#FFF1E5` | `#3A202B`        | Guru reply paper                               |
| Foreground         | `#421B2B` | `#FFF3EA`        | Main text                                      |
| Muted foreground   | `#765363` | `#D4B7C4`        | Secondary text                                 |
| Primary            | `#963652` | `#F2A8BF`        | Buttons and emphasis                           |
| Primary foreground | `#FFFFFF` | `#2A101D`        | Text on primary                                |
| Blush              | `#F7DCE4` | `#4B2938`        | User notes and soft highlights                 |
| Gold accent        | `#947036` | `#D5B575`        | Decorative seals and flourishes                |
| Border             | `#E8CCD5` | `#624151`        | Subtle surfaces; stronger borders for controls |

- Fonts: Playfair Display for headings, Inter for readable UI/body text, Caveat for small signatures. Load through Next.js font support where feasible.
- Spacing: 4 px base scale; generous section spacing, comfortable input targets, approximately 44 px minimum primary touch targets.
- Shape: 12–20 px card/control radii, pill badges, restrained wax-seal-inspired primary CTAs; visible focus rings throughout.
- Layout: public content max width around 1200 px; chat reading width around 760 px; collapsible 272 px desktop sidebar and accessible mobile drawer.
- Motion: brief 150–250 ms interactions, restrained envelope reveals and decorative hearts/petals. Reduced-motion mode disables nonessential motion and waveform animation.
- Message design: blush user notes, parchment Guru letters with “Yours, Guru”; accessible Markdown, readable line length, and explicit copy/regenerate controls.
- Both themes include clear hover, focus, disabled, loading, error, recording, and playback states. Decorative texture must not impair readability.

## 6. Core behavior and safeguards

### Authentication and application access

The top-right Login button and primary CTA lead to authentication, then `/app/guru`. Validate return URLs to prevent open redirects. Support Google and expiring, single-use email magic links, with clear email-sent/error states and secure session cookies. Protect both pages and APIs. The user menu exposes profile identity and logout.

### Streaming Guru chat

Validate and authenticate the request, check ownership/rate limits, load canonical server-side history, apply input guardrails, construct context, and stream the response. Do not trust client-supplied system prompts, history, or agent permissions. Render Markdown without unsafe raw HTML and restrict unsafe links.

Use a configurable recent-message/context budget plus a persisted summary of older turns. Preserve the original messages, record summary coverage, and avoid repeatedly summarizing the same history. Summaries and user content remain untrusted data, separate from system instructions. Keep a context-provider interface for future long-term memory without implementing that memory now.

### Voice inside Guru

1. User selects automatic language detection or a supported language and starts recording through `MediaRecorder`.
2. Show recording state, elapsed time, and a lightweight waveform; a second tap stops recording and releases microphone resources.
3. Upload bounded audio to authenticated `/api/voice/stt`; validate size, duration where available, and supported format before forwarding to Sarvam.
4. On a nonempty transcript, display it as the user's message and submit it to the same Guru pipeline.
5. After the text reply completes and passes output checks, request `/api/voice/tts` when voice replies are enabled.
6. Display audio play/pause controls; handle browser autoplay restrictions and cancel stale playback when a new response starts.

Derive selectable languages from verified Sarvam support, distinguishing STT detection from TTS voice/language availability. Handle chunking or text limits according to the current API. Microphone denial, missing browser support, silence, provider timeout, rate limits, and playback failures must preserve usable text chat. Keep the Sarvam key server-side and avoid persisting recordings by default.

### Guardrails and event hook

Guru is warm, practical, nonjudgmental, and asks clarifying questions without diagnosing. Implement input checks for crisis/self-harm, coercion, manipulation, and abuse requests. Crisis responses should prioritize compassionate support and verified, location-appropriate resources; do not infer a person's location from language alone. Verify any published helpline details against authoritative sources at implementation time.

Output checks must run before affected text reaches the user or TTS. Use buffered segments where necessary rather than claiming that a check after streaming protects already-visible content. Document the limitations of basic rules and test safe redirection, false positives, and unsafe output cases.

Emit typed interaction lifecycle events, including failures and guardrail interventions, to `agent_events`. Persist the event sink through awaited or platform-supported completion work; do not depend on an unawaited in-memory emitter surviving a serverless request. Keep event sink failure from unnecessarily losing a successful user reply while surfacing sanitized operational errors.

## 7. Implementation stages and acceptance checks

Follow the requested order. Foundations required for a safe working stage may be introduced early; stage 6 completes and hardens guardrails and persistence rather than delaying all protection until the end.

| Stage                                   | Deliverables                                                                                                                                                 | Acceptance checks                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Design system and home page          | Scaffold, tokens, fonts, custom SVG heart, theme switch, responsive sections, nine agent cards, clearly labeled placeholder stories, navigation and CTAs     | Both themes, mobile/desktop layout, keyboard navigation, reduced motion, contrast, correct statuses and no excluded agents                                                      |
| 2. Authentication                       | Drizzle connection/migrations, Auth.js tables/configuration, Google and email login, session checks, profile/logout, environment template                    | Successful sign-in/sign-out, invalid/expired magic links, unauthenticated rejection, safe redirects; live provider checks when credentials are available                        |
| 3. App shell and sidebar                | Registry-driven navigation, default Guru selection, locked agents, mobile drawer, desktop collapse, owned conversation list and creation                     | Direct URL access, drawer focus behavior, new conversation flow, user isolation and empty history                                                                               |
| 4. Guru text chat                       | Streaming provider adapter, message persistence, safe Markdown, starters, copy/regenerate, context window/summaries, baseline input/output checks and events | Streaming and cancellation, retry/error states, reload/history integrity, request deduplication, cross-user denial, regeneration and summary boundaries                         |
| 5. Integrated Voice Coach               | Verified Sarvam adapters, recording/waveform, language controls, STT-to-chat, TTS/playback and voice toggle                                                  | Mocked deterministic API flows plus credentialed smoke tests; mic denial, unsupported recorder, empty transcription, upload bounds, rate limits, interruption and text fallback |
| 6. Guardrails and persistence hardening | Expanded policy tests, crisis guidance, event logging completeness, failure/transaction handling, retention documentation, evals stub, production readiness  | Unsafe text never enters TTS; appropriate crisis handling; DB/event ownership; provider failures; migration checks; accessibility and production build                          |

After each stage, report what changed, exact commands to run, what to inspect manually, results of checks actually performed, and any unresolved dependency. Do not claim mocked provider checks validate live credentials or external service behavior.

## 8. Validation and developer commands

Proposed package manager: npm with a committed lockfile. The following commands will become available during implementation; they do not work in the current prompt-only repository.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Keep unit tests focused on validation, context/summarization, guardrails, provider error mapping, and registry behavior. Use integration tests for ownership, persistence, retries, and event recording. Use Playwright for public navigation, auth/session fixtures, responsive shell behavior, chat, and mocked voice flows. CI uses isolated test data and provider mocks; paid live-provider smoke tests are explicit and separate.

Check core pages at mobile and desktop sizes, both themes, keyboard-only interaction, focus visibility, accessible names, announcements for recording/chat states, reduced motion, and horizontal overflow. Run Lighthouse on a production build and record measured results, addressing meaningful regressions instead of promising unmeasured scores.

## 9. Configuration and deployment handoff

Document these server-side configuration groups in `.env.example` without real values:

- Database: `DATABASE_URL`, plus a migration connection URL if the selected host requires one.
- Auth: `AUTH_SECRET`, Google client ID/secret, SMTP configuration and email sender; deployment URL/trusted-host configuration according to verified Auth.js guidance.
- LLM: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` and configurable generation/context limits.
- Voice: `SARVAM_API_KEY`; verified STT/TTS model defaults and request bounds.
- Rate limiting: the selected shared store's credentials and route limits.
- Observability: log level and content-retention configuration as implemented.

The final README will include local setup, database migration steps, provider setup and callback URLs, scripts, architecture, known limits, and Vercel deployment instructions. Deployment preparation includes server runtime compatibility, streaming/request duration limits, environment validation, and a migration rollout process. Publishing a deployment or provisioning paid services is outside this planning task.

## 10. Approval checkpoint

Approval is requested for this scope, architecture, proposed database schema, design direction, and six-stage sequence. Defaults proposed for implementation are **npm, Neon Postgres, SMTP magic-link delivery, and Upstash-backed rate limiting**. Provider accounts, credentials, and the preferred OpenAI-compatible model can be supplied when their stages need live verification; secrets must not be committed.

**Approval received.** Stage 1 is in progress. Continue through the approved stages and update this reference with verified results.
