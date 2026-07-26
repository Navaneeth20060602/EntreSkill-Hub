# Database Schema

PostgreSQL, managed with Prisma. Full source of truth:
`server/prisma/schema.prisma`.

## Models

- **User** - account info + hashed password
- **UserProgress** - one-to-one with User; stores selected skills, primary
  skill, currently selected business, completed roadmap steps and
  bookmarked business ideas
- **BusinessIdea** - a business idea tied to a skill, with its investment
  range, income range, difficulty, duration, required skills and roadmap
  steps
- **LearningResource** - one-to-one with BusinessIdea; skills, courses,
  PDFs, certifications and YouTube links
- **Mentor** - mentor directory entries
- **GovernmentScheme** - informational list of government support schemes

## Relationships

```
User 1───1 UserProgress ──*───1 BusinessIdea 1───1 LearningResource
```

## Migrations

```bash
cd server
npx prisma migrate dev --name <migration_name>
```

## Seeding

`server/prisma/seed.js` populates business ideas, learning resources,
mentors and government schemes with the same catalog the frontend used to
keep as static mock data.

```bash
npm run seed
```

See `database/ERD.png` for a visual diagram (add your own export from
Prisma Studio or `npx prisma studio` when needed) and `database/init.sql` /
`backup.sql` for raw SQL references if you need to inspect the schema
outside of Prisma.
