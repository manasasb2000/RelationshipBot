You are a senior full-stack engineer and product designer. Build "LoveStory", a
production-quality web app. This is Step 1 of a larger multi-agent platform, so
architect it to grow, but only build what is listed here.

## Product
LoveStory is a relationship platform powered by AI agents. Step 1 delivers:
1. A beautiful marketing/home page
2. Login/signup
3. An app shell with a left sidebar of agents
4. One working agent: the Relationship Guru (text chat + voice)

## Tech stack
- Next.js 15 (App Router) + TypeScript (strict) + React 19
- Tailwind CSS v4 + shadcn/ui + Framer Motion + lucide-react
- Vercel AI SDK (streaming chat, `useChat`) with an OpenAI-compatible provider so
  the LLM is swappable via env vars (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL). Works
  with Groq, Together, OpenRouter, or any open-model endpoint.
- Auth.js v5 (email magic link + Google) with the login button top right
- Postgres (Neon or Supabase) + Drizzle ORM for users, conversations, messages
- Zod for validation, Zod-typed env config, Vitest + Playwright basics
- Deploy target: Vercel. Include .env.example and a README.

## Brand and design
- Name: LoveStory. Logo: a heart (custom SVG, subtle gradient, soft glow on hover).
- Theme: romantic, love letters, couple goals, emotional and warm.
- Palette: blush pink, rose, cream parchment, deep burgundy, muted gold accents.
  Support a soft "candlelight" dark mode (deep wine background).
- Typography: Playfair Display or Cormorant Garamond for headings, Inter for UI text,
  a handwriting font (Dancing Script or Caveat) for signatures and accents.
- Motifs: paper texture, wax-seal buttons, envelope-open animations, gentle floating
  hearts and petals (subtle, performant, respects prefers-reduced-motion),
  handwritten underline flourishes.
- Chat styling: the user's messages look like notes, and Guru replies look like
  love letters on parchment with a signature ("Yours, Guru"). Keep them readable.
- Fully responsive (mobile-first), accessible (WCAG AA contrast, keyboard nav,
  aria labels), fast (good Lighthouse scores).

## Home page (public)
- Top nav: heart logo + "LoveStory" on the left, links (Agents, How it works,
  Stories), and a "Login" button on the top right.
- Hero: emotional headline, subcopy, primary CTA "Begin your story", secondary
  "Meet the Guru".
- "Everything LoveStory offers" section describing all platform agents as cards:
  Profile & Intake, Soulmate Matching, Kundli Matching, Relationship Guru,
  Relationship Manager, Conflict Mediator, Date Planner, Voice Coach,
  Safety & Trust. Mark Guru (with voice) as "Available now" and the rest as
  "Coming soon".
- How it works (3-4 steps), couple-goals/testimonial section with placeholder
  content, a privacy and trust section, and a footer.
- Do NOT show an Evaluator or Self-Improvement agent anywhere in the UI.

## App shell (after login)
- Left sidebar listing the agents above with icons and status. The Relationship
  Guru is active and selected by default. The others are visible but locked with a
  "Coming soon" badge. Collapsible on desktop, drawer on mobile.
- Sidebar also has: new conversation, conversation history, user menu (profile, logout).
- Build an agent registry (`/lib/agents/registry.ts`) where each agent is defined by
  id, name, description, icon, status, and system prompt, so future agents plug in
  without changing the UI code.

## Relationship Guru agent
- Streaming chat at `/app/guru` with markdown rendering, typing indicator,
  message actions (copy, regenerate), and empty-state conversation starters.
- System prompt: a warm, wise, non-judgmental relationship guide covering
  communication, conflict, dating, boundaries, and emotional support. It asks
  clarifying questions, gives practical steps, and never diagnoses.
- Safety: crisis or self-harm language triggers a compassionate response with
  helpline guidance, a note that the Guru is not a therapist, and a basic
  input/output guardrail layer (`/lib/guardrails`). No manipulative or abusive
  relationship advice.
