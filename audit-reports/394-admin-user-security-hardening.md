# 394 Admin User Security Hardening

## Scope

- Fix the verified admin-user security issues from Step 393:
  - admin user list/detail/update flows were loading full Prisma `User` records
  - admin authorization trusted stale JWT role state
- Preserve unrelated protected local files:
  - `public/assets/icons/ui/categories/*.svg`
  - `public/uploads/admin/banners/hero/`

## Verified Findings

- `src/app/api/admin/users/route.ts` used `db.user.findMany(... include: { _count: ... })`, which loads full user records, including sensitive columns such as `password`.
- `src/app/api/admin/users/[id]/route.ts` used `db.user.findUnique(... include: { _count: ... })` and passed the result into `UserManagementForm`, which would serialize the full user object to the client.
- `src/backend/admin/admin-utils.ts` trusted `session.user.role` from JWT without rechecking the current user row, so role demotion/deactivation could remain effective until token refresh.
- `src/backend/admin/product-editor.ts` carried a duplicate `requireAdminSession()` implementation with the same stale-token problem.

## Fix

- Added explicit safe Prisma selects in `src/backend/admin/user-editor.ts`:
  - `ADMIN_USER_LIST_SELECT`
  - `ADMIN_USER_DETAIL_SELECT`
- Updated admin user list/detail API routes and admin pages to use those selects instead of full `include`-based user loads.
- Narrowed the PATCH route's `existingUser` lookup to only the fields needed for policy checks and audit logging.
- Centralized admin authorization in `src/backend/admin/admin-utils.ts` so `requireAdminSession()` now rechecks the current DB user row and rejects inactive or non-admin users even if the JWT still says admin.
- Re-exported the shared `requireAdminSession()` from `src/backend/admin/product-editor.ts` so product admin routes use the same DB-backed authorization check.
- Updated `UserManagementForm` to consume the safe admin-user type instead of an unconstrained ad hoc prop shape.

## Validation

- `npx tsx --test tests/admin-user-validation.test.ts` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, 741 tests.
- `npm run db:url:safety` passed.
- `npm run db:prisma:local:validate` passed.
- `npm run db:prisma:local:generate` passed.
- `npm run build` failed only at prerender time because `localhost:5432` was unreachable in the local environment.

## Build Blocker

- `Test-NetConnection localhost -Port 5432` returned `TcpTestSucceeded : False`.
- The build failure was a local infrastructure blocker, not a code regression from the security patch.

## Files Changed

- `src/backend/admin/user-editor.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/(admin)/admin/users/page.tsx`
- `src/app/(admin)/admin/users/[id]/page.tsx`
- `src/frontend/components/admin/UserManagementForm.tsx`
- `tests/admin-user-validation.test.ts`

## Remaining Risk

- The broader admin/auth hardening still leaves some separately validated risks from Step 393:
  - coarse admin permissions for export/report actions
  - process-local rate limiting
  - other admin user fields may still need explicit `select` contracts in future features
