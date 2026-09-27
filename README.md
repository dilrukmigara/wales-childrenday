# Wales Children’s Day

A React website for Wales Higher Education Center. Students enter their name and contact number, select a teacher, and download a personalized Children’s Day card.

- Details are saved before class selection, including unfinished visits.
- Three card designs for Grades 6–9, Grades 10–11 and A/L.
- `/admin` manages classes and custom teacher wishes and shows all saved entries through pagination.
- Admin password authentication uses server-side sessions and an environment secret.
- The class dropdown supports mobile screens and long teacher names.

## Stack

React 19, Vinext/Vite, Cloudflare Workers, D1 (SQLite), Drizzle migrations, Radix UI and Tailwind CSS. This is a full-stack app: **GitHub Pages/static hosting alone cannot run its admin APIs or database**.

## Run locally

Use Node.js 24 LTS and npm.

```sh
git clone https://github.com/dilrukmigara/wales-childrenday.git
cd wales-childrenday
npm ci
cp .env.example .env
```

Set `ADMIN_PASSWORD` in your local `.env` file. Never commit this file.

```sh
npm run build
npm run db:local
npm run dev
```

Open the local URL printed by the development server. The example teacher is created when the class list is first loaded. Sign in at `/admin` to add the real teachers.

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
- `npm run build` — Worker + client build
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

Official references: [Workers configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