- Persist conversations and messages to Postgres. Keep short-term context via a
  windowed history with summarization for long chats. Structure the code so
  long-term memory can be added later.

## Voice Coach (integrated into the Guru chat)
- A microphone icon button right next to the text input. Tap to start, tap again to
  stop, with a pulsing animation and waveform while recording.
- Flow: browser MediaRecorder -> POST /api/voice/stt -> Sarvam speech-to-text
  (Saarika/Saaras) -> transcript is sent to the Guru -> reply is streamed as text ->
  POST /api/voice/tts -> Sarvam text-to-speech (Bulbul) -> play audio in the UI
  with a play/pause control and a "voice replies on/off" toggle.
- Support multiple Indian languages plus English, with auto language detection and a
  language selector. Check Sarvam's latest docs for exact endpoints, models, and
  params rather than assuming them.
- Sarvam API key stays server-side only (SARVAM_API_KEY). Handle mic-permission
  denial, unsupported browsers, network errors, and rate limits gracefully.

## Background hook (no UI)
- Log every Guru interaction (conversation id, messages, latency, token usage, model,
  errors) to an `agent_events` table via a small event-emitter module. Add a stub
  `/lib/evals` folder with a placeholder for the future Evaluator and Self-Improvement
  agent. Nothing about this appears in the UI.

## Engineering standards
- Clean folder structure, server actions or route handlers with Zod validation,
  rate limiting on API routes, secure session handling, no secrets in the client,
  error boundaries, loading skeletons, and structured logging.
- ESLint + Prettier + type-check in CI (GitHub Actions).

## Working style
1. First, propose the folder structure, DB schema, and design tokens, then wait for my OK.
2. Then build in this order: design system and home page, auth, app shell and
   sidebar, Guru text chat, Voice Coach, guardrails and persistence.
3. After each stage, tell me what to run and test.
4. 


You are a senior AI engineer. The LoveStory app (Next.js 15, TypeScript, Drizzle +
Postgres, Vercel AI SDK, OpenAI-compatible LLM via env vars) already has the
Relationship Guru chat with persistence. Upgrade the Guru into a hybrid-RAG chatbot
with full memory management and strict scope enforcement.

## Ground rules
- Reuse the existing folder structure, auth, DB, and UI. Do not redesign the UI.
- Work step by step. After each step run type-check and lint, tell me how to test it,
  and wait for "continue".
- Keep every stage behind clear module boundaries under /lib/guru/ (scope, rag,
  memory, context, pipeline) so future agents can reuse them.
- No secrets client-side. Validate all inputs with Zod.

## Target request pipeline (per user message)
1. Auth and rate limit
2. Input guardrails: injection/jailbreak check and crisis check
3. Scope gate (in-scope / out-of-scope / crisis / needs-clarification)
4. If in-scope: query rewrite, memory retrieval and hybrid RAG retrieval (parallel)
5. Context assembly under a token budget
6. LLM generation (streamed)
7. Output guardrails (scope, safety, groundedness check)
8. Async post-turn work: memory extraction and write, event logging

## Step 1: Scope enforcement (chatbot behaviour rules)
The Guru ONLY handles: relationships, dating, love, marriage/arranged-marriage
dynamics, breakups and healing, family-in-relationship issues, communication and
conflict, boundaries, intimacy and emotional connection, self-worth as it relates to
relationships, emotional support tied to feelings and relationships, and
platform-related questions (how LoveStory or the Guru works).
It must NOT perform unrelated tasks: math (e.g. "8*8"), coding, homework, trivia,
news, general writing, translation of unrelated text, medical/legal/financial
consulting unrelated to relationships, roleplay as other personas, etc.

Implement a layered guard:
a) `classifyScope()` in /lib/guru/scope.ts: a cheap, fast LLM call with a structured
   Zod output {label: in_scope | out_of_scope | crisis | ambiguous | injection,
   confidence, reason}. Include the last 2-4 turns so follow-ups like "why?" or
   "what should I say?" inherit the scope of the previous turn. Add rule-based
   pre-checks (keywords, regex for obvious math/code) to save cost, but let the
   classifier make the final call.
