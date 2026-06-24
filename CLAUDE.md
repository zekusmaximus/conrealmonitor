# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What this project is

**conrealmonitor** ("Consensus Reality Monitor", CRM-1970) is a [Devvit](https://developers.reddit.com/)
**web app** that runs inside Reddit. Users join/create a "group", log short text descriptions of
their "reality", and the app computes a **fragmentation index** — a measure of how divergent the
logged strings are — then visualizes consensus vs. fragmented "branches" over time and reflects the
index back into the subreddit via user flair and auto-generated report posts.

It is built on the **Devvit React Starter** template. The novelty over the starter lives in:
- `src/server/calc.ts` — the fragmentation algorithm
- `src/server/routes.ts` — the group/log/flair/report API
- `src/client/components/*` — the multi-page React UI (Welcome → Logger → Dashboard → Visualization)

## Tech stack

- **Devvit** (`@devvit/web`, `@devvit/server`, `devvit` CLI) — Reddit's developer platform / runtime
- **React 19** + **react-router-dom 7** — client UI, rendered inside a Devvit WebView
- **Express 5** — server-side API (serverless, runs in Devvit's Node runtime)
- **D3 7** — the fragmentation/branch visualization
- **Vite 6** — bundles both client and server
- **Tailwind CSS 4** (via `@tailwindcss/vite`) — styling
- **TypeScript 5.8** (strict, project references) — everywhere
- **Vitest 3** — tests
- **Redis** (via `@devvit/web/server`) — the only persistence layer
- **dayjs**, **string-similarity-js**, **express-rate-limit**, **react-hot-toast**, **clsx**, **tailwind-merge**

Requires **Node 22**.

## Repository layout

```
src/
├── client/                 # React webview (full-screen iframe inside Reddit)
│   ├── components/
│   │   ├── App.tsx         # Router: /, /logger, /dashboard, /visualization
│   │   ├── Welcome.tsx     # Create or join a group (UUID); persists groupId to localStorage
│   │   ├── Logger.tsx      # Submit a "reality" string -> POST /internal/logs
│   │   ├── Dashboard.tsx   # Shows fragmentation, share group, view reports
│   │   └── Visualization.tsx # D3 consensus line + fragment branches w/ tooltips
│   ├── hooks/useCounter.ts # Starter leftover; talks to /api/increment|decrement|init
│   ├── main.tsx            # Entry: BrowserRouter, PWA install handling, global error guards
│   ├── index.html, index.css, styles/global.css
│   ├── public/             # manifest.json (PWA), snoo.png
│   └── vite.config.ts      # builds to dist/client
├── server/                 # Express backend (Devvit serverless Node runtime)
│   ├── index.ts            # **Actual built entry** (see "Two server entry points" below)
│   ├── routes.ts           # The real API surface (groups, logs, group-data, flair, reports)
│   ├── server.ts           # Express app w/ CORS + router (used by bootstrap.ts)
│   ├── bootstrap.ts        # Alternate entry that wires server.ts
│   ├── calc.ts             # calculateFragmentation() — core algorithm
│   ├── core/post.ts        # createPost() helper
│   ├── services/
│   │   ├── redis.ts        # All Redis access (keys, logs, groups, dates)
│   │   └── reddit.ts       # Reddit API wrappers (flair, posts, moderators, username)
│   ├── __tests__/fragmentation.test.ts
│   └── vite.config.ts      # builds to dist/server, entry = index.ts, CJS, ssr
└── shared/
    └── types/api.ts        # Shared request/response types
tools/tsconfig-base.json    # Strict TS defaults inherited by each sub-project
devvit.json                 # Devvit app manifest (name, version, server entry)
```

## Architecture & data model

The three sub-projects (`client`, `server`, `shared`) are separate TypeScript projects referenced
from the root `tsconfig.json`. The client calls the server with plain `fetch()` to relative paths;
there is no separate API host.

**Redis key scheme** (all access goes through `src/server/services/redis.ts` — do not call `redis`
directly elsewhere):
- `count` — the starter's increment counter
- `group:{groupId}` — marker that a group exists (set in `index.ts`)
- `groups` — Redis **set** of all groupIds (used by daily-report scan)
- `dates:{groupId}` — Redis **set** of date strings (`YYYY-MM-DD`) that have logs
- `logs:{groupId}:{date}` — JSON-stringified `string[]` of logged realities for that day
- `log:{logId}` — standalone log (when no groupId is supplied)

Note: `redis.sadd/smembers/sismember/sscan` are not typed by `@devvit/web/server`, so `redis.ts`
uses `// @ts-expect-error` on those calls. Keep that pattern if you add set operations.

**The fragmentation algorithm** (`calc.ts`): filters out empty/non-string values, then for **every
pair** of valid strings computes similarity via `string-similarity-js`, averages it, and returns
`1 - avgSimilarity`. Range `[0, 1]`; returns `0` if fewer than 2 valid strings. It is O(n²) in the
number of strings — fine for small groups, watch it if log volumes grow. Color bands used for flair:
`< 0.3` green, `0.3–0.7` yellow, `> 0.7` red.

**Client flow:** `Welcome` creates a group (`POST /internal/groups`) or joins one by UUID, storing
`groupId` in `localStorage`. `Logger` submits a string (`POST /internal/logs` with `{ data, groupId }`),
which on the server appends to today's log list and **auto-triggers a flair update**. `Dashboard` and
`Visualization` read `GET /internal/group-data/:groupId`.

## Server API surface (`src/server/routes.ts`)

All `/internal/*` routes are gated by `authMiddleware` (requires `x-devvit-token` header, a logged-in
Reddit user, **and moderator status** of the subreddit) plus a rate limiter (100 req / 15 min / IP).
`/api/*` routes are not gated.

- `GET  /api/init` — counter + username (starter)
- `POST /api/increment`, `POST /api/decrement` — counter (starter)
- `POST /internal/on-app-install` — create the app's post
- `POST /internal/menu/post-create` — create a post from a subreddit menu action
- `POST /internal/groups` — create a group from a `strings` array → `{ uuid }`
- `POST /internal/logs` — append a `data` string to a group's day list; auto-syncs flair
- `GET  /internal/group-data/:groupId` — fragmentation + consensus text + fragments
- `POST /internal/set-flair/:groupId` — recompute and set the current user's flair
- `POST /internal/share-group/:groupId` — submit a Reddit post inviting others to the group
- `POST /internal/daily-report` — scan all groups for today, post a summary
- `GET  /internal/reports` — list hot posts from the subreddit

The hardcoded fallback subreddit name throughout is `conrealmonitor_dev`.

## ⚠️ Known inconsistencies / gotchas (read before editing the server)

These are real discrepancies in the current code — be deliberate when touching them:

1. **Two server entry points.** `vite.config.ts` builds `src/server/index.ts`, and `devvit.json`
   points at `dist/server/index.cjs`. But `index.ts` defines its **own** small Express app with only
   `/internal/groups`, `/internal/logs`, `/internal/ping` (no auth) — it does **not** import
   `server.ts`/`routes.ts`. The richer API the client actually calls (`/internal/group-data`,
   `/internal/share-group`, `/internal/reports`, flair, etc.) lives in `routes.ts`, which is wired up
   by `server.ts` + `bootstrap.ts` — neither of which is the build entry. So `routes.ts` is currently
   **not deployed**. If you add or change server endpoints, decide which entry is authoritative and
   make them consistent (likely: switch the Vite entry to `bootstrap.ts`, or import `routes` into
   `index.ts`). Don't assume an endpoint is live just because it's in `routes.ts`.
2. **`index.ts` uses `@devvit/public-api`** (`Devvit.configure`, `Devvit.addCustomPostType`,
   `Devvit.Blocks.WebView`) while the rest of the server uses `@devvit/web/server`. The two APIs are
   different generations of Devvit; keep them straight.
3. **No triggers/menu items declared in `devvit.json`.** The `on-app-install` and `menu/post-create`
   routes won't fire unless the corresponding Devvit config is added.
4. **`authMiddleware` requires moderator status** for every `/internal` route, but the client UI (logging
   a reality, joining a group) is meant for regular users. The auth check would block them — another
   reason `routes.ts` may not be the live path. Also, the TODO to verify the token signature is unimplemented.
5. The codebase is heavily commented with emoji/console logging and "quantum/multiverse" flavor text.
   That's intentional house style, not noise.

## Commands

```bash
npm run dev          # Live dev on Reddit: client+server watch builds + devvit playtest (concurrently)
npm run dev:vite     # Client-only Vite dev server on :7474 (UI iteration without Devvit)
npm run build        # build:client then build:server -> dist/
npm run test         # vitest run (currently: fragmentation.test.ts)
npm run check        # type-check + lint:fix + prettier  <-- run this before committing
npm run type-check   # tsc --build (all project references)
npm run lint         # eslint ./src   (lint:fix to autofix)
npm run prettier     # prettier-package-json + prettier --write .
npm run login        # devvit login
npm run deploy       # build + devvit upload
npm run launch       # build + deploy + devvit publish (submits for review)
```

There is no `dev`-without-Devvit story for the server; server logic runs in Devvit's runtime via
`playtest`. For pure UI work use `npm run dev:vite`.

## Conventions

From `.cursor/rules/` and the existing code — follow these:

- **Where code goes:** client UI in `src/client`, serverless backend in `src/server`, shared types in
  `src/shared`. The client reaches the server only via `fetch('/internal/...')` or `fetch('/api/...')`.
- **Server runtime limits (serverless, Lambda-like):** no `fs`/`http`/`https`/`net`, **read-only
  filesystem**, **no websockets**, **no HTTP streaming**, no SQLite or stateful in-memory processes.
  Use `fetch` instead of `http`/`https`. For realtime, use Devvit's realtime service (search Devvit
  docs), not sockets. Redis is the persistence layer.
- **Client limits:** only web-compatible npm deps; no websockets; obey the rules of hooks.
- **TypeScript:** strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`/`Parameters` all on (see `tools/tsconfig-base.json`). Expect to handle
  `undefined` from indexed access and use non-null assertions deliberately (the code does, e.g.
  `validStrings[i]!`). The Cursor rules say "prefer type aliases over interfaces," though the existing
  shared types use `interface` — match the file you're editing.
- **Formatting (Prettier):** single quotes, ES5 trailing commas, 2-space indent, max line 100,
  `quoteProps: preserve`. Tailwind class sorting plugin is enabled. Don't hand-format; run prettier.
- **ESLint:** `no-floating-promises` is an **error** — `await` or explicitly `void` every promise
  (the code uses `void navigate(...)`). Unused-vars rules are off. React hooks rules are enforced.
- **Assume the toolchain works.** Per the Cursor rules: if something breaks, suspect your code before
  the Vite/TS/ESLint/Tailwind config.

## Testing

- Tests run under Vitest. Server tests use Node globals (`describe`/`it`/`expect` are declared in
  `eslint.config.mjs` and the server tsconfig includes `vitest/globals`). Client Vitest config uses
  the `jsdom` environment (`src/client/vitest.config.ts`).
- Current coverage is just `src/server/__tests__/fragmentation.test.ts`. When you change `calc.ts` or
  add server logic, add tests there and keep `npm run test` green.

## Workflow for changes

1. Make changes in the appropriate sub-project.
2. Run `npm run check` (type-check + lint:fix + prettier) and `npm run test`.
3. Commit with a clear message and push to the working branch (do not push to `main`).
4. Do **not** open a pull request unless explicitly asked.

When adding a server endpoint, remember the "Two server entry points" gotcha above and make sure the
endpoint is actually reachable from the deployed entry, with auth that matches who should call it.
