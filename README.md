# Book & Vibe Control Suite

Book & Vibe is a full-stack event and venue operations platform for discovery, booking, partner management, and real-time seat workflows.

This repository is a monorepo containing:
- Public web experience for customers
- Premium admin dashboard for admins and partners
- Backend API with role-based access and operational modules
- Mobile app (Expo)

## Product Scope

- Event lifecycle: create, publish, manage, book
- GameHub facility lifecycle: inventory, availability, slot booking
- Role model: `USER`, `PARTNER`, `ADMIN`
- Partner scoping: assigned-resource access for Events and GameHub
- Real-time seat/slot updates and booking coordination

## Monorepo Structure

```text
book-and-vibe/
|- admin-dashboard/    Next.js admin and partner control suite
|- backend/            Express API + Prisma + PostgreSQL + Redis support
|- mobile-app/         Expo React Native client
|- web-app/            Next.js public user-facing app
|- docker-compose.yml  Local PostgreSQL service
`- package.json        Root dev shortcuts
```

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend Web | Next.js 16, React 19, Tailwind CSS 4 |
| Admin | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 5, Prisma 7 |
| Database | PostgreSQL 15 |
| Cache/Locks | Redis |
| Mobile | Expo, React Native |
| Realtime | Socket.IO |

## Services and Ports

| Service | Default URL | Notes |
| --- | --- | --- |
| Web App | http://localhost:3000 | Customer-facing app |
| Admin Dashboard | http://localhost:3001 | Admin and partner UI |
| Backend API | http://localhost:5000 | REST + realtime |
| PostgreSQL (Docker) | localhost:5433 | Maps to container 5432 |

## Quick Start (Local Development)

## 1) Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (recommended for local PostgreSQL)

## 2) Install Dependencies

From repo root:

```bash
npm install
cd backend && npm install
cd ../web-app && npm install
cd ../admin-dashboard && npm install
cd ../mobile-app && npm install
```

## 3) Start Database

From repo root:

```bash
docker compose up -d
```

This starts:
- `postgres:15`
- database: `book_and_vibe`
- user: `postgres`
- password: `password123`
- host port: `5433`

## 4) Configure Backend Environment

Create `backend/.env` with at least:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password123@localhost:5433/book_and_vibe
JWT_SECRET=replace_with_secure_secret
REQUEST_BODY_LIMIT=12mb
SOCKET_CORS_ORIGIN=*
```

Optional (if enabled in your flow): mail, cloud storage, payment provider keys.

## 5) Prisma Sync

From `backend/`:

```bash
npx prisma generate
npx prisma db push
```

## 6) Run Applications

Option A: Use root shortcuts (from repo root)

```bash
npm run dev:backend
npm run dev:web
npm run dev:admin
npm run dev:mobile
```

Option B: Run each app directly

```bash
cd backend && npm run dev
cd web-app && npm run dev
cd admin-dashboard && npm run dev -- -p 3001
cd mobile-app && npm run start
```

## Root Scripts

Defined in root `package.json`:

```json
{
	"dev:web": "cd web-app && npm run dev",
	"dev:admin": "cd admin-dashboard && npm run dev",
	"dev:backend": "cd backend && npm run dev",
	"dev:mobile": "cd mobile-app && npx expo start"
}
```

## Backend API Overview

Base URL: `http://localhost:5000/api`

| Domain | Route Prefix |
| --- | --- |
| Health | `/health` |
| Auth | `/auth` |
| Events | `/events` |
| Bookings | `/bookings` |
| Payments | `/payments` |
| Notifications | `/notifications` |
| Users | `/users` |
| GameHub | `/gamehub` |

Health endpoint:

```http
GET /api/health
```

## Data Model Highlights

Prisma models include:
- `User` (roles, account status)
- `Event`, `Tier`, `Show`, `ShowSeat`
- `Booking`, `BookingItem`, `BookingSeat`, `Payment`
- `GamehubFacility`, `GamehubBooking`, related operational models

Key relationship behavior:
- Partners can be scoped to resources
- Resource management is role and ownership-aware in API routes

## Realtime

Socket.IO is enabled in backend server for seat-room coordination:
- `seat-room:join`
- `seat-room:leave`

Used for live seat/slot state sync flows.

## Quality and Lint

Run lint in individual apps:

```bash
cd admin-dashboard && npm run lint
cd web-app && npm run lint
```

Backend uses runtime checks and Prisma validation; add your test runner of choice if extending CI.

## Recommended Git Workflow

```bash
git checkout -b docs/readme-refresh
git add README.md
git commit -m "docs: rewrite root README with setup and architecture"
git push -u origin docs/readme-refresh
```

Then open a PR in GitHub.

## Security Notes

- Never commit real secrets to `.env`.
- Rotate `JWT_SECRET` for production.
- Restrict CORS and socket origins in non-local environments.
- Use managed PostgreSQL and Redis in production.

## License

ISC
