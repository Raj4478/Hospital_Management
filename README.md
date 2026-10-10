# MediCare HMS

A hospital management dashboard for **managers** and **pantry teams**: admit patients, assign doctors, plan each patient's meals and track every meal from the kitchen to the bedside.

**Live:** https://hospital-management-4qeu-4ad8fikhf-rajeshwar-singhs-projects.vercel.app

![React](https://img.shields.io/badge/React-18-149eca?style=flat-square&logo=react)
![Express](https://img.shields.io/badge/Express-4-000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47a248?style=flat-square&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

---

## Features

| Area | What you can do |
|---|---|
| **Dashboard** | Admitted patients, doctors, diet-plan coverage and staff availability at a glance; today's delivery pipeline; meals delivered over the last 7 days; patients per floor; recent activity; a "needs attention" list (e.g. patients with no diet plan). |
| **Patients** | Search, filter (admitted / discharged), paginate. Detail drawer with bed, doctor, allergies, current diet plan and recent deliveries. Admit, edit, **discharge** (closes the diet plan and cancels open deliveries). **Export to CSV.** One admitted patient per bed is enforced. |
| **Doctors** | Card grid with search and a specialization filter, availability, and how many admitted patients each doctor is looking after. Add, edit, remove. |
| **Diet plans** | Morning / evening / night meals per patient with ingredients and special instructions. Allergies are shown wherever meals are planned or delivered. A new plan automatically archives the old one. |
| **Meal deliveries** | Board view per day and meal: **Pending → Preparing → Out for delivery → Delivered** (or Cancelled), with a full timeline of who changed what and when. Duplicate deliveries for the same patient, meal and day are blocked. |
| **Pantry staff** | Shifts, clock in / out, open delivery counts. Status flips to *On delivery* and back to *Available* automatically as deliveries move. |
| **Accounts** | Sign-up with role selection, httpOnly cookie sessions with short-lived access tokens and silent refresh, role-based access on every API route. |

## Roles

| | Manager | Pantry team |
|---|:-:|:-:|
| View everything | ✅ | ✅ |
| Admit / edit / discharge patients, export CSV | ✅ | — |
| Add / edit / remove doctors | ✅ | — |
| Create / edit diet plans | ✅ | — |
| Manage pantry staff | ✅ (incl. remove) | ✅ |
| Assign and progress meal deliveries | ✅ | ✅ |

Which roles can self-register is controlled by `SIGNUP_ROLES` (default `Manager,Pantry`). For a real deployment set it to `Pantry` so new managers can't sign themselves up.

---

## Tech

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router 7, React Hook Form, lucide-react icons. Route-level code splitting.
- **Backend:** Express 4, Mongoose 8, Zod request validation, JWT access + rotating refresh tokens in httpOnly cookies, Helmet, rate-limited auth routes, Multer (in memory) + Cloudinary for images.
- **Tests:** Node's built-in test runner + Supertest against an in-memory MongoDB (`mongodb-memory-server`).
- **Hosting:** Vercel serves the frontend **and** the API (as a serverless function at `/api`), so there is one domain and no CORS setup.

```
├── api/index.js          # Vercel serverless entry → Server/app.js
├── src/                  # React app
│   ├── components/       # Design system (ui.jsx), layout, route guards
│   ├── context/          # Auth session
│   ├── hooks/            # Data fetching
│   ├── lib/              # API client, formatting
│   └── Pages/            # Dashboard, Patients, Doctors, DietPlans, Deliveries, Staff, auth pages
└── Server/
    ├── app.js            # Express app (security, CORS, health check, routing, errors)
    ├── index.js          # Local server entry
    ├── config/           # Environment + MongoDB connection (cached for serverless)
    ├── controllers/      # One file per resource
    ├── middleware/       # Auth/roles, validation, uploads, error handler
    ├── model/            # Mongoose schemas
    ├── router/           # REST routes
    ├── validators/       # Zod schemas
    ├── scripts/seed.js   # Demo data
    └── tests/            # API tests
```

---

## Running locally

Requires Node 18+ and a MongoDB database (Atlas free tier works).

```bash
npm install                       # frontend + shared deps
npm --prefix Server install       # API deps
cp Server/.env.example Server/.env   # then fill in MONGODB_URI and the two token secrets
npm run seed                      # optional: demo patients, doctors, plans and deliveries
npm run dev:api                   # API on http://localhost:8000
npm run dev                       # app on http://localhost:5173 (proxies /api to :8000)
```

After seeding, sign in as `manager@medicare.test` or `pantry@medicare.test` with password `Demo@1234` (override with `SEED_PASSWORD`).

```bash
npm run test:api                  # 15 API tests against an in-memory MongoDB
npm run lint
```

## Deploying to Vercel

The repo deploys as-is. In the Vercel project settings add these environment variables:

| Variable | Required | Notes |
|---|:-:|---|
| `MONGODB_URI` | ✅ | Atlas connection string. Allow Vercel's IPs (or `0.0.0.0/0`) in Atlas network access. |
| `ACCESS_TOKEN_SECRET` | ✅ | Long random string |
| `REFRESH_TOKEN_SECRET` | ✅ | A different long random string |
| `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY` | | Defaults `15m` / `7d` |
| `SIGNUP_ROLES` | | Defaults `Manager,Pantry` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | | Without them, photos are skipped |
| `VITE_API_URL` | | Only if the API is hosted somewhere else (then also set `CORS_ORIGIN` on the API) |

Check `/api/health` after deploying: it reports whether the database is connected.

---

## API

All routes are under `/api/v1` and return `{ success, statusCode, message, data }`. Errors return `{ success: false, statusCode, message, errors[] }`. List endpoints accept `?q=&page=&limit=&sort=` and return `{ items, page, limit, total, pages }`.

| Method | Path | Who |
|---|---|---|
| GET | `/auth/signup-options` | public |
| POST | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | public |
| GET | `/auth/me` | signed in |
| GET | `/dashboard` | signed in |
| GET | `/patients` (`status`, `floor`), `/patients/:id` | signed in |
| GET | `/patients/export` (CSV) | manager |
| POST / PATCH | `/patients`, `/patients/:id` | manager |
| POST | `/patients/:id/discharge` | manager |
| GET | `/doctors` (`specialization`), `/doctors/specializations` | signed in |
| POST / PATCH / DELETE | `/doctors`, `/doctors/:id` | manager |
| GET | `/diet-plans` (`patient`, `active=true\|false\|all`) | signed in |
| POST / PATCH | `/diet-plans`, `/diet-plans/:id` | manager |
| GET / POST / PATCH | `/staff`, `/staff/:id` | signed in |
| DELETE | `/staff/:id` | manager |
| GET | `/deliveries` (`date`, `status`, `mealSlot`, `staff`) | signed in |
| POST | `/deliveries` | signed in |
| PATCH | `/deliveries/:id/status` | signed in |
| GET | `/api/health` | public |

---

## Author

**Rajeshwar Singh** · [GitHub @Raj4478](https://github.com/Raj4478) · [LinkedIn](https://www.linkedin.com/in/rajeshwar-singh-b77075271)
