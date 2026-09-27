# Wales Children’s Day

A React website for Wales Higher Education Center. Students enter their name and contact number, select a teacher, and download a personalized Children’s Day card.

- Details are saved before class selection, including unfinished visits.
- Three card designs for Grades 6–9, Grades 10–11 and A/L.
- `/admin` manages classes and custom teacher wishes and shows all saved entries through pagination.
- Admin password authentication uses server-side sessions and an environment secret.
- The class dropdown supports mobile screens and long teacher names.

## Stack

React 19, Next.js, Cloudflare D1 (SQLite), Drizzle migrations, Radix UI and Tailwind CSS. Vercel runs the Next.js server; Cloudflare Workers remains an optional deployment target. This is a full-stack app: **GitHub Pages/static hosting alone cannot run its admin APIs or database**.

## Run locally

Use Node.js 24 LTS and npm.

```sh
git clone https://github.com/dilrukmigara/wales-childrenday.git
cd wales-childrenday
npm ci
cp .env.example .env
```

Set all four variables from `.env.example` in your local `.env` file. Never commit this file. The Next.js app connects to your remote D1 database, so use a separate development database if needed.

```sh
npm run dev
```

Open the local URL printed by the development server. The example teacher is created when the class list is first loaded. Sign in at `/admin` to add the real teachers.

## Deploy to Vercel

The default build is now `next build --webpack`, producing `.next/routes-manifest.json`. The old Vinext build produced a Cloudflare Worker instead, which caused Vercel's missing-manifest error. Do not set the Vercel output directory to `dist`.

1. Create a Cloudflare D1 database (Storage & databases → D1 → Create database). Copy its database ID and your Cloudflare account ID.
2. In the D1 SQL console, run `drizzle/0000_jazzy_the_leader.sql`, then `drizzle/0001_jittery_husk.sql`, **once on a fresh database**, in that order. If you already have a migrated database, reuse it; do not recreate the tables. For tracked migrations using Wrangler, follow the Cloudflare setup steps below through `npm run db:remote`.
3. Create a Cloudflare API token scoped to your account with D1 read/write access (the dashboard may label this D1 Edit).
4. In Vercel → Project → Settings → Environment Variables, add:

   | Variable | Value |
   | --- | --- |
   | `ADMIN_PASSWORD` | Your chosen admin password |
   | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
   | `CLOUDFLARE_D1_DATABASE_ID` | Your D1 database ID |
   | `CLOUDFLARE_API_TOKEN` | The account-scoped D1 token |

   Enable them for Production, and for Preview/Development only if those environments should use this database. Keep them server-only; never prefix them with `NEXT_PUBLIC_`.
5. Import this GitHub repository into Vercel. Select **Next.js**, root directory **repository root**, Node.js **24.x**, build command **`npm run build`**, output **`.next`** (the repository's `vercel.json` sets these build values).
6. Redeploy the latest `main` commit after adding the variables. Test class loading, a student submission, and `/admin` sign-in.

The build does not require database credentials. The live class list, submission saving and admin APIs **do require the four variables and migrated D1 database**. This does not automatically transfer the original hosted site's teachers or student records. There is no application-level 500-entry cap; hosting/database plan limits still apply.

## Host on your own Cloudflare account

This repository contains code and schema only. It does **not** copy the existing hosted site's student records, teachers or admin password. Your Cloudflare D1 database will start fresh.

1. Sign in to Cloudflare and create a D1 database:

   ```sh
   npx wrangler login
   npx wrangler d1 create wales-childrenday
   ```

2. Copy the returned `database_id`, then set it in your shell (macOS/Linux):

   ```sh
   export CLOUDFLARE_D1_DATABASE_ID="your-database-id"
   npm run build:cloudflare
   ```

   PowerShell: `$env:CLOUDFLARE_D1_DATABASE_ID="your-database-id"`.

3. Apply the versioned database migrations:

   ```sh
   npm run db:remote
   ```

4. Set your chosen admin password as a Cloudflare secret. Enter it at the prompt, never in source code:

   ```sh
   npx wrangler secret put ADMIN_PASSWORD --config dist/server/wrangler.json
   ```

   For a first deployment, Wrangler may ask to create the Worker. Confirm creation of `wales-childrenday`.

5. Deploy:

   ```sh
   npm run deploy:cloudflare
   ```

   Wrangler prints the new `workers.dev` URL. This deployment makes the student page public; `/admin` still requires your password. Your existing hosted website remains separate.

For later releases, keep the same database ID and run `npm run build:cloudflare`, `npm run db:remote`, then `npm run deploy:cloudflare`. Do not edit an already-applied migration. Generate a new migration with `npm run db:generate` when changing the schema.

### Optional Git-connected Cloudflare builds

Connect this GitHub repository to a Cloudflare **Workers** project, configure Node.js 24, and add `CLOUDFLARE_D1_DATABASE_ID` as a build variable. Use:

- Build command: `npm run build:cloudflare`
- Deploy command: `npm run db:remote && npm run deploy:cloudflare`

Provision D1 and the Worker secret first using the steps above. `ADMIN_PASSWORD` belongs in the Worker's runtime secrets, not a public repository or a client-side environment variable.

## Useful commands

- `npm run dev` — local app
- `npm run build` — production Next.js build for Vercel
- `npm start` — run the production Next.js server
- `npm run dev:cloudflare` — optional local Worker app
- `npm run typecheck` — TypeScript checks
- `npm run db:generate` — generate a new migration
- `npm run db:local` — apply migrations to local development storage
- `npm run build:cloudflare` — build and configure your D1 deployment
- `npm run db:remote` — apply migrations to your configured Cloudflare D1 database
- `npm run deploy:cloudflare` — publish the prepared build

## Project files

- `app/page.tsx`: student journey
- `components/wish-card.tsx`: card rendering and PNG export
- `app/admin/page.tsx`: teacher management and student records
- `app/api/`: server-side APIs
- `db/schema.ts` and `drizzle/`: database schema and migrations
- `public/wales-logo.png`: Wales logo

Official references: [Vercel build settings](https://vercel.com/docs/builds/configure-a-build), [D1 HTTP query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/), [Workers configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
