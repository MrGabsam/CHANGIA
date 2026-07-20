# Dunda by Changia

Dunda is the Kenya-first ticketing, gifting and social event engine inside Changia.

## Revenue features

- Multi-tier tickets with inventory and overselling protection
- Ticket service fee calculation
- Event gifting with a separate service rate
- Viral squad links and automatic reward unlocking
- Public attendee social proof and squad leaderboard
- Dunda target meter for event unlocks
- Organiser revenue and sales dashboard
- Unique ticket codes and duplicate-resistant gate check-in

## Main routes

### Public

- `/` — Dunda marketing and event discovery
- `/e/:slug` — event page, tickets, gifts, squads and checkout

### Organiser

- `/app/dunda` — portfolio and revenue dashboard
- `/app/dunda/new` — event builder
- `/app/dunda/check-in` — gate validation

## API

- `GET /api/dunda/events`
- `POST /api/dunda/events`
- `GET /api/dunda/events/:slug`
- `POST /api/dunda/events/:id/squads`
- `POST /api/dunda/events/:id/checkout`
- `GET /api/dunda/orders/:reference`
- `GET /api/dunda/organiser/dashboard`
- `POST /api/dunda/events/:id/check-in`

## Test locally

```bash
# Start MongoDB first

cd backend
cp .env.example .env
npm install
npm run seed
npm test
npm run dev

# In a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open:

- Public demo: `http://localhost:5173/e/afro-sunset-nairobi`
- Organiser: `grace@changia.app` / `Organizer123!`
- Gate test ticket: `TIX-DEMO01`

## Payment safety

`PAYMENTS_MODE=demo` is intended only for development. Production automatically converts attempted `test` checkout requests to a real payment method and leaves the order pending. A licensed payment provider still needs to be connected before collecting live money.

Before launch, configure a payment service provider, webhook verification, email/SMS/WhatsApp delivery, cloud asset storage, rate limiting, audit retention, backups and monitoring.
