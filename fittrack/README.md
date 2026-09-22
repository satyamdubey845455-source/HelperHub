# FitTrack — Personal Fitness Operating System

A secure, production-grade, full-stack **Personal Fitness Operating System** built with **Spring Boot 3.4**, **React 18 / Vite 5**, and **MySQL 8**.

FitTrack is designed not as a generic CRUD application, but as an intelligent, responsive, gym-friendly fitness assistant. It centralizes your nutrition, macro targets, separate added sugar tracking, customizable workout splits, live gym workout mode with rest timers, hydration reminders, overnight sleep tracking, body progress, analytics, interactive calendar, and personal data exports.

---

## 🌟 Key Capabilities & Features

### 1. Smart Daily Fitness Assistant ("What Should I Do Today?")
- Dynamic daily assistant hero card summarizing:
  - Scheduled workout routine for today
  - Hydration progress & remaining water deficit
  - Protein consumed vs. target
  - Calories consumed vs. daily target
  - Overnight sleep recovery
  - Active goal alignment
  - **Next 4 concrete actions** to hit your daily targets
- Smart, neutral, non-shaming alerts (e.g. Added Sugar warnings, hydration deficit, protein gaps).

### 2. Comprehensive Nutrition & Indian Food Database
- Seeded with authentic Indian foods and breakfast staples:
  - *Utpam / Chawal ki Roti, Chhole Bhature, Paneer, Chana ki Sabji, Paratha, Aloo ki Sabji, Besan ka Kofta, Dal Makhni, Chane ki Dal, Kheer-Puri, Rajma ki Sabji, Mix-Veg Sabji, Rayta*.
- Categorized food library (Indian Food, Breakfast, Rice, Roti/Bread, Dal/Pulses, Vegetables, Fruits, Dairy, Paneer, Eggs, Chicken, Fish, Snacks, Beverages, Desserts, Supplements).
- Nutritional model per standard 100g/ml and custom serving units (pieces, scoops, bowls):
  - Calories, Protein, Carbohydrates, Fat, Fiber, Total Sugar, **Added Sugar**, Sodium, Cholesterol, Saturated Fat, Calcium, Iron, Vitamin D, Vitamin B12.
- **Added Sugar Monitor**: Separate tracking of added sugar from natural sugars with neutral threshold alerts (e.g. 25g limit).
- **User Custom Foods**: Privately scoped food creation for homemade recipes.
- **Favorites & Meal Templates**: Star favorite foods and save recurring meals (e.g., "My High Protein Breakfast") to log with 1 click.

### 3. Workouts, PRs & Live Gym Mode
- **Customizable Weekly Split**: Configure Monday through Sunday routines (e.g. Push, Pull, Legs, Shoulders, Rest Day).
- **Live Workout Mode**: High-contrast, touch-friendly gym logger with quick weight (+/- 2.5kg) and rep (+/- 1) steppers.
- **Configurable Rest Timer**: 30s, 60s, 90s, 120s presets + custom seconds with Play, Pause, Skip (+30s), and Restart controls.
- **Personal Records (PRs)**: Automated PR detection using the Epley 1RM formula ($1RM = w \times (1 + r/30)$).

### 4. Hydration Engine & Smart Reminders
- Daily water intake tracking with quick logging (+250ml, +500ml, +750ml, +1000ml).
- Context-aware hydration reminders that stop once the daily target is met.

### 5. Centralized Notification & Reminder Center
- 6 Notification categories: `HYDRATION`, `WORKOUT`, `NUTRITION`, `GOAL`, `SLEEP`, `SYSTEM`.
- Unread count badge counter and 1-click "Mark All Read".
- Scheduled daily reminders manager with toggle on/off switches.

### 6. Corrected Sleep & Goal Progress Engines
- **Midnight Crossover Sleep Fix**: Correctly computes overnight sleep (e.g. 11:00 PM to 7:00 AM = 8 hours).
- **Direction-Aware Goal Formula**: Uses `startingValue` and `targetValue` for accurate progress on both weight loss and weight gain.

### 7. Body Measurements & Progress
- Log weight, waist, chest, arms, thighs, and body fat percentage.
- History tables and milestone tracking.

### 8. Analytics, Activity Calendar & Data Export
- 7-Day, 14-Day, and 30-Day trend graphs powered by Recharts:
  - Calorie & Protein intake trends
  - Hydration consistency
  - Sleep duration trends
  - KPI summary averages
- **Interactive Calendar**: Monthly heatmap showing daily status dots (Workouts, Meals, Water, Sleep) with day detail cards.
- **1-Click Personal Data Export**: Download your entire health history in **JSON** or **CSV** formats.

---

## 🔒 Security Architecture & Data Isolation

