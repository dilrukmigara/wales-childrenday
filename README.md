# Wales Children’s Day

Next.js / React website hosted on Vercel with a Supabase PostgreSQL database. Students enter their name and contact number, choose a teacher and download one of three personalized card designs. `/admin` manages classes and shows every student entry, including unfinished visits, through pagination.

## Supabase setup

1. Create a project at https://supabase.com/dashboard (or use your existing project).
2. Open **SQL Editor → New query**. Paste the entire contents of [`supabase/setup.sql`](supabase/setup.sql) and click **Run**. This creates the four `wales_` tables, protected database functions and example Science teacher. It can safely be rerun for this schema version.
3. Copy your **Project URL** from the project's Connect dialog or API settings.
4. In **Settings → API Keys**, create/copy a **secret** key (`sb_secret_...`). A legacy `service_role` key is also supported. Do not use a publishable/anon key.
5. Keep the Data API enabled and the `public` schema exposed (the usual defaults). Row Level Security is enabled; `anon` and `authenticated` have no access to the Wales tables or functions. The privileged key is used only by Next.js server routes.

## Vercel setup

Import `dilrukmigara/wales-childrenday`, branch `main`:

| Setting | Value |
| --- | --- |
| Application / Framework preset | Next.js |
| Root directory | Repository root (`./`) |
| Build command | `npm run build` |
| Output directory | `.next` |
| Install command | `npm ci` |
| Node.js | 24.x |

Add these **Production** environment variables in Vercel:

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | Your chosen Wales admin password |
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_SECRET_KEY` | Your Supabase server secret key |

For a legacy key, either use `SUPABASE_SECRET_KEY` or the supported `SUPABASE_SERVICE_ROLE_KEY` variable. Never add `NEXT_PUBLIC_` to a secret variable. Remove the old `CLOUDFLARE_*` variables from this Vercel project; they are no longer used. Deploy the latest `main` commit, or redeploy that version after saving environment variables.

Verify that the teacher list loads, a student's details appear in `/admin` before card completion, and the record becomes completed after generating a card. The build does not need database credentials, but these runtime operations do.

This setup creates a fresh database. Existing Cloudflare/Sites records are not automatically transferred. Keep the old database if you need those records. The old `drizzle/` SQL files describe SQLite and **must not be run in Supabase**. Use only `supabase/setup.sql` for this setup. There is no application-level 500-student cap; database plan limits still apply.

## Local development

Use Node.js 24. Run `npm ci`, copy `.env.example` to `.env.local`, and fill in your Supabase values and admin password. Run `npm run dev`. Local development uses the configured remote database; a separate development Supabase project is recommended.

- `npm run build` — Next.js production build
- `npm start` — production server
- `npm run typecheck` — TypeScript validation
- `npm run test:database` — server REST adapter tests
- `tests/supabase.sql` — database integration assertions; run after setup.sql in a disposable PostgreSQL/Supabase database containing the standard anon, authenticated and service_role roles. This test rolls back its fixture data.

## Troubleshooting

If a save returns 503, open Vercel runtime Logs and find `Wales request failed`. Errors report HTTP status and a Supabase error code without logging student data or keys. Check the three environment variables, that the SQL setup completed, and that the Supabase project is running. Missing tables/functions require running the setup SQL; incorrect credentials require updating the key and redeploying. Do not expose your server key in screenshots or client code.

Official references: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
