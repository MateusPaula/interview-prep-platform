# Architecture

Interview Prep Platform: daily coding challenges with AI hints, an interview timer, weak-area tracking, behavioral practice with STAR feedback, and a confidence tracker. Next.js App Router, TypeScript strict, Supabase, OpenRouter, next-intl (en default, pt-BR).

## Layers and the dependency rule

```
src/core/domain          entities, value objects, enums, pure functions
src/core/contracts       API request/response DTOs (depend on domain only)
src/core/application     use cases; ports/ holds the interfaces they depend on
src/infrastructure       Supabase + OpenRouter adapters implementing the ports
src/app/api              route handlers (compose use cases + adapters)
src/app/[locale]         pages; src/components, src/hooks, src/stores
```

Dependencies point inward only:

- `core/domain` imports nothing outside itself.
- `core/contracts` and `core/application/ports` import only `core/domain`.
- `core/application` use cases import domain + ports. Never infrastructure.
- `src/infrastructure` implements ports; imports domain, ports, and vendor SDKs.
- `src/app/api` wires use cases to adapters and speaks `core/contracts` on the wire.
- Frontend (`src/app/[locale]`, components, hooks, stores) imports domain types, contracts, and its own modules. Never application, and never infrastructure except the sanctioned auth seam: `src/infrastructure/supabase/browser-client.ts` and `server-client.ts`, because Supabase authentication is intentionally client-driven and has no API route.

Anything in `core/` is framework-free: no Next.js, Supabase, OpenAI, or React imports.

## Data flow

1. Page or client component calls a hook in `src/hooks` (plain `fetch` against `/api/*`, typed with `core/contracts`).
2. The route handler in `src/app/api` authenticates via the Supabase server client, validates the body with the domain guards (`isHintLevel`, `isTopic`, `isConfidenceLevel`, `isAttemptOutcome`), and invokes a use case.
3. The use case orchestrates ports (`ChallengeRepository`, `AttemptRepository`, `ConfidenceRepository`, `BehavioralRepository`, `AiMentorGateway`) and domain functions (`selectDailyChallenge`, `rankWeakAreas`, `compareConfidenceByTopic`, `buildBehavioralFeedback`).
4. The handler serializes a contracts response DTO, or an `ApiErrorResponse` on failure.

## API surface

All endpoints require an authenticated Supabase session (cookie-based via `@supabase/ssr`); unauthenticated requests get `401` with `ApiErrorResponse` code `unauthorized`. All bodies are JSON. Every DTO lives in `src/core/contracts`.

| Method | Path                     | Request DTO                     | Success response DTO              | Status |
| ------ | ------------------------ | ------------------------------- | --------------------------------- | ------ |
| GET    | `/api/challenges/daily`  | —                               | `DailyChallengeResponse`          | 200    |
| POST   | `/api/attempts`          | `CreateAttemptRequest`          | `CreateAttemptResponse`           | 201    |
| POST   | `/api/hints`             | `HintRequest`                   | `HintResponse`                    | 200    |
| GET    | `/api/confidence`        | —                               | `ConfidenceRatingsResponse`       | 200    |
| POST   | `/api/confidence`        | `CreateConfidenceRatingRequest` | `CreateConfidenceRatingResponse`  | 201    |
| GET    | `/api/progress`          | —                               | `ProgressSummaryResponse`         | 200    |
| GET    | `/api/behavioral/question` | —                             | `BehavioralQuestionResponse`      | 200    |
| POST   | `/api/behavioral/feedback` | `BehavioralFeedbackRequest`   | `BehavioralFeedbackResponse`      | 200    |

Error responses always use `ApiErrorResponse` with codes: `unauthorized` (401), `not_found` (404), `invalid_request` (400), `ai_unavailable` (502), `internal_error` (500).

Endpoint semantics:

