# @milesverse/sdk

The first-party client for embedding MilesVerse simulations in a Miles product
(Masterclass, Miles One, the LMS) or an approved partner app. Framework-agnostic —
Angular, React, Vue, or plain `fetch`. Ships ESM + CJS + types, zero runtime deps.

## Install

Until it is published to a private registry, consume it by path from a checkout of
`milesverse-backend`:

```jsonc
// package.json
"dependencies": {
  "@milesverse/sdk": "file:../milesverse-backend/sdk"
}
```

Build the artifacts first: `pnpm --dir sdk build` (outputs `dist/`).

## Use

```ts
import { createMilesverse } from '@milesverse/sdk';

const milesverse = createMilesverse({
  baseUrl: 'https://api.milesverse.example', // MilesVerse API origin, no trailing slash
  applicationId: 'masterclass-web',          // your registered application (a public slug)
  getSubjectToken: () => auth.getAccessToken(), // YOUR platform's own token for the user
});

const subjects = await milesverse.catalog.subjects();
const page = await milesverse.catalog.simulations({ subject: 'sales' });
const detail = await milesverse.catalog.simulation(page.data[0].id);

const { launchUrl } = await milesverse.sessions.start(detail.id);
window.open(launchUrl, '_blank'); // one-time link into the MilesVerse session player

const report = await milesverse.sessions.report(sessionId); // { status, score, feedback, … }
const progress = await milesverse.progress.get();
```

## What it manages for you

- **Auth, end to end.** The first authenticated call exchanges your platform's token for
  a MilesVerse token pair (provisioning the user server-side). Access tokens refresh
  silently; a 401 triggers one recovery and one retry; a dead refresh family falls back
  to a fresh exchange. Concurrent first calls collapse into a single exchange.
- **No secrets in the browser.** `applicationId` is public. The subject token is your
  platform's own, which the browser already holds.
- **Typed envelopes.** Single resources unwrap from `{ data }`; collections keep
  `{ data, meta }`. Every failure is a typed error (below).

## Configuration

| Option | Required | Purpose |
| --- | --- | --- |
| `baseUrl` | yes | MilesVerse API origin |
| `applicationId` | yes | Your registered application's public id |
| `getSubjectToken` | yes | Returns your platform's access token (sync or async; `null` when signed out) |
| `persistRefresh` | no | Persist the refresh token in `sessionStorage` (default false — memory only) |
| `storage` | no | Custom persistence backend (SSR, tests); implies persistence |
| `fetchImpl` | no | Override `fetch` (SSR, tests) |

## Errors

```ts
import { MilesverseApiError, MilesverseAuthError, MilesverseNetworkError } from '@milesverse/sdk';
```

- `MilesverseApiError` — the API answered with its error envelope (`status`, `code`,
  `details`, `requestId`).
- `MilesverseAuthError` — no session could be established (no/invalid subject token).
- `MilesverseNetworkError` — the request never reached the API.

## Events

```ts
const off = milesverse.on('user:changed', (user) => { /* … */ });
// 'auth:refreshed' | 'user:changed' | 'auth:unauthenticated'
```

## Scripts

`pnpm build` (tsup) · `pnpm test` (vitest) · `pnpm typecheck`. See
`../docs/SDK_INTEGRATION.md` for the backend side and the full local run sequence.
