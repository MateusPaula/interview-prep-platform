# Interview Prep Platform

Daily coding challenges with escalating AI hints, an interview timer, weak-area tracking, behavioral practice with STAR feedback, and a confidence tracker. Built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, OpenAI, and next-intl (en, pt-BR).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

| Script               | Purpose                        |
| -------------------- | ------------------------------ |
| `npm run dev`        | start the dev server           |
| `npm run build`      | production build               |
| `npm run start`      | serve the production build     |
| `npm run lint`       | ESLint                         |
| `npm run typecheck`  | TypeScript, no emit            |
| `npm run test`       | Vitest, single run             |
| `npm run test:watch` | Vitest in watch mode           |

## Documentation

Architecture, API surface, database schema, and the file ownership map live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