1. **Strict User Data Isolation**:
   - All private resources (diet logs, meals, water, workouts, sets, sleep, goals, body progress, custom foods, reminders, notifications, analytics) are strictly scoped to the authenticated user from the JWT `SecurityContext`.
   - Direct object reference (IDOR) attacks are strictly prevented.
2. **Workout Set Authorization Bug Fixed**:
   - Deletion and updates of workout sets verify that the set belongs to the workout session, and the session belongs to the user.
3. **DTO Security**:
   - JPA entities are never exposed directly from REST controllers. Dedicated Response DTOs prevent sensitive internal leaks, infinite recursion, and lazy-loading proxy failures.
4. **JWT Authentication & Refresh Token Rotation**:
   - Stateless authentication using JJWT.
   - Access tokens (15-min expiry) + Refresh tokens (7-day expiry) with token rotation and revocation on logout (`/api/auth/logout`).
   - Axios client includes automatic 401 response interceptor with token refresh queue.
5. **No Hardcoded Secrets**:
   - Sensitive credentials and keys use environment variable overrides with safe local defaults.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router v6, Recharts, React-Hot-Toast, React Icons |
| **Backend** | Java 17+ (Java 26 compatible), Spring Boot 3.4.3, Spring Security 6, Spring Data JPA, Hibernate |
| **Database** | MySQL 8.0, Flyway DB Migrations |
| **API Documentation** | OpenAPI 3.0, Swagger UI (`springdoc-openapi-starter-webmvc-ui:2.8.5`) |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |

---

## 📁 Repository Structure

```text
fittrack/
├── backend/
│   ├── pom.xml                                   # Maven dependencies & plugins
│   ├── src/main/java/com/fittrack/
│   │   ├── config/                               # Security, Swagger & CORS configuration
│   │   ├── controller/                           # REST Controllers (returning Response DTOs)
│   │   ├── dto/                                  # Request & Response DTOs
│   │   ├── entity/                               # JPA Entities
│   │   ├── repository/                           # Spring Data JPA Repositories
│   │   ├── security/                             # JWT Filter, Token Utility & UserDetails
│   │   ├── service/                              # Business Logic & Rules Engine
│   │   └── utils/                                # Calculations & SecurityContext helpers
│   └── src/main/resources/
│       ├── application.properties                # Config with env var injection
│       └── db/migration/                         # Flyway migration scripts
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/                           # Layout, Sidebar, Header, Modals
        ├── context/                              # AuthContext with token refresh
        ├── pages/                                # Dashboard, Diet, Workout, Analytics, Calendar, Notifications, Settings
        └── services/                             # Axios API clients
```

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher (`java -version`)
- **Node.js**: v18 or higher (`node -v`)
- **MySQL**: 8.0 running locally on port 3306
- **Maven**: 3.9+ (or use `./mvnw`)

---

### 1. Database Setup

Ensure MySQL service is running. Connect to MySQL and create the database (or let Spring Boot create it):

```sql
CREATE DATABASE IF NOT EXISTS fittrack_db;
```

Default credentials in `application.properties`:
- URL: `jdbc:mysql://localhost:3306/fittrack_db`
- Username: `root`
- Password: `${DB_PASSWORD:Satyam1}`

---

### 2. Environment Variables

You can configure the following environment variables:

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/fittrack_db?createDatabaseIfNotExist=true` |
| `DB_USERNAME` | MySQL Username | `root` |
| `DB_PASSWORD` | MySQL Password | `Satyam1` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `FitTrackSuperSecretKey2024ForProductionSecurityWithHMACSHA512AlgorithmsMustBeLongEnough!` |
| `JWT_ACCESS_EXPIRATION` | Access token lifespan (ms) | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifespan (ms) | `604800000` (7 days) |

---

### 3. Backend Setup

```bash
cd fittrack/backend

# Compile and run with Maven
mvn spring-boot:run
```

- API Base URL: `http://localhost:8080/api`
- Health Check: `GET http://localhost:8080/api/auth/health`
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

### 4. Frontend Setup

```bash
cd fittrack/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Frontend App: `http://localhost:5173`

---

## 🧪 Testing

FitTrack includes unit, integration, and security tests:

```bash
cd fittrack/backend

# Run all tests
mvn test
```

### Verified Test Suites:
1. **`SleepDurationUnitTest`**: Verifies midnight crossover (e.g. 23:00 to 07:00 correctly computes 8.0 hours).
2. **`GoalProgressUnitTest`**: Verifies direction-aware progress calculations for both weight loss and muscle gain relative to starting values.
3. **`NutritionCalculationUnitTest`**: Verifies 100g/ml standard scaling, pieces/servings, and separate added sugar accumulation.
4. **`SecurityAuthorizationTest`**: Verifies user data isolation and confirms User A cannot access or delete User B's workout sessions or sets.

