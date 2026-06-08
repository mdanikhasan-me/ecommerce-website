# Step 385 - Google OAuth Invalid Client Audit

## Root Cause

The app always registered the Google NextAuth provider with:

`process.env.GOOGLE_CLIENT_ID!` and `process.env.GOOGLE_CLIENT_SECRET!`

The local override environment has placeholder-like Google OAuth values. Because `.env.local` overrides `.env`, the app could send a fake/placeholder client ID to Google. Google then rejected the request with `401 invalid_client` and "The OAuth client was not found."

The public example files also encouraged copying `local-google-client-id` and `local-google-client-secret`, which made the bad local state easy to reproduce.

## Auth Files Inspected

- `src/backend/auth/index.ts`
- `src/backend/auth/config.ts`
- `src/backend/auth/host.ts`
- `src/backend/auth/redirect.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(store)/auth/login/page.tsx`
- `src/app/(store)/auth/register/page.tsx`
- `src/frontend/components/auth/LoginForm.tsx`
- `src/frontend/components/auth/RegisterForm.tsx`
- `src/frontend/components/layout/Header.tsx`
- `src/backend/types/auth.ts`
- `.env.example`
- `.env.local.example`
- `README.md`

## Required Environment Variables

Required to enable Google OAuth:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Required for the callback origin/session runtime:

- `AUTH_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `AUTH_TRUST_HOST` for trusted local/proxy behavior where needed

## Local Env Status

No secret values were printed or copied. Only statuses were inspected.

| File | Key | Status |
| --- | --- | --- |
| `.env.local` | `GOOGLE_CLIENT_ID` | placeholder-like |
| `.env.local` | `GOOGLE_CLIENT_SECRET` | placeholder-like |
| `.env.local` | `AUTH_URL` | present |
| `.env.local` | `NEXTAUTH_URL` | present |
| `.env.local` | `AUTH_SECRET` | placeholder-like |
| `.env.local` | `NEXTAUTH_SECRET` | placeholder-like |
| `.env` | `GOOGLE_CLIENT_ID` | present, non-placeholder-looking |
| `.env` | `GOOGLE_CLIENT_SECRET` | present, non-placeholder-looking |

Effective local outcome: `.env.local` wins, so Google OAuth is treated as not configured.

## Expected Redirect URI

Configured local auth origin currently points to:

`http://localhost:3000/api/auth/callback/google`

If the dev server is intentionally running on port `3001`, set `AUTH_URL` and `NEXTAUTH_URL` to `http://localhost:3001` and add:

`http://localhost:3001/api/auth/callback/google`

to the Google Cloud Console authorized redirect URIs.

## What Changed

- Added a safe Google OAuth credential classifier in `src/backend/auth/google-oauth.ts`.
- Google provider is now registered only when:
  - `GOOGLE_CLIENT_ID` is present,
  - it is not placeholder-like,
  - it matches the Google web client ID shape ending in `.apps.googleusercontent.com`,
  - `GOOGLE_CLIENT_SECRET` is present and not placeholder-like.
- Login and register pages now pass a server-derived `googleOAuthAvailable` boolean to client UI.
- Google sign-in UI now disables itself with a small setup message when OAuth is unavailable.
- Example env files now leave Google OAuth values blank instead of using fake local IDs.
- README now documents Google Cloud Console setup, required env names, callback URI, and dev-server restart.
- Focused tests now cover provider gating, placeholder rejection, docs, UI wiring, and header avatar fallback source behavior.

## Header Avatar Result

No broad header rewrite was needed. Existing header logic already matches the requested behavior:

- Not logged in: default profile icon.
- Logged in without image: default profile icon.
- Logged in with `session.user.image`: image is rendered.
- Image load failure: `onError` flips back to the default profile icon.

The new focused test pins this behavior through the `HeaderAvatar` source path.

## Local Verification

With the current placeholder-like `.env.local` Google values:

- `/api/auth/providers` returned only `credentials`.
- Google provider was not registered.
- Login page showed the disabled safe state: `Google sign-in unavailable`.
- No request was sent to `accounts.google.com`.
- No `invalid_client` page was reached.

Real Google sign-in was not completed because valid Google Cloud OAuth credentials are not present in the active local override.

## Screenshots

Folder:

`audit-reports/385-google-oauth-invalid-client/screenshots/`

Files:

- `login-google-disabled-1440x900.png`
- `login-google-disabled-390x844.png`

## Manual Google Cloud Setup Remaining

1. Open Google Cloud Console.
2. Create or select a project.
3. Configure the OAuth consent screen.
4. Create OAuth client credentials.
5. Choose application type: `Web application`.
6. Add the local authorized redirect URI that matches `AUTH_URL` / `NEXTAUTH_URL`.
7. Put the real values in `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
8. Restart the dev server after editing `.env.local`.

Do not paste OAuth secrets into chat or committed files.

## Files Changed

- `.env.example`
- `.env.local.example`
- `README.md`
- `src/backend/auth/google-oauth.ts`
- `src/backend/auth/index.ts`
- `src/app/(store)/auth/login/page.tsx`
- `src/app/(store)/auth/register/page.tsx`
- `src/frontend/components/auth/GoogleSignInButton.tsx`
- `src/frontend/components/auth/LoginForm.tsx`
- `src/frontend/components/auth/RegisterForm.tsx`
- `tests/google-oauth-config.test.ts`
- `audit-reports/385-google-oauth-invalid-client.md`
- `audit-reports/385-google-oauth-invalid-client/screenshots/*.png`

## Validation Results

- `npx tsx --test tests/google-oauth-config.test.ts` - passed, 5 tests
- `npm run typecheck` - passed
- `npm run lint` - passed
- `npm run build` - passed
- `npm test` - passed, 727 tests

## Guardrail Confirmation

- No OAuth secrets, tokens, cookies, DB URLs, or session secrets were printed or committed.
- `.env.local` was inspected only for key status and was not staged.
- No database schema or migration was changed.
- No auth schema migration was required.
- Category media/source-of-truth logic was not touched.
- Checkout/payment gateway logic was not touched.
- `public/assets/icons/ui/categories/*.svg` was not staged or touched by this step.
- `public/uploads/admin/banners/hero/` was not staged or touched by this step.

## Commit And Push

- Commit message: `fix: harden google oauth setup and avatar fallback`
- Commit hash: `86a49dd`
- Push result: pushed to `origin/main`
