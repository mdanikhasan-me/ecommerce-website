# Step 386 - Google Login Live Verification

## Result

Google login is working locally on `localhost:3000` after a local-only environment cleanup.

The app now exposes both auth providers:

- `google`
- `credentials`

The active local Google callback URI is:

```text
http://localhost:3000/api/auth/callback/google
```

No `invalid_client` or `redirect_uri_mismatch` error was observed in the successful local callback flow.

## What Was Fixed Locally

`.env` and `.env.local` are both untracked private files. No secrets were printed, copied into this report, or committed.

The local blocker was `.env.local` overriding real-looking `.env` Google/Auth values with placeholder-like values. I changed `.env.local` locally only:

- removed local placeholder-like `GOOGLE_CLIENT_ID`
- removed local placeholder-like `GOOGLE_CLIENT_SECRET`
- removed local placeholder-like `AUTH_SECRET`
- removed local placeholder-like `NEXTAUTH_SECRET`
- set local app/auth origins to `http://localhost:3000`
- set local CSRF allowed origins for `http://localhost:3000` plus the existing local test origin

This leaves `.env` as the source for the real-looking Google credentials and auth secret, while `.env.local` only pins the active local origin.

## Verification

Evidence captured:

- Provider endpoint exposes Google: `audit-reports/386-google-login-live-verification/screenshots/provider-google-present-3000.png`
- Login page shows enabled Google button: `audit-reports/386-google-login-live-verification/screenshots/login-google-enabled-3000.png`
- Browser click attempt screenshot: `audit-reports/386-google-login-live-verification/screenshots/google-oauth-after-click-3000.png`

Server-side live verification showed:

- `/api/auth/providers` returned `google, credentials`
- the browser auth flow used `POST /api/auth/signin/google`
- the Google callback route completed with `/api/auth/callback/google`
- the app continued to authenticated account/home routes after callback

I did not record account email, profile details, OAuth codes, tokens, cookies, or provider secrets.

## Direct Endpoint Note

A direct manual GET to `/api/auth/signin/google?...` returns an Auth.js unsupported-action/configuration path. That is not the app's Google button behavior. The app's client flow uses the NextAuth `signIn('google')` POST flow, which is the flow that completed.

## Validation

- Provider check: passed, `google, credentials`
- Browser screenshot proof: captured
- `npm test -- tests/google-oauth-config.test.ts`: passed
  - The package test script expanded to the full current test suite.
  - Result: 727 passed, 0 failed

No source code was changed for this step, so typecheck, lint, and build were not rerun.

## Protected Files

Left untouched and unstaged:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

No Step 382 media storage logic was changed.
