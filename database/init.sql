-- Reference SQL matching server/prisma/schema.prisma.
-- In normal development, use `npx prisma migrate dev` instead of running
-- this by hand - it's kept here for quick inspection or manual setup on
-- environments where Prisma migrations aren't available.

CREATE TYPE "Role" AS ENUM ('USER', 'MENTOR', 'ADMIN');

CREATE TABLE users (
    id             TEXT PRIMARY KEY,
    "fullName"     TEXT NOT NULL,
    email          TEXT UNIQUE NOT NULL,
    mobile         TEXT,
    "passwordHash" TEXT NOT NULL,
    role           "Role" NOT NULL DEFAULT 'USER',
    "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE business_ideas (
    id               TEXT PRIMARY KEY,
    title            TEXT UNIQUE NOT NULL,
    skill            TEXT NOT NULL,
    description      TEXT NOT NULL,
    investment       TEXT NOT NULL,
    income           TEXT NOT NULL,
    difficulty       TEXT NOT NULL,
    duration         TEXT NOT NULL,
    "requiredSkills" TEXT[] NOT NULL DEFAULT '{}',
    "roadmapSteps"   TEXT[] NOT NULL DEFAULT '{}',
    "createdAt"      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE learning_resources (
    id             TEXT PRIMARY KEY,
    "businessId"   TEXT UNIQUE NOT NULL REFERENCES business_ideas(id) ON DELETE CASCADE,
    skills         TEXT[] NOT NULL DEFAULT '{}',
    courses        TEXT[] NOT NULL DEFAULT '{}',
    pdfs           TEXT[] NOT NULL DEFAULT '{}',
    certifications TEXT[] NOT NULL DEFAULT '{}',
    youtube        JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE mentors (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience     TEXT NOT NULL,
    rating         DOUBLE PRECISION NOT NULL DEFAULT 0,
    location       TEXT NOT NULL,
    email          TEXT NOT NULL
);

CREATE TABLE government_schemes (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    link        TEXT NOT NULL
);

CREATE TABLE user_progress (
    id                       TEXT PRIMARY KEY,
    "userId"                 TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "selectedSkills"         TEXT[] NOT NULL DEFAULT '{}',
    "primarySkill"           TEXT,
    "selectedBusinessId"     TEXT REFERENCES business_ideas(id),
    "completedSteps"         TEXT[] NOT NULL DEFAULT '{}',
    "bookmarkedBusinessIds"  TEXT[] NOT NULL DEFAULT '{}',
    "createdAt"              TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"              TIMESTAMP NOT NULL DEFAULT now()
);
