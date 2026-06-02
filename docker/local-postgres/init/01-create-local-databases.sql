-- Local development only.
-- This init script is used by docker-compose.local.yml on first container startup.
-- It creates separate local databases for the app and Prisma shadow migration work.

CREATE DATABASE boilabin_local;
CREATE DATABASE boilabin_shadow;
