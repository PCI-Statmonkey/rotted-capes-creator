# Rotted Capes Character Creator

This project is a Vite/React web application with an Express API for creating characters for the *Rotted Capes* RPG. It uses a PostgreSQL database managed through [Drizzle](https://orm.drizzle.team/).

## Environment Variables

Environment configuration is split between development, production, and a
template for new contributors:

- Copy `.env.example` to `.env` for local development and fill in any sensitive
  values (Firebase client keys, analytics IDs, etc.).
- Use `.env.production` for production deployments.

Both files should provide a `DATABASE_URL` and `PORT`. The example file uses a
local Postgres connection string and the default Express port of `5000` so you
can get started quickly.

> **⚠️ TLS note:** TLS certificate verification is **enabled by default**. Only
> set `ALLOW_INSECURE_TLS=true` in your local `.env` if you must bypass TLS for
> troubleshooting. Never add this flag to `.env.production`.

These variables are loaded by both the server and the Vite client build.

## Quick Start

Follow these steps when first cloning the project or when pulling new changes
from GitHub:

1. **Grab the latest code**
   ```bash
   git pull origin main
   ```
   or if you haven't cloned the repository yet:
   ```bash
   git clone https://github.com/your-username/rotted-capes-creator.git
   cd rotted-capes-creator
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Create your `.env` file**
   Copy the keys shown in the *Environment Variables* section above into a file
   named `.env` in the project root.

4. **Apply database migrations**
   ```bash
   npm run db:push
   ```

5. **(Optional) Seed the game data** – run once on a new database
   ```bash
   npm run seed:game
   ```

6. **Type-check the code**
   ```bash
   npm run check
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

Whenever you pull new updates that modify `package.json` or `package-lock.json`,
run `npm install` again. If migrations were added, repeat step 4 to keep your
database in sync.

## Development

After completing the steps in **Quick Start**, use the command below whenever you
want to run the app locally:

```bash
npm run dev
```

The server runs on `http://localhost:5000` with hot reloading provided by Vite.

## Common Scripts

- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Prod (example):** `npm run start`

## Type Checking

Run the TypeScript compiler to verify the build:

```bash
npm run check
```

Be sure to run `npm install` before executing the check script so that all required dependencies are installed.

## Database Migrations

Database schema changes are managed with Drizzle. To apply pending migrations run:

```bash
npm run db:push
```

This executes `drizzle-kit push` using the `DATABASE_URL` from `.env` and updates the files inside the `migrations/` directory.

## Repository Layout

```
client/     - React front‑end code
server/     - Express API and Vite integration
shared/     - shared TypeScript modules and database schema
migrations/ - Drizzle SQL migrations and relations
scripts/    - seeding and helper scripts
attached_assets/ - misc static assets
 docs/      - game documentation
```

The `client/` folder is the Vite root, while the compiled assets are served from the Express server in development and production.

### Character Sheet PDF

The inline character sheet now mirrors the layout of `attached_assets/Character Sheet_All New Design_2.0.pdf`. A two-column grid is rendered with Tailwind classes and exported PDFs use the same layout via `pdfGenerator`.
