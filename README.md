# Offer Track

Next.js app scaffolded with shadcn/ui, Railway Postgres, and Drizzle ORM.

## Database setup

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to the Railway Postgres public URL for local development.
3. Run `npm run db:generate` to create SQL migrations.
4. Run `npm run db:migrate` to apply them.
5. Start the app with `npm run dev`.

## Database files

- `drizzle.config.ts` configures Drizzle Kit.
- `lib/db/schema.ts` contains the starter schema.
- `lib/db/index.ts` exports the pooled Drizzle client.

## Useful commands

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```