- **GET /api/challenges/daily** — compute `dayKey` with `toDayKey(new Date())` (UTC calendar day), load the bank via `ChallengeRepository.listAll()`, pick with `selectDailyChallenge(bank, dayKey)`. Same day always yields the same challenge. The response includes `dayKey` so the client caches per server day, not per client-local day.
- **POST /api/attempts** — validate `outcome` (`isAttemptOutcome`), `hintsUsed` (integer 0–3), `timeSpentSeconds` (integer ≥ 0); resolve the challenge by `challengeId` (404 if missing); copy its `topic` and `difficulty` onto the attempt server-side; persist with the session user id. Clients never send `userId`, `topic`, or `difficulty`.
- **POST /api/hints** — validate `level` with `isHintLevel`; resolve the challenge; call `AiMentorGateway.generateHint({ challenge, userCode, level })`. Levels escalate: 1 subtle nudge, 2 algorithm/approach hint, 3 key insight. The gateway prompt must forbid returning full solutions or complete code. OpenRouter failures map to `ai_unavailable`.
- **GET /api/confidence** — all confidence ratings for the session user (append-only history).
- **POST /api/confidence** — validate with `isTopic` and `isConfidenceLevel`; insert a new rating row (never update; history is the data).
- **GET /api/progress** — `weakAreas: rankWeakAreas(attempts)` and `confidence: compareConfidenceByTopic(ratings)` for the session user.
- **GET /api/behavioral/question** — a random question from `BehavioralRepository.listQuestions()`.
- **POST /api/behavioral/feedback** — resolve the question by `questionId` (404 if missing); reject empty `answer` (400); call `AiMentorGateway.evaluateBehavioralAnswer(question, answer)`; validate the model's scores with `isStarScores`; return `buildBehavioralFeedback(evaluation)`.

Auth itself (sign-up, sign-in, sign-out) is client-side Supabase (`@supabase/supabase-js` browser client created in frontend code); there are no `/api/auth` routes.

## Domain model (frozen)

- `Topic` — 12 curated topics in `TOPICS` (arrays … dynamic-programming). Radar/weak-area ordering follows `TOPICS` order.
- `Difficulty` — `easy | medium | hard`; `TIMER_DURATION_SECONDS` maps to 1200/2100/3000 seconds.
- `AttemptOutcome` — `solved | solved_with_hints | gave_up`.
- `HintLevel` — `1 | 2 | 3`. `ConfidenceLevel` — `1..5`.
- Weakness math — per attempt: solved 0, solved_with_hints 20 × hintsUsed, gave_up 100; `weaknessScore` is the rounded average (0–100); `rankWeakAreas` groups by topic, sorts weakest first.
- STAR — `STAR_CRITERIA` (situation, task, action, result), integer scores 1–5, `overallScore` = mean rounded to one decimal.
- Timestamps cross layers as ISO-8601 UTC strings.

## Database schema (Supabase Postgres)

Backend engineer writes the SQL under `supabase/` (migrations + seed for the challenge and question banks).

### challenges

| column       | type        | constraints                                          |
| ------------ | ----------- | ---------------------------------------------------- |
| id           | uuid        | pk, default `gen_random_uuid()`                      |
| title        | text        | not null                                             |
| prompt       | text        | not null (markdown, includes examples)               |
| topic        | text        | not null, check: value in `TOPICS`                   |
| difficulty   | text        | not null, check: `easy`/`medium`/`hard`              |
| starter_code | text        | not null                                             |
| created_at   | timestamptz | not null, default `now()`                            |

### behavioral_questions

| column   | type | constraints                                                        |
| -------- | ---- | ------------------------------------------------------------------ |
| id       | uuid | pk, default `gen_random_uuid()`                                    |
| category | text | not null, check: `teamwork`/`leadership`/`conflict`/`failure`/`growth` |
| question | text | not null                                                            |

### attempts

| column             | type        | constraints                                            |
| ------------------ | ----------- | ------------------------------------------------------ |
| id                 | uuid        | pk, default `gen_random_uuid()`                        |
| user_id            | uuid        | not null, fk `auth.users(id)` on delete cascade        |
| challenge_id       | uuid        | not null, fk `challenges(id)`                          |
| topic              | text        | not null, check: value in `TOPICS` (denormalized from the challenge) |
| difficulty         | text        | not null, check (denormalized from the challenge)      |
| outcome            | text        | not null, check: `solved`/`solved_with_hints`/`gave_up` |
| hints_used         | int         | not null, check `0 <= hints_used <= 3`                 |
| time_spent_seconds | int         | not null, check `>= 0`                                 |
| attempted_at       | timestamptz | not null, default `now()`                              |

Index: `(user_id)`.

### confidence_ratings

