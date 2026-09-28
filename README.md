# RelationshipBot

RelationshipBot is a relationship guidance web app built with Next.js and TypeScript. The interface is branded **LoveStory** and brings together conversational guidance, voice interactions, and traditional Kundli compatibility tools.

## Features

- **Relationship Guru:** relationship-focused chat with scope classification, contextual replies, knowledge retrieval, citations, and input/output guardrails.
- **Voice interactions:** browser recording, speech-to-text, and text-to-speech through Sarvam.
- **Knowledge retrieval:** a starter relationship corpus, PostgreSQL full-text search, vector retrieval, and optional reranking.
- **Memory controls:** encrypted memory storage and interfaces for reviewing and managing saved information.
- **Kundli matching:** birth-detail forms, compatibility scores, Koota breakdowns, Dosha information, and follow-up chat.
- **Responsive interface:** marketing pages, an agent sidebar, and light and candlelight themes.

This repository is a development prototype. External-service features require configuration. Google and email sign-in are unfinished; the current user lookup reads a cookie directly and is not production authentication. Complete authentication and access-control review before deploying with real user data. Other agents marked “coming soon” are placeholders.

## Technology

Next.js 15, React 19, TypeScript, Tailwind CSS 4, Drizzle ORM, PostgreSQL with pgvector, OpenAI/Gemini provider integrations, Sarvam voice APIs, and Vitest.

## Local setup

Use a recent Node.js LTS release and npm.

```bash
git clone https://github.com/manasasb2000/RelationshipBot.git
cd RelationshipBot
npm ci
cp .env.example .env.local
```

Edit `.env.local` with the services you want to use. **Remove unused empty API-key and encryption-key entries**: the current environment validator expects these values to be absent or nonempty, and the encryption key must contain exactly 64 hexadecimal characters.

```bash
npm run dev
```

Open [localhost:3000](http://127.0.0.1:3000). The main application routes are `/app/guru`, `/app/kundli`, and `/app/memory`.

### Configuration

See `.env.example` for the complete template. Keep actual credentials in `.env.local` or your hosting provider's secret settings; `.env.local` is ignored by Git.

| Configuration                                        | Purpose                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                       | PostgreSQL persistence and knowledge retrieval; the database must support pgvector.     |
| `OPENAI_API_KEY`, `OPENAI_MODEL`                     | OpenAI generation, classification, and conditional web search.                          |
| `GEMINI_API_KEY`, `GEMINI_MODEL`                     | Gemini integration where supported by the pipeline.                                     |
| `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`           | Alternative provider configuration; support depends on the APIs used by each code path. |
| `EMBEDDING_API_KEY`, `EMBEDDING_MODEL`               | Embedding configuration; local hash embeddings are available for development.           |
| `SARVAM_API_KEY`                                     | Speech recognition and speech synthesis.                                                |
| `MEMORY_ENCRYPTION_KEY`                              | A 32-byte encryption key encoded as 64 hexadecimal characters.                          |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional distributed rate limiting.                                                     |
| `RERANKER_URL`, `RERANKER_API_KEY`, `RERANKER_MODEL` | Optional retrieval reranking service.                                                   |

Generate a memory encryption key locally with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Model identifiers in the template are configurable defaults. Use models available to your provider account. Authentication variables in the template do not, by themselves, enable sign-in.

### Database and knowledge base

After configuring `DATABASE_URL`:

```bash
npm run db:migrate
npm run kb:ingest
npm run kb:eval
```

The migration script currently applies only `drizzle/0000_lovestory_foundation.sql`. The additional Kundli graph schema is in `drizzle/0001_kundli_graph.sql` and requires a separate migration step if you use graph-backed functionality. The graph ingestion script is `scripts/ingest/kundli-graph.ts`.

Knowledge documents live in `knowledge/`. Re-run ingestion after changing the corpus. The `kb:eval` command uses local hash embeddings; its results do not validate paid provider behavior.

## Development commands

| Command                | Purpose                       |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start the development server. |
| `npm run build`        | Create a production build.    |
| `npm start`            | Serve a production build.     |
| `npm run lint`         | Run ESLint.                   |
| `npm run typecheck`    | Check TypeScript types.       |
| `npm test`             | Run Vitest tests.             |
| `npm run format:check` | Check formatting.             |
| `npm run format`       | Apply Prettier formatting.    |
| `npm run db:generate`  | Generate Drizzle migrations.  |

The repository also defines a Playwright command, but does not currently include a complete end-to-end test setup. Unit tests and local checks do not establish production readiness.

## Project structure

```text
app/                 Pages and API routes
components/          Marketing, chat, Kundli, and shared interface components
hooks/               Browser voice-recording hook
lib/guru/            Chat pipeline, retrieval, memory, and guardrails
lib/kundli/          Compatibility calculation engine
lib/agents/          Agent registry and scope handling
lib/tools/           Kundli, geocoding, and timezone helpers
lib/voice/           Sarvam integration
lib/db/              Database connection and schema
knowledge/           Relationship documents and Kundli reference data
drizzle/             SQL migrations
scripts/             Migration, ingestion, and retrieval evaluation tools
tests/               Unit tests and evaluation fixtures
```

## Contributing

Open an issue to discuss a change, or submit a pull request with a focused description and relevant validation results. Never include API keys, private conversations, or personal birth details in commits or issue reports.
