# API Reference

Base URL: `http://localhost:5000/api`

All responses follow this shape:

```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```

Authenticated routes read the JWT from an httpOnly cookie set on
login/register. Postman users can instead send it as
`Authorization: Bearer <token>`.

## Auth

| Method | Route              | Auth | Description                |
|--------|--------------------|------|-----------------------------|
| POST   | `/auth/register`   | No   | Create an account           |
| POST   | `/auth/login`      | No   | Log in                      |
| POST   | `/auth/logout`     | No   | Clear the auth cookie       |
| GET    | `/auth/me`         | Yes  | Get the current user        |

## Users

| Method | Route         | Auth | Description                     |
|--------|---------------|------|-----------------------------------|
| PATCH  | `/users/me`   | Yes  | Update `fullName` / `mobile`      |

## Profile (skill assessment & progress)

| Method | Route                            | Auth | Description                        |
|--------|-----------------------------------|------|--------------------------------------|
| GET    | `/profile`                       | Yes  | Get saved skills, selection, progress |
| PUT    | `/profile/skills`                | Yes  | Save `selectedSkills` + `primarySkill`|
| PUT    | `/profile/business`              | Yes  | Save `businessId` as selected         |
| PUT    | `/profile/progress`              | Yes  | Save `completedSteps`                 |
| POST   | `/profile/bookmark/:businessId`  | Yes  | Toggle a bookmark                     |

## Business Ideas

| Method | Route                     | Auth | Description                          |
|--------|----------------------------|------|----------------------------------------|
| GET    | `/business?skill=Cooking` | No   | List business ideas, optional filter   |
| GET    | `/business/:id`           | No   | Get one business idea + learning info  |
| POST   | `/business/recommendations`| No  | Body `{ skills: [] }` → matching ideas |

## Mentors

| Method | Route                              | Auth | Description                  |
|--------|--------------------------------------|------|---------------------------------|
| GET    | `/mentors?specialization=Cooking`   | No   | List mentors, optional filter   |

## Learning Resources

| Method | Route                       | Auth | Description                     |
|--------|-------------------------------|------|------------------------------------|
| GET    | `/learning/:businessId`      | No   | Learning resources for a business  |

## Roadmap

| Method | Route                                | Auth | Description                          |
|--------|-----------------------------------------|------|------------------------------------------|
| GET    | `/roadmap/:businessId`                 | No   | Roadmap steps for a business             |
| GET    | `/roadmap/:businessId/progress`        | Yes  | Your saved completed steps               |
| POST   | `/roadmap/:businessId/progress`        | Yes  | Save `{ completedSteps: [] }`            |

## Calculator

| Method | Route                  | Auth | Description                                   |
|--------|--------------------------|------|--------------------------------------------------|
| POST   | `/calculator/estimate`  | No   | Body `{ businessId, monthsToSave }` → estimate    |

## Government Schemes

| Method | Route       | Auth | Description                     |
|--------|--------------|------|------------------------------------|
| GET    | `/schemes`  | No   | List seeded government schemes     |
