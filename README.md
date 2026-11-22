# Oreo Dashboard

The website for Oreo, a Discord bot that announces YouTube, Twitch and Kick creators. It has the landing page, the
guide, the status page and the dashboard where people manage Oreo for their servers.

Next.js 15 (App Router), React 19, Tailwind CSS 4, Fumadocs (guide), TypeScript.

## Setup

```bash
cp .env.example .env.local    # fill in the values
yarn install
yarn dev                      # http://localhost:3100
```

```bash
yarn typecheck
yarn build && yarn start
```

## Environment

| Name | What it is |
| --- | --- |
| `API_URL` | The Oreo API. Defaults to `http://localhost:5050`. Read at build time, so rebuild (or restart `yarn dev`) after changing it. |
| `PUBLIC_BASE_URL` | This site's public origin, for canonical and Open Graph URLs. Defaults to `http://localhost:3100`. |
| `NEXT_PUBLIC_PREMIUM` | `true` shows premium: the Premium page, buy and claim buttons, upsells, and the guide's Premium and Bot profile pages. Unset (or anything else) hides them. A server given premium still shows its badge, and in-server upsells also need the API's `limits.premiumOnSale`. Inlined at build time, so rebuild after changing it. |
| `NEXT_DIST_DIR` | Build folder. Defaults to `.next`. Set `.next-prod` to build while `yarn dev` runs. |

## How it talks to the API

- The browser never calls the API directly. `next.config.ts` rewrites `/api/v1/{auth,dashboard,status}` to
  `API_URL`, so the session cookie is first-party and writes carry this site's `Origin`, which the API checks.
  `middleware.ts` refuses every other `/api` path.
- The API's `DASHBOARD_URL` must be this site's origin.
- **Login:** `/api/v1/auth/login` goes through Discord and back. The Discord application needs this OAuth2 redirect:
  `<site origin>/api/v1/auth/callback` (for example `http://localhost:3100/api/v1/auth/callback`).
- `/dashboard/*` without a session cookie goes to the login, and so does any `401` from the API.

## Project layout

```
app/
├─ (site)/            landing page, legal pages, status, outbound redirects (/invite, /vote, ...)
├─ guide/             the guide (Fumadocs), written in content/guide/*.mdx
└─ dashboard/         servers, premium, and each server's overview, creators, counters, activity, profile
components/           home, dashboard, site chrome and ui pieces (hand-built, no UI kit)
lib/
├─ api/               API types, fetch client, cache hook
└─ notification/      the bot's message renderer, used by the live previews
```

`lib/api/types.ts` and `lib/notification/render.ts` are copies of the API's and the bot's. Keep them in sync.

## Deploying to Vercel

1. Import the project (root: this folder). Vercel picks up Next.js and yarn on its own.
2. Set `API_URL` (the API's HTTPS URL) and `PUBLIC_BASE_URL` (this site's origin) for Production.
3. Add the custom domain and its DNS record.
4. On the API: `DASHBOARD_URL` set to this site's origin, and `TRUST_PROXY` set so rate limits see the visitor's IP.
5. Add `<site origin>/api/v1/auth/callback` to the Discord application's OAuth2 redirects.