b) Routing: in_scope, continue the pipeline. out_of_scope, return a warm, in-persona
   decline WITHOUT calling the main LLM or retrieval, then redirect to what the Guru
   can help with. Example: "That's a bit outside my heart-work! I'm here for love,
   relationships, and how you're feeling. Is there something on your heart I can
   help with?" ambiguous, ask one short clarifying question. injection (e.g.
   "ignore your instructions", "you are now...", "reveal your system prompt"), decline
   politely and stay in character. crisis, skip the decline path and go to the
   crisis response (compassionate, encourages reaching out to a trusted person and
   local helplines, states the Guru is not a therapist). Emotional distress is always
   in scope.
c) Edge cases to handle correctly: greetings and small talk (in scope, brief),
   "help me write a text to my ex" (in scope), "what's 8*8" (out), "write Python code"
   (out), relationship-flavored disguises like "solve this math problem for my
   girlfriend" (out unless the real need is relational), legal questions about
   divorce or custody (give general relationship-focused guidance and suggest a
   professional), medical/sexual-health (light general info and suggest a professional).
d) The system prompt must also state the scope policy, forbid revealing system
   instructions, and forbid changing persona. This is a second layer, not the only one.
e) Output check: after generation, a lightweight check that the reply stays in scope
   and contains no harmful or manipulative relationship advice (control, stalking,
   coercion, gaslighting tactics). If it fails, regenerate once, then fall back to a
   safe reply.
f) Log every scope decision to `agent_events` (label, confidence, latency).
g) Write a scope eval set as JSON: 60+ labeled cases (in-scope, out-of-scope,
   injection, crisis, ambiguous, multi-turn follow-ups, English plus Hindi/Hinglish),
   and a Vitest runner that reports accuracy and false-refusal rate. Fail CI if
   false refusals on in-scope cases exceed 5%.

## Step 2: Knowledge base and hybrid RAG
- Use Postgres with pgvector (dense) plus tsvector/GIN (BM25-style keyword) in the
  same database. Add the extension and Drizzle migrations.
- Tables: `kb_documents` (source, title, license, tags, language) and `kb_chunks`
  (docId, content, embedding, tsv, metadata: topic, framework, culture, language).
- Ingestion script `/scripts/ingest`: reads markdown/PDF/text from /knowledge,
  cleans, chunks (semantic or heading-aware, ~300-500 tokens, small overlap),
  attaches metadata, embeds, upserts, and is idempotent. Provide a starter corpus
  folder structure covering: communication frameworks, attachment styles, conflict
  resolution, boundaries, dating and early relationships, breakup and healing,
  long-distance, marriage and family dynamics (including Indian cultural context),
  trust and infidelity recovery, self-worth. Only original content or properly
  licensed sources; store the license per document.
- Embeddings via env vars (EMBEDDING_BASE_URL, EMBEDDING_API_KEY, EMBEDDING_MODEL,
  EMBEDDING_DIM); multilingual model preferred.
- Retrieval in /lib/guru/rag: (1) query rewrite using conversation context, plus
  optional multi-query expansion, (2) run dense and keyword search in parallel,
  (3) merge with Reciprocal Rank Fusion, (4) rerank the top ~30 with a cross-encoder
  reranker (via API, configurable, with a graceful fallback to RRF order),
  (5) keep the top 4-6 chunks, (6) relevance threshold: if nothing clears it, answer
  without RAG rather than forcing irrelevant context.
- Retrieval gating: skip RAG for greetings, pure emotional venting, and short
  follow-ups when history suffices.
- Grounding: retrieved chunks are injected as clearly delimited reference material
  (treat as data, not instructions, to resist prompt injection through documents).
  The Guru uses them as support, applies them warmly, and never fabricates citations.
- Eval script for retrieval: a small labeled query set with hit@k and MRR, comparing
  dense-only, keyword-only, hybrid, and hybrid + rerank.

