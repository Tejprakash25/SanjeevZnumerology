# ANKA Numerology Workspace

Private single-operator numerology application for Vercel. The browser is a presentation layer only. All calculations and recommendation decisions are server-side JavaScript Serverless Functions.

## Architecture

- Static frontend: `index.html`, `styles.css`, `app.js`
- Serverless API: `api/`
- Protected calculation modules: `server/features/primary.js`, `server/features/vedic.js`, `server/features/mobile.js`
- Authentication: signed, HttpOnly, Secure, SameSite session cookie in `server/lib/auth.js`
- Tests: `tests/features.test.js`
- Workbook traceability: `TRACEABILITY.md`

The sidebar always presents the three pages in the required order. The primary page is the default after authentication. No client records are persisted.

## Environment variables

Copy `.env.example` to `.env` for local work and set strong values:

```text
AUTH_USERNAME=operator
AUTH_PASSWORD=<long-random-password>
SESSION_SECRET=<at-least-32-random-characters>
SESSION_MAX_AGE_SECONDS=3600
```

Never commit `.env`. The six Excel workbooks are retained locally but ignored by Git and are never served as public assets.

## Local development

For local work without a Vercel login, use the included dependency-free launcher, which invokes the same API handlers:

```bash
npm run dev
```

Open the URL printed by the server (normally `http://127.0.0.1:3000`). If that port is already in use, the launcher tries the next ten ports and prints the first available URL. You can set a starting port with `PORT=4000 npm run dev`. Do not open `index.html` directly as `file://`; that bypasses the API boundary and causes the browser CORS error you will see from `/api/auth/session`.

For Vercel parity, `vercel dev` can also be used after authenticating the Vercel CLI.

## Tests

```bash
npm test
```

Tests use synthetic inputs only. They cover workbook-bound calculation separation, date/time validation, unknown-time options, Vedic exclusions, the intentionally blocked mobile-generation gap, and signed-session behavior.

## Deployment

Create one Vercel project rooted at this directory, configure the four environment variables in the Vercel dashboard for the relevant environments, and deploy with:

```bash
vercel --prod
```

Do not deploy the reference workbooks as public assets. Review `TRACEABILITY.md` before adding any new rule.
