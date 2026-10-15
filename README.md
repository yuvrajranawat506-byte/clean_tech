# EcoTrack — Smart Waste Management & Recycling Platform

> **College Cleantech Startup Project** | Full-Stack Web Application

A complete, functional waste management platform built with React, Node.js, Express, and MySQL.

---

## 🌿 Features

| Feature | Status |
|---|---|
| User registration & login (JWT) | ✅ Implemented |
| Role-based access (User / Admin) | ✅ Implemented |
| Schedule waste pickups | ✅ Implemented |
| My Pickups with search/filter | ✅ Implemented |
| Admin approve/reject/collect pickups | ✅ Implemented |
| Reward points system (demo) | ✅ Implemented |
| Environmental impact charts | ✅ Implemented |
| User profile management | ✅ Implemented |
| MySQL database with transactions | ✅ Implemented |
| Input validation (frontend + backend) | ✅ Implemented |
| Secure password hashing (bcrypt) | ✅ Implemented |
| Duplicate reward prevention | ✅ Implemented |
| Rate limiting on login | ✅ Implemented |
| Pagination on all lists | ✅ Implemented |

---

## 🚀 Quick Start (Windows)

### Prerequisites
- [Node.js 18+](https://nodejs.org/) (includes npm)
- [MySQL 8.0+](https://dev.mysql.com/downloads/mysql/)

---

### Step 1 — Set Up the Database

Open MySQL command line or MySQL Workbench:

```sql
-- Run schema first
source Y:/clean_tech/database/schema.sql;

-- Then seed demo data
source Y:/clean_tech/database/seed.sql;
```

Or from PowerShell:
```powershell
mysql -u root -p < Y:\clean_tech\database\schema.sql
mysql -u root -p < Y:\clean_tech\database\seed.sql
```

---

### Step 2 — Configure Backend

```powershell
cd Y:\clean_tech\backend

# Copy the example env file
copy .env.example .env
```

Open `.env` and set your MySQL password:
```
DB_PASSWORD=your_actual_mysql_password
```

**Important:** The JWT_SECRET is already set to a demo value. Change it for any real deployment.

---

### Step 3 — Install & Start Backend

```powershell
cd Y:\clean_tech\backend
npm install
npm run dev
```

Expected output:
```
✅ MySQL database connected successfully
🚀 EcoTrack API running on http://localhost:5000
```

---

### Step 4 — Install & Start Frontend

Open a **new terminal**:

```powershell
cd Y:\clean_tech\frontend
npm install
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 5 — Open in Browser

Navigate to: **http://localhost:5173**

---

## 🔑 Demo Accounts

> **IMPORTANT:** These are for local demo/testing only. Never use in production!

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ecotrack.dev | `password` |
| **User** | rahul@demo.dev | `password` |
| **User** | priya@demo.dev | `password` |

> The seed.sql uses the bcrypt hash of `"password"`. Use the demo login buttons on the login page for convenience.

---

## 🧪 Running Tests

```powershell
cd Y:\clean_tech\backend
# Make sure the database is running and .env is configured
npm test
```

Tests cover:
- Registration & login (valid/invalid)
- Duplicate email rejection
- Token-protected routes
- Pickup creation, validation, cancellation
- Admin-only access control
- Dashboard data correctness

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Create new user account |
| POST | /api/auth/login | ❌ | Login and receive JWT token |
| POST | /api/auth/logout | ✅ | Logout (stateless — client clears token) |
| GET | /api/auth/me | ✅ | Get current user info |

### Pickups (User)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/pickups | ✅ | Create a pickup request |
| GET | /api/pickups/my | ✅ | Get own pickups (filterable) |
| GET | /api/pickups/:id | ✅ | Get single pickup (own only) |
| PATCH | /api/pickups/:id/cancel | ✅ | Cancel own pending pickup |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/dashboard/user | ✅ | User's personal stats |
| GET | /api/dashboard/admin | ✅ Admin | System-wide stats |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/pickups | ✅ Admin | All pickups with filters |
| PATCH | /api/admin/pickups/:id/status | ✅ Admin | Update pickup status |
| GET | /api/admin/users | ✅ Admin | All registered users |

### Rewards & Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/rewards/my | ✅ | Get own reward points |
| PATCH | /api/users/profile | ✅ | Update profile info |
| PATCH | /api/users/password | ✅ | Change password |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | ❌ | Server health check |

---

## 🗄️ Database Relationships

```
users (1) ──< pickups (many)
  id              user_id (FK)

users (1) ──< rewards (many)
  id              user_id (FK)

pickups (1) ──< rewards (0 or 1)
  id               pickup_id (FK, UNIQUE)
```

- The **UNIQUE constraint** on `rewards.pickup_id` prevents duplicate reward credits when a pickup is marked collected.
- **Database transactions** are used when updating pickup status AND inserting rewards simultaneously.

---

## 🏆 Rewards System (Demo)

Points are awarded automatically when an admin marks a pickup as **collected**:

| Waste Type | Points per kg |
|------------|--------------|
| Wet Waste | 10 pts/kg |
| Dry Waste | 10 pts/kg |
| Plastic | 10 pts/kg |
| E-Waste | 20 pts/kg |

> ⚠️ **Demo Feature**: Reward points and vouchers have no real monetary value. They are for demonstration purposes only.

---

## 🌍 Environmental Impact (Demo)

CO₂ savings are calculated using rough conversion factors:
- Wet Waste: 0.5 kg CO₂ per kg
- Dry Waste: 1.2 kg CO₂ per kg
- Plastic: 2.0 kg CO₂ per kg
- E-Waste: 3.0 kg CO₂ per kg

> ⚠️ These are simplified estimates for educational demonstration. Real calculations require certified lifecycle analysis.

---

## 📂 Project Structure

```
clean_tech/
├── database/
│   ├── schema.sql          # MySQL table definitions
│   └── seed.sql            # Demo data (admin, users, pickups)
├── backend/
│   ├── config/
│   │   └── db.js           # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pickupsController.js
│   │   ├── dashboardController.js
│   │   ├── rewardsController.js
│   │   ├── adminController.js
│   │   └── usersController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── admin.js        # Admin role check
│   │   └── errorHandler.js # Centralized error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pickups.js
│   │   ├── dashboard.js
│   │   ├── rewards.js
│   │   ├── admin.js
│   │   └── users.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── pickups.test.js
│   ├── server.js           # Express app entry point
│   ├── .env.example        # Environment template
│   └── package.json
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── components/
        │   ├── Sidebar.jsx
        │   └── ProtectedRoute.jsx
        ├── layouts/
        │   └── AppLayout.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── SchedulePickup.jsx
        │   ├── MyPickups.jsx
        │   ├── Rewards.jsx
        │   ├── Impact.jsx
        │   ├── Profile.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminPickups.jsx
        │       └── AdminUsers.jsx
        ├── services/
        │   └── api.js       # Axios instance + all API calls
        ├── utils/
        │   └── helpers.js
        └── styles/
            └── global.css
```

---

## 🎓 College Viva Q&A

**Q: Why JWT and not sessions?**
A: JWTs are stateless — no server-side session storage needed. They scale horizontally. For extra security, short expiry + refresh tokens can be added.

**Q: How do you prevent duplicate reward points?**
A: The `rewards` table has a UNIQUE constraint on `pickup_id`. If an admin accidentally clicks "Mark Collected" twice, the second INSERT is rejected silently.

**Q: What is the purpose of database transactions?**
A: When marking a pickup as collected, we update the status AND insert a reward in one atomic operation. If one fails, both roll back.

**Q: Why parameterized queries?**
A: They prevent SQL injection by separating SQL code from user data. E.g., `pool.query('SELECT * FROM users WHERE email = ?', [email])` — the `?` placeholder prevents malicious SQL.

**Q: How is the admin account created safely?**
A: Only through the seed.sql file (dev/demo only). The registration API always sets `role = 'user'`. Admins cannot be created through the public API.

---

## 🚀 Future Enhancements

- [ ] Real-time notifications (Socket.IO)
- [ ] SMS/email notifications
- [ ] Mobile app (React Native)
- [ ] Payment gateway for premium features
- [ ] GPS tracking for pickup vehicles
- [ ] QR code for pickup verification
- [ ] Analytics export (CSV/PDF)
- [ ] Recycler marketplace

---

## ⚠️ Security Notes for Production

1. Change `JWT_SECRET` to a long random string
2. Change all demo passwords
3. Enable HTTPS
4. Use a managed database (not local MySQL)
5. Remove demo seed data
6. Add production rate limiting
7. Enable MySQL SSL
8. Set `NODE_ENV=production`
