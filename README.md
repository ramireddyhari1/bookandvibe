# 🎫 Book & Vibe : The Premier Events & Sports Ecosystem

**Book & Vibe** is a high-fidelity, comprehensive full-stack ecosystem bridging the gap between immersive live entertainment ("The Vibe") and world-class sports turf management ("The Game"). Engineered with a premium, aesthetic-first approach and a massively scalable centralized backend.

![Book & Vibe Platform](https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070)

---

## 🔥 Product Scope & Features

*   **Dual-Ecosystem Setup:** 
    *   **The Vibe (Events):** Live concerts, cinema, and ticketed experiences with interactive seating arrangements and visual mapping.
    *   **The Game (GameHub):** Professional turf reservation, facility management, dynamic pricing, and local sports matching (Playo equivalent).
*   **Premium Web Experience:** Next.js architecture using custom Tailwind-driven glassmorphism, dynamic animations, hover-elasticity, and deeply responsive dual-pane landing sections.
*   **Real-time Synchronization:** Powered by Socket.IO, bridging Seat & Slot locking live across all connected clients to prevent double-booking collisions.
*   **Role-Based Hierarchy:** Isolated, highly customized functional dashboards for `USER`, `PARTNER` (Event Hosts & Venue Owners), and `ADMIN`.
*   **Explicit Partner Identification:** Admins create partner accounts and link them directly to their managed resources—assigning an **Event Host ID** for event managers or linking them to a **specific GameHub Facility** for venue owners. The partner mobile app automatically routes to the correct portal based on these data associations.

---

## 🏗️ Monorepo Architecture

This monorepo is divided strictly into isolated modules that seamlessly communicate with the unified central API engine.

| Directory | Core Platform | Operational Role |
| :--- | :--- | :--- |
| `web-app/` | **Next.js 16** | The high-fidelity, interactive public user interface. |
| `admin-dashboard/` | **Next.js 16** | Secure management portals for system Admins and local Partners. |
| `mobile-app/` | **Expo (RN)**| Consumer-facing iOS & Android premium mobile application. |
| `partner-mobile-app/`| **Expo (RN)**| Dual-portal utility app for **Event Hosts** (ticketing & check-in) and **Venue Owners** (slot management & GameHub). Portal is auto-assigned by admin. |
| `backend/` | **Express API** | The core state-engine. Handles auth, websockets, routing, scaling, and DB transactions. |

### The Tech Stack

*   **Frontend Ecosystem:** Next.js 16, React 19, Expo App Router
*   **Styling Engine:** Tailwind CSS 4, Lucide React Icons
*   **Backend & Infrastructure:** Express.js 5, Node.js 18+, Prisma ORM, PostgreSQL 15, Redis
*   **Live Events:** Socket.IO for micro-latency concurrency.

---

## 🚀 Quick Start Guide (Local Ecosystem)

### 1) System Prerequisites
*   **Node.js 18+** & **npm 9+**
*   **Docker Desktop** (Strictly required for firing up the backing PostgreSQL & Redis instances)

### 2) Install Dependencies (Ecosystem-Wide)
From the repository root, install all node modules for all systems seamlessly:
```bash
npm install
cd backend && npm install
cd ../web-app && npm install
cd ../admin-dashboard && npm install
cd ../mobile-app && npm install
```

### 3) Initiate Local Infrastructure
Boot up the integrated PostgreSQL database.
```bash
docker compose up -d
```
*   `Host Port:` 5433
*   `Database:` book_and_vibe

### 4) Config Env & Database Schema Synchronization
Make sure to copy over `.env.example` to `.env` inside `/backend` with standard API configurations. Then push the high-performance Prisma schema to your running Docker instance:
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5) Boot Up the Matrix
You can utilize our global NPM scripts to isolate each development server directly from the root structure.

```bash
# Terminal 1 - The State Engine (Port 5000)
npm run dev:backend

# Terminal 2 - The Public Web App (Port 3000)
npm run dev:web

# Terminal 3 - The Management Dashboard (Port 3001)
npm run dev:admin

# Terminal 4 - The Consumer Mobile App (Expo: 8081)
npm run dev:mobile

# Terminal 5 - The Partner Mobile App (Expo: 8082)
npm run dev:partner
```

*(Note for Mobile App Android Emulators: Be sure to configure API networking HTTP endpoints to point to your core machine's IP (e.g. `10.0.2.2`) instead of `localhost`).*

---

## 🛡️ Core Backend Schemas

Prisma governs a massive entity interaction ring encompassing everything within Book & Vibe:
*   **Identity Layer:** `User`, `Wallet`, `WalletTransaction`
*   **The Vibe (Events):** `Event`, `Tier`, `Show`, `ShowSeat`, `BookingSeat`
*   **The Game (GameHub):** `GamehubFacility`, `GamehubBooking`, `GamehubBlockedSlot`
*   **Financial Protocol:** Custom real-time split-payment calculation logic mapping payments to their root `BookingItem` or `BookingSeat`.

---

## 🤝 Partner App — Dual Portal Architecture

The Partner Mobile App is divided into two dedicated portals, each tailored to a specific partner role:

| Portal | Directory | Assigned When | Features |
| :--- | :--- | :--- | :--- |
| **🎤 Event Host** | `(event-tabs)/` | Admin assigns an `eventHostId` | Event dashboard, ticket tracking, QR entry scanning, event earnings |
| **🏟️ Venue Owner** | `(venue-tabs)/` | Admin links a `gamehubFacility` | GameHub dashboard, slot management, bookings, facility earnings |

**How it works:**
1. Admin creates a partner account in the Admin Dashboard.
2. The account is explicitly linked to either an **Event Host ID** or a **GameHub Venue**.
3. These associations are stored on the `User` record or via database relationships.
4. When the partner logs in to the mobile app, `AuthContext` detects these IDs and auto-routes to the correct tab group based on their assigned resource.
5. Functional portals ensure that Event Hosts see event-related operations while Venue Owners see turf-related operations.

## 🎨 UI/UX Philosophy
We believe function organically follows form. Book & Vibe employs aggressive glassmorphism aesthetics (`backdrop-blur-md bg-white/60`), immersive hover layouts, high-fidelity responsive sizing, and massive dual-screen split frameworks to immediately establish raw visual authority in both the Events and Turf booking spheres.

---

**License:** ISC
