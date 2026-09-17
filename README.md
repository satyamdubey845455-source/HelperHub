# 🛠️ Helper Hub

A full-stack web application that connects **customers** with skilled **service helpers** (electricians, plumbers, cleaners, carpenters, etc.) — enabling seamless service discovery, booking, and management.

---

## 📸 Screenshots

| Landing Page | Dashboard |
|---|---|
| Browse helpers by service & location | Manage bookings as customer or helper |

---

## ✨ Features

### 👤 For Customers
- Register & log in securely
- Browse helpers filtered by **service type** and **location**
- View helper profiles (rating, experience, hourly rate, bio)
- **Book a helper** with a preferred date, time, and notes
- Track & manage booking status (pending → accepted/rejected/completed)
- Cancel bookings

### 🔧 For Helpers
- Register with a service profile (type, experience, hourly rate, location, bio)
- View all incoming booking requests
- **Accept**, **reject**, or **complete** bookings
- Update their profile information

### 🔒 Auth & Security
- Session-based authentication via Flask
- Passwords hashed with SHA-256 + random salt
- Role-based access control (customer vs. helper)

---

## 🗂️ Project Structure

```
helper-hub/
├── app.py                  # Flask backend — routes & business logic
├── patch_db.py             # One-time DB schema migration script
├── requirements.txt        # Python dependencies
├── database.db             # SQLite database (auto-created on first run)
├── REPORT.md               # Project report
├── static/
│   ├── index.html          # Landing / homepage
│   ├── login.html          # Login & registration page
│   ├── dashboard.html      # User dashboard (bookings management)
│   ├── css/
│   │   ├── style.css       # Global styles
│   │   └── dashboard.css   # Dashboard-specific styles
│   └── js/
│       ├── main.js         # Landing page logic (helper listing, booking)
│       ├── auth.js         # Login / register logic
│       └── dashboard.js    # Dashboard logic (bookings, profile)
└── Project_SRS/
    └── main.tex            # Software Requirements Specification (LaTeX)
```

---

## 🗄️ Database Schema

The app uses **SQLite** with three tables:

| Table | Description |
|---|---|
| `users` | All registered users (customers & helpers) |
| `helpers` | Helper-specific profile data linked to a user |
| `bookings` | Service bookings between customers and helpers |

**Booking statuses:** `pending` → `accepted` / `rejected` / `completed` / `cancelled`

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/satyamdubey845455-source/helper-hub.git
cd helper-hub
```

### 2. Create and activate a virtual environment

```bash
# Create venv
python -m venv .venv

# Activate — Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate — macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the application

```bash
python app.py
```

The app will start at **http://127.0.0.1:5000**

> The database (`database.db`) is created automatically on first run and seeded with **4 demo helper accounts**.

---

## 🔌 API Reference

All endpoints are prefixed with `/api/`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (customer or helper) |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/logout` | Log out |
| `GET` | `/api/auth/me` | Get current logged-in user info |

### Helpers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/helpers` | List helpers (filterable by `?service=` & `?location=`) |
| `PUT` | `/api/helpers/profile` | Update helper's own profile |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create a new booking (customers only) |
| `GET` | `/api/bookings` | Get bookings for the logged-in user |
| `PATCH` | `/api/bookings/<id>` | Update booking status |

---

## 🧪 Demo Accounts

The database is seeded with these helper accounts on first run (password: `password123`):

| Name | Service | Location |
|---|---|---|
| Rahul Sharma | Electrician | Delhi |
| Amit Kumar | Plumber | Mumbai |
| Priya Verma | Cleaner | Bangalore |
| Rohan Das | Carpenter | Delhi |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, Flask |
| **Database** | SQLite (via `sqlite3`) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Auth** | Flask sessions + SHA-256 password hashing |

---

## 📝 Notes

- `patch_db.py` was a one-time migration script used to add `cancelled` to the bookings status constraint. It does not need to be re-run if you start fresh.
- The `secret_key` in `app.py` should be replaced with a strong random value in production. Consider loading it from an environment variable:
  ```python
  app.secret_key = os.environ.get('SECRET_KEY', 'fallback-dev-key')
  ```
- For production deployments, use a WSGI server (e.g., **Gunicorn**) instead of Flask's built-in dev server.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

> Built with ❤️ by [satyamdubey845455](https://github.com/satyamdubey845455-source)
