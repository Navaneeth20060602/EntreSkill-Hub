# Installation Guide

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- A PostgreSQL database (local, Docker, or a free hosted instance such as
  Neon, Supabase, or Railway)

## 1. Clone the repository

```bash
git clone https://github.com/Navaneeth20060602/EntreSkill-Hub.git
cd EntreSkill-Hub
```

## 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Configure environment variables

Backend (`server/.env.development`, copied from `server/.env.example`):

| Variable       | Description                              |
|----------------|-------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string              |
| `PORT`         | Port the API listens on (default `5000`)  |
| `JWT_SECRET`   | Secret used to sign auth tokens           |
| `CLIENT_URL`   | Frontend origin, used for CORS            |

Frontend (`client/.env`, copied from `client/.env.example`):

| Variable        | Description                  |
|-----------------|-------------------------------|
| `VITE_API_URL`  | Base URL of the backend API   |

## 4. Set up the database

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

## 5. Run the app

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Visit `http://localhost:5173`.

## Running with Docker (backend + database only)

```bash
docker compose up --build
```

This starts PostgreSQL and the API. Run the client separately with
`npm run dev` inside `client/`.
