# Rotted Capes Character Creator

This project is a Vite/React web application with an Express API for creating characters for the *Rotted Capes* RPG. It uses a PostgreSQL database managed through [Drizzle](https://orm.drizzle.team/).

## Environment Variables

Create a `.env` file in the project root with the following keys:

```bash
# Firebase configuration used on the client
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Optional Google Analytics key
VITE_GA_MEASUREMENT_ID=your-ga-id

# PostgreSQL connection string used by the server and Drizzle
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

These variables are loaded by both the server and the Vite client build.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

This launches Express on `localhost:5000` with Vite providing hot module reloading for the React client.

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
