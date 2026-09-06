# Storewell — Store Rating Platform

A full-stack web app where users rate stores (1–5) with three roles:
**System Administrator**, **Normal User**, and **Store Owner**, sharing a
single login.

## Tech stack

- **Backend:** Express.js + Sequelize (chosen over NestJS/Loopback for a
  lean REST API that's fast to build and reason about for this scope)
- **Database:** PostgreSQL (chosen over MySQL for its native `ENUM` type,
  case-insensitive `ILIKE` search, and solid Sequelize support)
- **Frontend:** React (Vite) + React Router + Axios

## Project structure

```
backend/    Express API, Sequelize models, JWT auth
frontend/   React (Vite) single-page app
```

## 1. Database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE store_ratings;
```

## 2. Backend setup

```bash
cd backend
cp .env.example .env   # edit DB credentials / JWT secret as needed
npm install
npm run seed            # creates the first admin account (see .env)
npm run dev              # starts the API on http://localhost:5000
```

The seed script prints the admin email/password it created (defaults to
`admin@storerating.com` / `Admin@1234` — change these in `.env` before
seeding in anything resembling production).

Tables are created automatically on boot via `sequelize.sync({ alter: true })` —
fine for this challenge; use real migrations in production.

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev              # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so no
extra configuration is needed in development.

## Roles & flow

- **Sign up** (`/signup`) always creates a **Normal User**.
- **Admin** and **Store Owner** accounts are created by an admin from
  **Admin → Add a user**, picking the role.
- To give a store owner their dashboard, first create their user account
  (role: Store Owner), then create the store from **Admin → Add a store**
  and assign that owner in the dropdown.
- Everyone logs in from the same `/login` page; the app routes each role
  to its own home screen (`/admin`, `/stores`, `/owner`).

## Validation rules (enforced on both client and server)

- **Name:** 20–60 characters
- **Address:** up to 400 characters
- **Password:** 8–16 characters, at least one uppercase letter and one
  special character
- **Email:** standard email format

## API overview

| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | public | register a normal user |
| POST | `/api/auth/login` | public | log in (any role) |
| GET  | `/api/auth/me` | any | current user |
| PUT  | `/api/auth/password` | any | change own password |
| GET  | `/api/admin/dashboard` | admin | user/store/rating counts |
| POST | `/api/admin/users` | admin | create user/admin/store-owner |
| POST | `/api/admin/stores` | admin | register a store |
| GET  | `/api/admin/users` | admin | list + filter + sort users |
| GET  | `/api/admin/users/:id` | admin | user detail (+ rating if store owner) |
| GET  | `/api/admin/stores` | admin | list + filter + sort stores |
| GET  | `/api/stores` | normal user | browse/search stores, own rating included |
| POST | `/api/stores/:id/rating` | normal user | submit/update a 1–5 rating |
| GET  | `/api/store-owner/dashboard` | store owner | raters + average rating |

## Notes on design decisions

- Passwords are hashed with bcrypt; JWTs carry `id` and `role` and are
  verified on every protected route via middleware, with a second
  `authorize(role)` middleware for role-gating.
- A user can only ever have one rating per store — submitting again
  updates the existing row (`findOrCreate` + update), matching "modify
  their submitted rating" in the spec.
- Sorting/filtering on listings is done server-side via query params
  (`sortBy`, `sortOrder`, and per-field filters) so it scales past
  whatever's rendered client-side.
