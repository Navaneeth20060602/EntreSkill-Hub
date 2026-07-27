# EntreSkill Hub

**Skill-to-Startup Enablement Platform**

EntreSkill Hub helps people with practical skills - cooking, tailoring,
photography, teaching, repair services and more - turn those skills into a
sustainable micro-business. It recommends business ideas based on a short
skill assessment, gives a step-by-step roadmap for each idea, points to
learning resources, and connects users with mentors.

Built as part of the Unified Mentor program, aligned with the Small
Business Administration (SBA) problem statement on micro-entrepreneurship.

## Features

- Skill assessment that recommends business ideas
- Step-by-step business roadmaps with progress tracking
- Curated learning resources (courses, guides, videos, certifications)
- Mentor directory filtered by specialization
- User accounts with saved progress
- Basic investment estimator and government scheme directory

## Tech Stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| Backend  | Node.js, Express 5                                |
| Database | PostgreSQL via Prisma ORM                         |
| Auth     | JWT stored in an httpOnly cookie, bcrypt hashing  |

## Project Structure

```
EntreSkill-Hub/
├── client/          React + Vite frontend
├── server/          Express + Prisma backend API
├── database/        ERD, backup and seed SQL references
├── docs/            Project documentation
├── postman/         API collection for manual testing
├── scripts/         Backup / restore / seed helper scripts
└── tests/           Backend automated tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local install or a free hosted instance)

### 1. Clone and install

```bash
git clone https://github.com/Navaneeth20060602/EntreSkill-Hub.git
cd EntreSkill-Hub

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env.development
# then edit .env.development with your DATABASE_URL and JWT_SECRET
```

```bash
cd ../client
cp .env.example .env
# edit VITE_API_URL if your API doesn't run on localhost:5000
```

### 3. Set up the database

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

### 4. Run the app

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at
`http://localhost:5000/api`.

## Documentation

See the [`docs/`](./docs) folder for API reference, database schema,
installation notes, deployment guide and user guide.

## Scope

This is Phase 1 of the platform. Native mobile apps, live loan/funding
processing, advanced AI coaching and government subsidy integrations are
out of scope for this phase - see [`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md)
for the full breakdown.