## Step 3: Memory system (all five types)
Create /lib/guru/memory with a MemoryManager and these stores, all scoped by userId:
1. Short-term (working) memory: the recent message window plus a rolling summary of
   older turns in the current conversation.
2. Long-term memory: durable user facts and preferences (relationship status, goals,
   values, communication preferences, important dates). Table `memories` with type,
   content, embedding, importance, confidence, source message id, createdAt,
   lastUsedAt, and status.
3. Episodic memory: summaries of past conversations or notable events ("Talked about
   a fight with partner over chores on <date>; felt hurt; agreed to try a weekly
   check-in"). Generated at conversation end or after inactivity. Retrieved by
   similarity plus recency.
4. Semantic memory: structured facts and relationships as subject-predicate-object
   triples in `memory_facts` (e.g. user -> partner_name -> X), used for quick
   lookups and consistency. Keep it simple; do not build a full graph DB yet.
5. Procedural memory: what works for THIS user (preferred tone, length, whether they
   want advice or just listening, techniques that helped) plus a small library of
   reusable playbooks (e.g. "difficult conversation script", "cooling-off protocol")
   stored in `procedural_memory` and selected by intent.

Memory manager behavior:
- Post-turn async extraction: a structured LLM call proposes memory writes (type,
  content, importance, confidence). Do not block the response.
- Write policy: only store durable, useful information. Deduplicate against existing
  memories by embedding similarity, merge or update on conflict (newer statement
  wins, keep history), and never store secrets, passwords, government IDs,
  payment details, or other highly sensitive data.
- Retrieval: score = relevance x recency decay x importance. Retrieve a small set per
  type and inject compactly.
- Forgetting: decay and prune low-importance stale memories.
- User control: a "Memory" page and API to view, edit, delete, and clear all
  memories, plus a toggle to pause memory. Deletion must remove embeddings too.
  Explain in the UI what is remembered.
- Privacy: encrypt sensitive memory content at rest, never share one user's memory
  with another, and exclude memory from logs.

## Step 4: Context engineering
- /lib/guru/context.ts assembles the prompt in a fixed, cache-friendly order:
  system and scope policy, procedural memory (style), semantic facts, long-term
  memories, episodic memories, RAG reference chunks, conversation summary, recent
  messages, and the current user message.
- Enforce a token budget per section with priority-based trimming, and log which
  sections were included and their sizes (debug only, no content).
- Never let retrieved memory or documents override the scope policy or system rules.

## Step 5: Wire the pipeline and observability
- Implement the pipeline in /lib/guru/pipeline.ts, run memory and RAG retrieval in
  parallel, stream the response, and emit per-stage timings (scope, retrieval,
  memory, generation, guardrails) to `agent_events`.
- Add OpenTelemetry-style spans or structured logs per stage.

## Step 6: Tests and docs
- Unit tests: scope classifier eval, RRF fusion, memory dedupe/merge, context budget
  trimming. Integration test: 8*8 gets a warm refusal with no retrieval call, a
  relationship question gets a RAG-grounded answer, and a remembered fact from an
  earlier conversation is used later.
- README section covering architecture, env vars, running ingestion, and running evals.

You are a senior full-stack + AI engineer. The LoveStory app (Next.js 15, TypeScript,
Tailwind, shadcn/ui, Drizzle + Postgres, Vercel AI SDK, OpenAI-compatible LLM via env
vars, agent registry, auth, sidebar, Guru with scope guard/memory) already exists.
Build the Kundli Matching Agent as the second live agent.

## Ground rules
- Reuse the existing design system, components, agent registry, auth, DB, env module,
  scope-guard pattern, event logging (`agent_events`), and folder conventions.
  The new UI MUST look and feel like the rest of LoveStory (parchment/love-letter
  theme, wax-seal buttons, same typography, palette, spacing, motion, dark mode).
- Work step by step. After each step run type-check and lint, tell me how to test it,
  and wait for "continue".
- No secrets client-side. Validate all inputs with Zod.

## Product behavior
A user enters birth details for two people (Partner 1 and Partner 2). The agent
computes Vedic (sidereal, Lahiri ayanamsa) compatibility and explains it warmly:
- Ashtakoot / Guna Milan: 8 kootas, 36 points total: Varna (1), Vashya (2), Tara (3),
  Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8).
