# MediCare HMS 🏥

A modern, full-stack Hospital Management System built with React + Node.js. Manage patients, doctors, diet plans, and meal deliveries from a clean, role-based dashboard.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Upload-blue?style=flat-square)

---

## ✨ Features

**Manager Role**
- Dashboard with live stats (patients, doctors, diet plans, deliveries)
- Register and view patients with full medical details
- Register and manage doctors with specializations
- Create and manage patient diet plans (morning, evening, night meals)
- Assign meal deliveries to pantry staff and mark them complete

**Pantry Staff Role**
- View all active patients and their diet plans
- Manage delivery assignments and update delivery status

**Both Roles**
- Secure JWT-based login with role-based routing
- Image uploads via Cloudinary (patient photos, doctor photos, meal images)
- Fully responsive — works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v7 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Image Upload | Multer + Cloudinary |
| Deployment | Vercel (frontend) / Railway or Render (backend) |

---

## 📁 Project Structure

```
Hospital_Management/
├── Client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Login.jsx          # Split-panel login page
│   │   │   ├── Signup.jsx         # Registration page
│   │   │   ├── Sidebar.jsx        # Responsive sidebar + mobile drawer
│   │   │   ├── Manager.jsx        # Manager dashboard
│   │   │   ├── Pantry.jsx         # Pantry dashboard
│   │   │   ├── PatientFetch.jsx   # Patients table with search
│   │   │   ├── DoctorsPage.jsx    # Doctors grid
│   │   │   ├── FoodChart.jsx      # Diet plans view
│   │   │   ├── DeliverMeals.jsx   # Delivery assignment
│   │   │   ├── CreateNewPatient.jsx
│   │   │   ├── CreateDoctor.jsx
│   │   │   ├── CreateFoodChart.jsx
│   │   │   └── CreatePantryPersonal.jsx
│   │   ├── App.jsx                # Router setup
│   │   └── index.css              # Global styles + design tokens
│   └── package.json
│
└── Server/                    # Express backend
    ├── controllers/
    │   └── user.controller.js     # All business logic
    ├── model/
    │   └── user.model.js          # Mongoose schemas (User, Patient, Doctor, FoodChart, PantryStaff, Delivery)
    ├── router/
    │   └── user.router.js         # API routes
    ├── middleware/
    │   ├── auth.middleware.js      # JWT verification
    │   └── multer.middleware.js    # File upload handling
    ├── utils/
    │   ├── ApiError.js            # Consistent error responses
    │   ├── ApiResponse.js         # Consistent success responses
    │   ├── asyncHandler.js        # Async error wrapper
    │   └── cloudinary.js         # Image upload utility
    ├── app.js                     # Express app setup
    └── index.js                   # DB connection + server start
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/Raj4478/Hospital_Management.git
cd Hospital_Management
```

### 2. Configure environment variables

Create a `.env` file in the **root** directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install and run the backend

```bash
cd Server
npm install
npm run dev
# Runs on http://localhost:8000
```

### 4. Install and run the frontend

```bash
cd Client
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/register` | Register new user |
| POST | `/api/v1/user/login` | Login (returns JWT) |
| POST | `/api/v1/user/logout` | Logout |

### Patients
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/patientdetail` | Register patient |
| GET | `/api/v1/user/patientdata` | Get all patients |
| POST | `/api/v1/user/particularpatient` | Get patient by ID |

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/registerdoctor` | Register doctor |
| GET | `/api/v1/user/getalldoctors` | Get all doctors |
| PATCH | `/api/v1/user/updatedoctor/:doctorId` | Update doctor |

### Diet / Food Chart
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/menu` | Create diet plan |
| GET | `/api/v1/user/menu` | Get all diet plans |
| PATCH | `/api/v1/user/updatemenu/:menuId` | Update diet plan |

### Pantry & Delivery
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/user/pantrypersonal` | Add pantry staff |
| GET | `/api/v1/user/pantrydetail` | Get all staff |
| PATCH | `/api/v1/user/updatestaff` | Update staff status |
| POST | `/api/v1/user/assigndelivery` | Assign delivery |
| GET | `/api/v1/user/delivery` | Get all deliveries |
| POST | `/api/v1/user/deleteObject` | Mark delivery done |

---

## 👤 Roles & Access

| Role | Access |
|---|---|
| **Manager** | Full access — patients, doctors, diet plans, deliveries, all create forms |
| **Pantry** | Patients, diet plans, delivery assignment, pantry staff management |

Set the role during registration. Login routes to the correct dashboard automatically.

---

## 📱 Mobile Support

Fully responsive across all screen sizes:
- **Desktop** — persistent sidebar navigation
- **Mobile** — hamburger menu with slide-in drawer
- Touch-friendly tap targets on all interactive elements
- iOS input zoom prevention

---

## 🐛 Bug Fixes (v2.0)

The following critical bugs were fixed in the latest version:

- `FoodChart` model was missing `mongoose.Schema()` wrapper — all food chart creates silently failed
- MongoDB URI used `\\Hospital` (escape sequence) instead of `/Hospital`
- `ApiError` used `StatusCode` (capital S) — Express requires `statusCode` (lowercase)
- Server crashed when image not provided in `registerUser`, `foodChartMenu`, `pantrypersonal` — null checks added
- Credentials logged to console in `cloudinary.js` — removed
- `eveningIngrediends` typo fixed consistently across model and controller

---

## 👨‍💻 Author

**Rajeshwar Singh**
- GitHub: [@Raj4478](https://github.com/Raj4478)
- LinkedIn: [Rajeshwar Singh](https://www.linkedin.com/in/rajeshwar-singh-b77075271)

---

⭐ Star this repo if you found it useful!
