# Offer Track

Next.js app scaffolded with shadcn/ui, Postgres, and Drizzle ORM.

## Database setup

1. Copy `.env.example` to `.env.local`.
2. Make sure your local PostgreSQL service is running on `127.0.0.1:5432`.
3. Create the database: `createdb -U postgres offer_track`
4. Run `npm run db:migrate` to apply migrations.
5. Run `npm run db:seed` to load the demo account and sample pipeline data.
6. Start the app with `npm run dev`.

The default `.env.example` points to local Postgres on `127.0.0.1:5432`.

## Database files

- `drizzle.config.ts` configures Drizzle Kit.
- `lib/db/schema.ts` contains the starter schema.
- `lib/db/index.ts` exports the pooled Drizzle client.
- `lib/db/seed.ts` defines the deterministic demo dataset.
- `scripts/db-seed.mjs` applies the seed data to Postgres.

## Useful commands

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:setup
npm run db:push
npm run db:studio
```