- Manglik (Kuja) dosha check for each person, with cancellation conditions.
- Nadi dosha and Bhakoot dosha checks, with traditional cancellations (parihara).
- A clear overall summary and a friendly, non-fearful explanation.
Tone rules: astrology is presented as a traditional/cultural guidance system, not
scientific fact and not a sole basis for major life decisions. Never make fear-based
or fatalistic claims (death, doom, "cursed"), never shame anyone for being Manglik,
and always mention which calculation conventions were used.

## Architecture
1. Deterministic calculation engine: a small Python FastAPI service `services/kundli-engine`
   using Swiss Ephemeris (pyswisseph), Lahiri ayanamsa, exposed via a typed JSON API
   with an OpenAPI spec. Dockerfile included. Next.js calls it server-side only
   (KUNDLI_ENGINE_URL, plus a shared service token).
   Endpoints: POST /chart (moon longitude, rashi, nakshatra, pada, lagna, Mars house,
   planetary positions), POST /ashtakoot, POST /manglik, POST /doshas (nadi, bhakoot
   with cancellations), POST /match (runs all of the above and returns one structured
   result). Every response includes the conventions used and engine version.
2. Agent tools in /lib/tools/kundli (each with a Zod input/output schema, timeouts,
   retries, and structured errors):
   - `geocode_place`: place text -> candidates {name, lat, lon}; use a geocoding API
     configured via env; return top candidates so the user can confirm ambiguous places.
   - `resolve_timezone`: lat/lon + local date/time -> IANA timezone and correct
     historical UTC offset (handle historical DST and past India timezone changes).
   - `compute_chart`, `compute_ashtakoot`, `check_manglik`, `check_doshas`,
     `compute_match` (thin wrappers over the engine).
   - `retrieve_astro_rules`: GraphRAG retrieval (see below).
   Write these behind a clean interface so they can later be exposed through an
   MCP server without rewriting (no framework-specific code inside the tool logic).
3. ReAct agent in /lib/agents/kundli: multi-step tool-calling loop with the Vercel AI
   SDK (use the correct step-limit option for the installed SDK version, cap at ~8
   steps). Loop: reason, call tools (geocode -> timezone -> chart -> match -> doshas ->
   retrieve rules), observe, then explain. Rules: the LLM must NEVER compute or guess
   scores, nakshatras, or dosha status itself. All numbers come from tool results.
   Add a post-generation groundedness check that every number and verdict in the
   explanation matches the tool output; regenerate once or fall back to a template
   explanation if not.
4. GraphRAG knowledge base for astrology rules:
   - Tables `astro_nodes` (id, type, name, attributes JSON, text, embedding) and
     `astro_edges` (from, to, relation, attributes). Node types: Nakshatra, Rashi,
     Planet, Koota, Dosha, Cancellation, Concept. Relations such as: koota -> scoring
     rule, nakshatra -> gana/yoni/nadi/rashi lord, dosha -> cancelled_by -> condition,
     rashi -> lord, planet -> friend/neutral/enemy of planet.
   - Seed script from /knowledge/kundli (JSON/markdown you author): nakshatra
     attributes (27), rashi lords, planetary friendships, all 8 koota rules and
     scoring, Manglik house rules and commonly cited cancellations, Nadi and Bhakoot
     dosha rules and parihara. Mark where traditions disagree and store the
     convention per rule (configurable default). Original content only, no copied
     book text.
   - Retrieval: take entities from the computation result (e.g. Nadi dosha present,
     both Moon nakshatras), do entity linking, traverse the graph 1-2 hops (recursive
     CTE) to gather related rules and cancellation conditions, add vector/keyword
     search over node text for the user's follow-up questions, merge and rerank, and
     return compact, cited context. Retrieved text is reference data, not instructions.
