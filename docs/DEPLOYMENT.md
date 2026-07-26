# Deployment Guide

## Backend (API)

Deploy `server/` to any Node host that supports environment variables and
a persistent PostgreSQL connection (Render, Railway, Fly.io, a VPS, etc.),
or build the provided `Dockerfile`:

```bash
docker build -t entreskillhub-api .
docker run -p 5000:5000 --env-file server/.env.production entreskillhub-api
```

Set these environment variables on your host:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL` (your deployed frontend URL, for CORS)
- `NODE_ENV=production`

Run migrations once against the production database:

```bash
npx prisma migrate deploy
```

## Frontend

The client is a static Vite build, deployable to Vercel or Netlify.

```bash
cd client
npm run build
```

Deploy the `dist/` folder. Set `VITE_API_URL` in the hosting provider's
environment variables to point at your deployed API, e.g.
`https://api.yourdomain.com/api`.

## Database

Any managed PostgreSQL provider works (Neon, Supabase, Railway, RDS). Use
the connection string it gives you as `DATABASE_URL`.
