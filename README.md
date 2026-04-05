# 🎉 Book & Vibe

> A modern event booking & experiences platform — like BookMyShow, built for scale.

## 🏗️ Monorepo Structure

```
book-and-vibe/
│
├── web-app/            → User-facing website (Next.js)
├── admin-dashboard/    → Admin & Partner dashboard (Next.js)
├── backend/            → API server (Node.js + Express)
├── mobile-app/         → Mobile app (React Native / Expo)
└── package.json        → Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install all dependencies
```bash
npm install
```

### Run individual apps

```bash
# User Web App (http://localhost:3000)
cd web-app && npm run dev

# Admin Dashboard (http://localhost:3001)
cd admin-dashboard && npm run dev

# Backend API (http://localhost:5000)
cd backend && npm run dev

# Mobile App
cd mobile-app && npx expo start
```

## 🔧 Tech Stack

| Layer          | Technology      |
|----------------|-----------------|
| Mobile App     | React Native (Expo) |
| User Web       | Next.js         |
| Dashboard      | Next.js         |
| Backend API    | Node.js + Express |
| Database       | PostgreSQL      |
| Storage        | AWS S3          |
| Payments       | Razorpay        |
| Auth           | JWT / Firebase  |

## 📡 API Endpoints

| Service        | Base Path              |
|----------------|------------------------|
| Auth           | `/api/auth`            |
| Events         | `/api/events`          |
| Bookings       | `/api/bookings`        |
| Payments       | `/api/payments`        |
| Notifications  | `/api/notifications`   |
| Users          | `/api/users`           |

## 📄 License

ISC