| column   | type        | constraints                                     |
| -------- | ----------- | ----------------------------------------------- |
| id       | uuid        | pk, default `gen_random_uuid()`                 |
| user_id  | uuid        | not null, fk `auth.users(id)` on delete cascade |
| topic    | text        | not null, check: value in `TOPICS`              |
| level    | int         | not null, check `1 <= level <= 5`               |
| rated_at | timestamptz | not null, default `now()`                       |

Index: `(user_id, topic, rated_at)`. Append-only: no updates or deletes from the app.

### RLS expectations

RLS enabled on all four tables.

- `challenges`, `behavioral_questions`: SELECT for `authenticated`; no INSERT/UPDATE/DELETE policies (content is seeded via migrations).
- `attempts`, `confidence_ratings`: SELECT and INSERT for `authenticated` where `user_id = auth.uid()` (both `using` and `with check`); no UPDATE/DELETE policies.

Because every query runs as the signed-in user through the anon key + session cookie, **no service-role key is required** and none appears in `.env.example`. Behavioral answers and hint texts are not persisted.

## Environment variables

Read env **only inside request handlers or factory functions** — never at module top level. `npm run build` must succeed with zero env vars set.

| Variable                        | Used by                                        |
| ------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | browser + server Supabase clients              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server Supabase clients              |
| `OPENROUTER_API_KEY`            | OpenRouter adapter (server only)               |
| `OPENROUTER_MODEL`              | OpenRouter adapter; falls back to `openai/gpt-4o` if unset |

## i18n

- next-intl with a `[locale]` segment; locales `en` (default) and `pt-BR`, defined in `src/i18n/routing.ts`.
- `src/proxy.ts` (Next 16 proxy, the middleware successor) runs next-intl's locale negotiation; `/` redirects to `/en` or `/pt-BR`.
- `src/i18n/request.ts` resolves messages per request; `src/i18n/navigation.ts` exports the locale-aware `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` — always use these instead of `next/link`/`next/navigation` for in-app navigation.
- Messages live in `messages/en.json` and `messages/pt-BR.json` with namespaces: `common`, `nav`, `challenge`, `behavioral`, `progress`, `auth`. Every key must exist in both files.
- API routes are outside `[locale]` and locale-agnostic.

## State management

- **zustand** (`src/stores`) for ephemeral client session state only: the interview timer (seed durations from `TIMER_DURATION_SECONDS`), Monaco editor buffer, and hint-usage state for the current challenge.
- **Server data** (challenge, attempts, progress, ratings, questions) flows through typed fetch hooks in `src/hooks` against `/api/*`; no server data in zustand.
- Pages depending on session/data render dynamically or fetch client-side; nothing may break the env-free build.

## Testing

- Vitest + jsdom + Testing Library; setup in `vitest.setup.ts` loads jest-dom matchers. Tests are colocated as `*.test.ts(x)` under `src/`.
- Domain logic is unit-tested (`src/core/domain/*.test.ts`); ports and contracts have smoke tests proving they compile and compose with the domain.
- Backend: test use cases against in-memory port fakes (see `src/core/application/ports/ports.test.ts` for the pattern); adapters stay thin.
- Frontend: test components with Testing Library, mocking fetch at the hook boundary using contracts DTOs.
- `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` must all stay green on every change.

## File ownership (parallel phase)

| Area                                              | Owner    |
| ------------------------------------------------- | -------- |
| `src/infrastructure/**`                            | backend  |
| `src/app/api/**`                                   | backend  |
| `src/core/application/**` (use cases; not `ports/`) | backend  |
| `supabase/**` (migrations, seeds)                   | backend  |
| `src/app/[locale]/**`                               | frontend |
| `src/components/**`, `src/hooks/**`, `src/stores/**` | frontend |
| `messages/**`, `src/app/globals.css`                | frontend |
| `src/core/domain/**`                                | FROZEN   |
| `src/core/application/ports/**`                     | FROZEN   |
| `src/core/contracts/**`                             | FROZEN   |
| `src/i18n/**`, `src/proxy.ts`                       | FROZEN   |
| Root configs (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `postcss.config.mjs`), `package.json`, lockfile | FROZEN   |

FROZEN means: compile against it, never edit it. Dependency changes are frozen for the parallel phase. If a frozen file blocks you, raise it with the architect instead of editing.