---

## 📑 API Endpoints Reference

### Authentication & Tokens
- `POST /api/auth/register` — Register a new athlete account
- `POST /api/auth/login` — Login and receive Access + Refresh tokens
- `POST /api/auth/refresh` — Rotate access token using valid refresh token
- `POST /api/auth/logout` — Revoke refresh token and invalidate session
- `GET /api/auth/health` — API service health check

### Profile & Targets
- `GET /api/profile` — Get authenticated athlete profile & BMR/TDEE
- `PUT /api/profile` — Update physical metrics, activity level, and timezone
- `PUT /api/profile/targets` — Manually override calories, protein, water, and added sugar limits
- `POST /api/profile/targets/recalculate` — Reset targets via Mifflin-St Jeor formula

### Dashboard & Assistant
- `GET /api/dashboard?date=YYYY-MM-DD` — Dynamic "What Should I Do Today?" plan, macros, sugar monitor, focus pillars, and smart alerts

### Diet & Foods
- `GET /api/foods?query=...&category=...` — Search foods (built-in + Indian foods + custom foods)
- `POST /api/foods/custom` — Create a private custom food
- `GET /api/foods/custom` — Get private custom foods
- `GET /api/foods/favorites` — Get favorite foods
- `POST /api/foods/{id}/favorite` — Toggle food favorite star
- `GET /api/meals?date=YYYY-MM-DD` — Get daily meals and food entries
- `POST /api/meals` — Start a meal (Breakfast, Lunch, Dinner, Snack)
- `POST /api/meals/{mealId}/items` — Add food item with serving multiplier
- `DELETE /api/meals/{mealId}/items/{itemId}` — Remove food item
- `GET /api/meals/templates` — Get saved meal templates
- `POST /api/meals/templates` — Save a meal as a template
- `POST /api/meals/templates/{id}/apply?date=YYYY-MM-DD` — 1-click re-log meal template

### Workouts & Schedule
- `GET /api/workouts/schedule` — Get customizable weekly workout split
- `PUT /api/workouts/schedule` — Save customized Monday–Sunday split
- `GET /api/workouts/date?date=YYYY-MM-DD` — Get workouts logged for date
- `POST /api/workouts` — Start a workout session
- `POST /api/workouts/{id}/sets` — Log a set (weight, reps, rest seconds) with automated PR detection
- `DELETE /api/workouts/{id}/sets/{setId}` — Securely delete a set (strictly scoped)
- `GET /api/exercises?query=...` — Search global exercise catalog

### Hydration & Reminders
- `GET /api/water?date=YYYY-MM-DD` — Get water logs & total for date
- `POST /api/water` — Log water consumption (ml)
- `GET /api/reminders` — Get scheduled daily reminders
- `POST /api/reminders` — Create a new daily reminder
- `PATCH /api/reminders/{id}/toggle` — Enable / mute a reminder

### Notifications
- `GET /api/notifications` — Notification inbox with category filters
- `GET /api/notifications/unread-count` — Real-time unread badge count
- `PUT /api/notifications/{id}/read` — Mark notification read
- `PUT /api/notifications/read-all` — Mark all read

### Sleep & Recovery
- `GET /api/sleep/date?date=YYYY-MM-DD` — Sleep log with overnight crossover calculation
- `POST /api/sleep` — Log sleep start, wake time, and quality

### Body Progress & Goals
- `GET /api/progress` — Body measurement history (weight, waist, arms, chest, body fat)
- `POST /api/progress` — Log new physical measurements
- `GET /api/goals` — Fitness goals with starting-value-aware progress
- `POST /api/goals` — Create a fitness goal

### Analytics & Calendar
- `GET /api/analytics?days=30` — Aggregated daily trends, macronutrient distribution, and compliance rates
- `GET /api/calendar?month=YYYY-MM` — Monthly activity calendar matrix with workout, meal, water, and sleep indicators

### Data Privacy & Export
- `GET /api/export/json` — Export complete account history in structured JSON
- `GET /api/export/csv` — Export complete account history in CSV spreadsheets

---

## 🛡️ Medical & Fitness Disclaimer

FitTrack is a personal health tracking, scheduling, and planning operating system. Calculated targets (BMR, TDEE, macronutrient recommendations) are statistical estimates based on recognized formulas (e.g. Mifflin-St Jeor). They do not constitute medical diagnoses or prescriptions. Users are encouraged to consult qualified health professionals before undertaking major dietary or athletic regimens.

---

## 📄 License

MIT License — Personal and educational use freely permitted.
