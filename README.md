# Changia Publishable System

Changia is a full-stack celebration, contribution, and paid-event platform built for Kenya-first workflows.

This package includes:
- **frontend**: Vite + React application
- **backend**: Express + MongoDB API
- **proof uploads**: local filesystem storage for MVP publishing
- **manual verification**: organiser approval flow for contributions and paid-event access
- **admin risk view**: duplicate transaction-code checks and basic Guardian fraud states
- **deployment support**: Dockerfiles, docker-compose, nginx config, and environment examples

## What is production-ready here
- JWT authentication
- organiser-owned spaces (cards and events)
- public contribution/event submission with proof upload
- organiser dashboard for approval/rejection
- admin oversight endpoints and UI
- responsive compact UI aligned to your preview

## What still needs real-world setup before launch
- real M-Pesa / PSP integration if you later want direct checkout
- cloud storage for uploads (S3, Cloudinary, etc.)
- email / SMS notifications
- analytics, audit logs, rate limits, backups, and monitoring tuning
- domain, TLS, and brand assets

---

## Local run

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3) Seed demo data
```bash
cd backend
npm run seed
```

Demo users after seeding:
- **Admin**: `admin@changia.app` / `Admin123!`
- **Organizer**: `grace@changia.app` / `Organizer123!`

---

## Docker run
```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:8080`
- Backend API: proxied through frontend nginx at `/api`
- MongoDB: internal container

---

## Folder structure
```text
changia-publishable/
  backend/
  frontend/
  docker-compose.yml
  README.md
```

---

## Publish flow suggestion
- Put `backend` on Render / Railway / Fly.io / ECS
- Put `frontend` on Vercel, Netlify, or keep the provided nginx container
- Move uploads to object storage
- Set `JWT_SECRET`, `MONGODB_URI`, and production domains
- Put `/api` behind HTTPS and enable backups + observability
