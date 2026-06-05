# Tests/CI/Validation

Mode: read-only specialist lane. No files were edited by this lane.

## Summary
- No CI workflow found; local package validation scripts are present.
- Test suite has 73 test files and roughly 490 test/it blocks; npm test is mostly no-DB/static.
- Recommended order: status, cached diff, DB safety, Prisma validate/generate, targeted tests, full tests, typecheck, lint, build, browser evidence.
- Known failure modes include Windows Prisma EPERM locks, missing local DB, port conflicts, and browser availability.

## Guardrails
- No secrets, full DB URLs, private upload filenames, customer/order PII, migrations, seed/reset, db push, SQL, deployment, provider CLI, package updates, public/uploads deletion, or broad staging were performed by this lane.
