import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// `prisma migrate deploy` (production) does not need a shadow database, so
// `SHADOW_DATABASE_URL` is intentionally optional. Local commands such as
// `prisma migrate diff --from-migrations` do require one — set
// `SHADOW_DATABASE_URL` in `.env` when generating migrations.
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL ? env('SHADOW_DATABASE_URL') : undefined;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
