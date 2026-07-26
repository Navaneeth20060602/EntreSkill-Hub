# Project Structure

```
EntreSkill-Hub/
├── client/                     React + Vite frontend
│   ├── src/
│   │   ├── components/         Reusable UI pieces, grouped by feature
│   │   ├── pages/               Route-level components
│   │   ├── layouts/             Shared page layout (Navbar + Footer)
│   │   ├── context/              React context (auth state)
│   │   ├── services/             Axios API calls
│   │   └── data/                  Static catalog data (used as fallback / demo content)
│   └── public/
│
├── server/                     Express + Prisma backend
│   ├── config/                  Database and Prisma client setup
│   ├── controllers/             Route handlers
│   ├── services/                 Business logic, talks to Prisma models
│   ├── models/                   Named wrappers around Prisma models
│   ├── routes/                   Express routers, one per resource
│   ├── middleware/               Auth, error handling, logging, validation
│   ├── utils/                     Small shared helpers
│   └── prisma/                    schema.prisma + seed.js
│
├── database/                   ERD and raw SQL references
├── docs/                        Project documentation (this folder)
├── postman/                     API collection for manual testing
├── scripts/                     backup / restore / seed CLI helpers
└── tests/                       Backend automated tests
```

## In Scope (Phase 1)

- Web-based responsive platform
- Skill and interest assessment
- Business idea recommendations
- Mentorship directory

## Out of Scope (Phase 1)

- Native mobile applications
- Live funding or loan processing
- Advanced AI career coaching
- Government subsidy integrations (a static, informational scheme list is
  included, but no application/processing flow)
