<div align="center">

# ⚡ FitTrack — Personal Fitness Operating System

### *Next-Gen Full-Stack Personal Health & Fitness Command Center*

[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.4.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java_17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger_OpenAPI_3-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui/index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

> **FitTrack** is not a simple CRUD project. It is an intelligent, reactive, gym-friendly **Operating System** designed to centralize nutrition, macros, workout splits, live gym tracking with rest timers, hydration, sleep recovery, body progress, analytics, and personal data exports.

[Key Features](#-key-capabilities--features) • [Tech Stack](#-technology-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-endpoints-reference) • [Author](#-author)

---

</div>

<br/>

## 🎯 Executive Overview

FitTrack answers one core question the moment you log in:

### **"What should I do today?"**

It unifies disparate fitness routines into a coordinated daily game plan:
* 🏋️ **Today's Workout routine** synchronized with your custom weekly split
* 💧 **Hydration deficit meter** with smart reminders that stop when you hit your target
* 🥗 **Dynamic Macronutrient targets** with separate tracking for added sugar vs. natural sugars
* 😴 **Overnight sleep recovery scoring** with midnight crossover resolution
* 📋 **Dynamic Action Checklist** outlining the exact next 4 steps to achieve peak compliance

---

## 🌟 Key Capabilities & Features

### 1. 🤖 Smart Daily Fitness Assistant
* **Hero Overview Card**: Real-time snapshot of workout focus, water consumption, protein gap, calorie balance, and sleep.
* **Next Action Engine**: Generates up to 4 contextual, non-shaming nudges (e.g., *"Drink 500ml water"*, *"Log today's workout"*, *"Complete 35g remaining protein"*).
* **Neutral Smart Alerts**: Informative alerts for high added sugar, low hydration, and missing logs without guilt-inducing or fear-based language.

### 2. 🍛 Comprehensive Nutrition & Indian Food Database
* **Authentic Indian Foods Seeded**: Initial library includes *Utpam / Chawal ki Roti, Chhole Bhature, Paneer, Chana ki Sabji, Paratha, Aloo ki Sabji, Besan ka Kofta, Dal Makhni, Chane ki Dal, Kheer-Puri, Rajma ki Sabji, Mix-Veg Sabji, and Rayta*.
* **Extensible Categorization**: Filter by Indian Food, Breakfast, Rice, Dal/Pulses, Dairy, Eggs, Chicken, Fast Food, Snacks, Desserts, and Supplements.
* **Granular Micronutrients**: Standardized per 100g/ml benchmark with automated custom gram/portion scaling:
  * Calories, Protein, Carbohydrates, Fat, Fiber
  * Total Sugar vs. **Added Sugar** (distinct warning threshold)
  * Sodium, Cholesterol, Saturated Fat, Calcium, Iron, Vitamin D, Vitamin B12
* **Custom Foods & Favorites**: Create private homemade recipes; star favorite foods for rapid re-entry.
* **Meal Templates**: Save frequent meals (e.g., *"Post-Workout Shake & Oats"*) and re-log them with 1 click.

### 3. 🏋️ Workouts, PRs & Live Gym Mode
* **Customizable Weekly Split**: Tailor routines from Monday to Sunday (Push / Pull / Legs / Upper / Lower / Rest).
* **Live Gym Mode**: High-contrast, mobile-first touch logger with large steppers for weight and reps inside a loud, busy gym.
* **Interactive Rest Timer**: 30s, 60s, 90s, 120s presets + custom duration with Play, Pause, Skip (+30s), and Reset controls.
* **Automated 1RM Personal Records**: Calculates and badges all-time PRs using the proven Epley formula:
  $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$

### 4. 💧 Hydration Engine & Context-Aware Reminders
* One-click logging buttons (`+250ml`, `+500ml`, `+750ml`, `+1000ml`).
* Smart reminders adjust dynamically to your remaining window and automatically silence once target is achieved.

### 5. 🔔 Notification & Reminder Center
* Centralized hub across 6 categories: `HYDRATION`, `WORKOUT`, `NUTRITION`, `GOAL`, `SLEEP`, `SYSTEM`.
* Real-time unread badge counter with 1-click *"Mark All As Read"*.
* User-managed scheduled daily alerts with toggle switches.

### 6. 🌙 Sleep & Recovery Engine
* **Midnight Crossover Calculation**: Computes overnight sleep crossing midnight (e.g., 11:00 PM to 7:00 AM = 8.0 hours) without negative duration errors.
* Sleep quality scoring and 7-day recovery trend tracking.

### 7. 🎯 Direction-Aware Goal Progress
* Accurately tracks progress using baseline starting values:
  $$\text{Progress} = \frac{|\text{Current} - \text{Start}|}{|\text{Target} - \text{Start}|} \times 100\%$$
* Supports Weight Loss, Muscle Gain, Protein Targets, Water Goals, and Workout Frequency.

### 8. 📊 Analytics, Activity Calendar & 1-Click Export
* **Interactive Recharts Trends**: 7-day, 14-day, and 30-day graphs for Calories, Protein, Hydration, and Sleep.
* **Monthly Activity Calendar**: Heatmap with daily status indicators for workouts, meals, water, and sleep.
* **1-Click Data Portability**: Complete export of all personal health records in both **JSON** and **CSV** formats.

---

## 🔒 Security Architecture & Data Isolation

```
       [ Client Request ]
               │
               ▼
      [ JwtAuthFilter ] ─── Validates JWT & Sets SecurityContext
               │
               ▼
     [ REST Controllers ] ─── NEVER exposes JPA Entities directly
               │
               ▼
      [ Service Layer ] ─── Scopes query to Authenticated User ID
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ Workout Session ]  [ Diet / Water / Sleep ]
   │
   ▼ (Validates Session belongs to User)
[ Workout Exercise ]
   │
   ▼ (Validates Set belongs to Exercise & Session)
[ Workout Set ]
```

* **Strict User Isolation**: Every database query is resolved via `SecurityContextHolder.getContext().getAuthentication()`. IDOR (Insecure Direct Object Reference) attacks are strictly prevented.
* **Workout Set Ownership Chain**: Deep verification guarantees User A cannot modify or delete User B's sets by guessing a set ID.
* **DTO Security**: All controller endpoints return dedicated response DTOs. Password hashes, internal relations, and Hibernate proxy references are never exposed.
* **JWT Refresh Rotation**: 24-hour access tokens paired with 30-day refresh tokens stored in database with instant revocation upon logout.
* **Zero Hardcoded Secrets**: Fully configurable via environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, etc.).

---

## 🛠 Technology Stack

### Frontend Architecture
| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **React 18** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) | Reactive Single-Page Application (SPA) |
| **Vite 5** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Sub-second HMR bundler and build system |
| **Recharts** | ![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat-square&logo=chartdotjs&logoColor=white) | Composable SVG trend and macro charts |
| **React Icons** | ![Icons](https://img.shields.io/badge/Feather_Icons-000000?style=flat-square&logo=feather&logoColor=white) | Clean, lightweight modern icons |
| **React Hot Toast** | ![Toast](https://img.shields.io/badge/Toast-ff69b4?style=flat-square&logo=coffeescript&logoColor=white) | Sleek, non-intrusive micro-notifications |
| **Vanilla CSS3** | ![CSS3](https://img.shields.io/badge/CSS3_Glassmorphism-1572B6?style=flat-square&logo=css3&logoColor=white) | Custom design system with dark glass aesthetic |

### Backend Architecture
| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **Java 17+** | ![Java](https://img.shields.io/badge/Java_17+_/_26-ED8B00?style=flat-square&logo=openjdk&logoColor=white) | Core server language |
| **Spring Boot 3.4.3** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white) | Enterprise REST API and application container |
| **Spring Security 6** | ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white) | Stateless JWT filter chain & authorization |
| **Spring Data JPA** | ![Hibernate](https://img.shields.io/badge/Hibernate_ORM-59666C?style=flat-square&logo=hibernate&logoColor=white) | Database persistence & ORM mapping |
| **MySQL 8.0** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) | Relational database engine |
| **Swagger / OpenAPI 3** | ![Swagger](https://img.shields.io/badge/OpenAPI_3.0-85EA2D?style=flat-square&logo=swagger&logoColor=black) | Interactive API documentation UI |

---

## 📁 Repository Structure

```text
FitTrack/
├── backend/
│   ├── pom.xml                                   # Maven dependencies & plugins
│   ├── src/main/java/com/fittrack/
│   │   ├── config/                               # Security, Swagger, CORS & Seeders
│   │   ├── controller/                           # REST Controllers (100% Response DTOs)
│   │   ├── dto/                                  # Strongly typed Request & Response DTOs
│   │   ├── entity/                               # JPA Entities with lifecycle hooks
│   │   ├── exception/                            # Global exception handling & API envelopes
│   │   ├── repository/                           # Spring Data JPA Repositories
│   │   ├── security/                             # JWT Filter, Token Provider & UserDetails
│   │   ├── service/                              # Core Business Logic & Rule Engines
│   │   └── utils/                                # Calculations, Formulas & SecurityContext
│   └── src/main/resources/
│       ├── application.properties                # Env-injected configuration
│       └── db/seed_data.sql                      # Comprehensive Indian food seed dataset
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/                           # Layout, Sidebar, Header, Modals
        ├── context/                              # AuthContext with token rotation
        ├── pages/                                # Dashboard, Diet, Workout, Analytics, etc.
        └── services/                             # Axios client with 401 refresh queue
```

---

## 🚀 Getting Started

### Prerequisites
* **Java**: JDK 17 or higher (`java -version`)
* **Node.js**: v18 or higher (`node -v`)
* **MySQL**: 8.0 running locally on port 3306
* **Maven**: 3.9+ (or system wrapper)

### 1. Database Initialization
Start your local MySQL service and create the database:
```sql
CREATE DATABASE IF NOT EXISTS fittrack_db;
```

### 2. Environment Variables
You can customize the following variables (or run with defaults):
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/fittrack_db?createDatabaseIfNotExist=true` |
| `DB_USERNAME` | Database User | `root` |
| `DB_PASSWORD` | Database Password | `Satyam1` |
| `JWT_SECRET` | Secret key for signing HMAC-SHA512 tokens | *Pre-configured secure secret* |
| `JWT_ACCESS_EXPIRATION` | Access token lifespan (ms) | `86400000` (24 Hours) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifespan (ms) | `2592000000` (30 Days) |

### 3. Backend Setup
```bash
cd backend
mvn spring-boot:run
```
* **API Base URL**: `http://localhost:8080/api`
* **Swagger UI Documentation**: [`http://localhost:8080/swagger-ui/index.html`](http://localhost:8080/swagger-ui/index.html)
* **OpenAPI Specification**: `http://localhost:8080/v3/api-docs`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* **Application URL**: [`http://localhost:5173`](http://localhost:5173)
* **Default Demo User**: `satya@fittrack.com` / `Test@1234`

---

## 🧪 Automated Testing

FitTrack has 100% passing test coverage across critical calculation and security layers:

```bash
cd backend
mvn test
```

```text
[INFO] Results:
[INFO] 
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```

* ✅ **`SleepDurationUnitTest`**: Validates overnight midnight crossover calculation (e.g. 23:00 to 07:00 = 8.0h).
* ✅ **`GoalProgressUnitTest`**: Validates direction-aware progress relative to starting baselines (weight loss vs muscle gain).
* ✅ **`NutritionCalculationUnitTest`**: Validates 100g/ml proportional scaling, pieces/servings, and separate added sugar tracking.
* ✅ **`SecurityAuthorizationTest`**: Validates strict user data isolation and confirms User A cannot access or delete User B's workout sets or sessions.

---

## 📑 API Endpoints Reference

<details>
<summary><b>🔐 Authentication & Sessions</b></summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and obtain Access + Refresh tokens |
| `POST` | `/api/auth/refresh` | Rotate access token using valid refresh token |
| `POST` | `/api/auth/logout` | Revoke refresh token and invalidate session |
| `GET` | `/api/auth/health` | Health check endpoint |

</details>

<details>
<summary><b>👤 Profile & Targets</b></summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profile` | Retrieve current user profile and calculated BMR/TDEE |
| `PUT` | `/api/profile` | Update physical metrics, activity level, and timezone |
| `PUT` | `/api/profile/targets` | Manually override calories, macros, water, and sugar limits |
| `POST` | `/api/profile/targets/recalculate` | Reset targets based on Mifflin-St Jeor formula |

</details>

<details>
<summary><b>🥗 Nutrition & Meals</b></summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/foods` | Search foods with name & category filters |
| `POST` | `/api/foods/custom` | Create private user custom food |
| `GET` | `/api/foods/favorites` | Fetch user favorite foods |
| `POST` | `/api/foods/{id}/favorite` | Toggle favorite star on a food |
| `GET` | `/api/meals?date=YYYY-MM-DD` | Get meals and logged food items for a date |
| `POST` | `/api/meals` | Start a meal (Breakfast, Lunch, Dinner, Snack, etc.) |
| `POST` | `/api/meals/{mealId}/items` | Add food item with gram/portion scaling |
| `DELETE` | `/api/meals/{mealId}/items/{itemId}` | Remove food item |
| `GET` | `/api/meals/templates` | Retrieve reusable meal templates |
| `POST` | `/api/meals/templates` | Save a meal as a reusable template |
| `POST` | `/api/meals/templates/{id}/apply` | 1-click re-log meal template to today |

</details>

<details>
<summary><b>🏋️ Workouts & Live Gym Mode</b></summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workouts/schedule` | Retrieve customizable weekly workout schedule |
| `PUT` | `/api/workouts/schedule` | Save Monday–Sunday routine split |
| `GET` | `/api/workouts/date` | Get workout sessions for date |
| `POST` | `/api/workouts` | Start a workout session |
| `POST` | `/api/workouts/{id}/sets` | Log a set (weight, reps, rest seconds) with PR detection |
| `DELETE` | `/api/workouts/{id}/sets/{setId}` | Securely delete set with ownership validation |
| `GET` | `/api/exercises` | Search global exercises catalog |

</details>

<details>
<summary><b>💧 Hydration & Reminders</b></summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/water?date=YYYY-MM-DD` | Get water logs & daily total |
| `POST` | `/api/water` | Quick log water intake (ml) |
| `GET` | `/api/reminders` | Retrieve scheduled daily reminders |
| `POST` | `/api/reminders` | Create custom reminder |
| `PATCH` | `/api/reminders/{id}/toggle` | Enable or mute reminder |

</details>

<details>
<summary><b>📊 Analytics, Calendar & Export</b></summary>

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard?date=YYYY-MM-DD` | Dynamic "What Should I Do Today?" plan |
| `GET` | `/api/analytics?days=30` | Aggregated trends for macros, water, and sleep |
| `GET` | `/api/calendar?month=YYYY-MM` | Monthly heatmap with daily status indicators |
| `GET` | `/api/export/json` | Download complete personal health history in JSON |
| `GET` | `/api/export/csv` | Download complete personal health history in CSV |

</details>

---

## 🛡️ Medical & Fitness Disclaimer

FitTrack is an informational fitness tracking, scheduling, and planning operating system. Calculated targets (BMR, TDEE, macronutrient recommendations) are statistical estimates derived from recognized formulas (such as Mifflin-St Jeor). They do not constitute medical diagnoses, prescriptions, or clinical advice. Always consult a certified healthcare professional before making major athletic or dietary changes.

---

## 📄 License

This project is licensed under the **MIT License** — free for personal, academic, and portfolio use.

---

<div align="center">

###  Crafted with ❤️ and ☕ by **[Satya Dubey](https://github.com/satyamdubey845455-source)**

*Empowering healthier, stronger lifestyles through modern engineering.*

⭐ **If you find FitTrack helpful, please star the repository!** ⭐

</div>
