# Appointment Booking System

A full-stack appointment booking system built with React, Node.js/Express, and PostgreSQL.

## Features

- Service selection with descriptions and pricing
- Calendar date picker with available time slots
- User registration and login (JWT + HTTP-only refresh cookies)
- Booking confirmation with email notification
- User dashboard to view and cancel bookings
- Admin panel: manage slots (create/block) and view all bookings
- Double-booking prevention via database transactions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand |
| HTTP Client | Axios (with silent token refresh) |
| Calendar | react-day-picker |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (via `pg`) |
| Auth | JWT (access + refresh tokens) |
| Email | Nodemailer (Ethereal in dev) |

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone and install

```bash
cd appointment-booking
npm install          # installs root (concurrently)
cd client && npm install
cd ../server && npm install
```

### 2. Create the database

```sql
CREATE DATABASE appointment_booking_db;
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your DB credentials and JWT secrets

# Client (optional for dev — Vite proxies /api to localhost:3000)
cp client/.env.example client/.env
```

### 4. Run database migrations

```bash
cd server
npm run migrate
```

### 5. Create the first admin user

After running the app, register a user normally, then update their role:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 6. Start development servers

From the root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Login |
| `POST /api/auth/refresh` | Refresh access token (cookie) |
| `GET /api/services` | List all services |
| `GET /api/slots?serviceId=&date=` | Available slots |
| `POST /api/bookings` | Create booking |
| `GET /api/bookings/my` | User's bookings |
| `PATCH /api/bookings/:id/cancel` | Cancel booking |
| `GET /api/admin/bookings` | (Admin) All bookings |
| `POST /api/slots` | (Admin) Create slot |

## Email

In development, emails are sent to [Ethereal](https://ethereal.email/) — a fake SMTP service. The preview URL is logged to the server console after each email is sent.

For production, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `server/.env`.

## Project Structure

```
appointment-booking/
├── client/         # React + Vite frontend
│   └── src/
│       ├── api/         # Typed API modules
│       ├── components/  # Reusable UI + layout
│       ├── pages/       # Route-level pages
│       ├── stores/      # Zustand state
│       ├── types/       # TypeScript types
│       └── utils/       # Date formatting, cn()
└── server/         # Express backend
    └── src/
        ├── config/      # DB, env, mailer
        ├── controllers/ # Route handlers
        ├── db/          # Migrations + typed queries
        ├── middleware/  # Auth, validation, error handler
        ├── routes/      # Express routers
        ├── services/    # Business logic
        └── templates/   # Email HTML templates
```