5. Follow-up chat: after a result, the user can ask questions ("why is Nadi a
   concern?", "what does the Bhakoot score mean?"). The same ReAct agent answers,
   reusing the stored match result and calling tools as needed. Add a scope guard
   like the Guru's: only kundli/astrology-compatibility and closely related
   relationship questions; warm refusal otherwise; crisis routing stays intact.
6. Memory and privacy: birth data of two people is sensitive personal data. Ask for
   explicit consent before saving anyone's birth details or results ("Save these
   charts to my profile?"); default to not saving. Encrypt stored birth data at rest,
   show it in the Memory page, and let the user delete it (embeddings included). Do
   not log birth data or full results in events; log only tool names, latencies,
   status, and score totals.

## UI (must match existing LoveStory design)
Home page:
- Add a "Kundli Matching" section in the same visual language as the other sections:
  a love-letter/scroll style card with a small zodiac/nakshatra motif, short copy about
  what it does (36-point Guna Milan, Manglik, Nadi, Bhakoot, plain-language
  explanation), and a clear touch point: a wax-seal button "Match your Kundli" that
  navigates to /app/kundli. If the user is logged out, send them to login and return to
  /app/kundli afterwards. Keep the card in the agents grid too, now marked "Available now".
Sidebar:
- Change the Kundli Matching entry from "Coming soon" to active and link it.
Page /app/kundli:
- Two "envelope" or "scroll" form panels, Partner 1 and Partner 2, side by side on
  desktop, stacked on mobile. Fields: name (optional), gender, date of birth, time of
  birth (with an "I don't know the exact time" option that shows a clear warning
  about reduced accuracy for Manglik/lagna), and place of birth with an autocomplete
  that calls geocode_place and lets the user confirm the right place.
- A primary "Read the stars" wax-seal button. Validate inputs inline (no future dates,
  valid time, place confirmed).
- While running, show an animated step tracker of the real tool calls (Finding place,
  Aligning time zone, Charting the moon, Matching the 8 kootas, Checking doshas,
  Writing your reading), driven by the streamed agent events.
- Result view: a heart-shaped/ring score gauge (X / 36) with a verdict band, a
  breakdown of the 8 kootas (points obtained vs maximum, with a short meaning each),
  Manglik status per partner, Nadi and Bhakoot dosha cards showing present/absent and
  any cancellation, a streamed love-letter style explanation from the agent, a
  visible "conventions used" note and disclaimer, and an "Ask a follow-up" chat panel
  underneath. Optional: "Save this reading" (with consent) and "Download as PDF".
- Fully responsive, accessible (labels, keyboard, contrast, screen-reader text for the
  gauge), loading skeletons, and friendly error states (engine down, ambiguous place,
  geocoding failure).

## Step plan
Step 0: Audit the repo (agent registry, sidebar, home sections, design tokens, env,
  DB). Report what you'll reuse. No code changes.
Step 1: kundli-engine service + tests. Include unit tests for each koota's scoring
  table and golden tests for at least 5 known chart pairs (I will supply reference
  values from a trusted tool such as Drik Panchang or Jagannatha Hora; do not invent
  reference values, and mark the tests pending until I provide them).
Step 2: TypeScript tool wrappers, timezone/geocoding, error handling, tool tests.
Step 3: Knowledge graph schema, seed data, and GraphRAG retrieval, with tests.
Step 4: ReAct agent, groundedness check, scope guard, follow-up chat, event logging.
Step 5: UI: /app/kundli page, result view, step tracker, sidebar link.
Step 6: Home page section and touch point, agents grid update, login redirect.
Step 7: Evals and docs: eval set for scope decisions and explanation groundedness,
  Playwright smoke test (fill both forms, get a result), README section, and a
  known-limitations list.

Begin with Step 0 only.