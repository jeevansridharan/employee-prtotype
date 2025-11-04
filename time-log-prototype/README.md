# Time Log Prototype (MySQL backend)

This prototype provides a simple REST API for:
- Employees to punch IN/OUT (24-hour timestamps)
- Creating tasks and assigning them to employees
- HR / external reviewers to list employees and review logs

Requirements
- Node.js 16+ (or newer) and npm
- A running MySQL server

Setup

1. Copy the example env then edit with your DB credentials:

```powershell
cd "time-log-prototype"
copy .env.example .env
# edit .env as needed
```

2. Install dependencies

```powershell
npm install
```

3. Create the MySQL database (if not exists) and run the seed

Using a MySQL client, create the DB name from `.env` (default: `time_log_prototype`):

```sql
CREATE DATABASE IF NOT EXISTS time_log_prototype CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run:

```powershell
npm run seed
```

4. Start the server

```powershell
npm start
```

5. Run the test flow in another terminal (demonstrates create/assign/punch/logs)

```powershell
npm run test-flow
```

API Summary

- POST /api/auth/login {username,password} -> {token}
- POST /api/tasks {title,description} (auth) -> create task
- POST /api/tasks/:id/assign {user_id} (auth) -> assign task to user
- POST /api/punch {action: 'IN'|'OUT', task_id?, notes?} (auth) -> create log (MySQL DATETIME used)
- GET /api/logs (auth) -> employees see own logs; hr/reviewer can see all and filter with ?user_id=1&from=...&to=...
- GET /api/employees (auth, hr only) -> list users

Notes
- The backend uses MySQL (change `.env`) and stores timestamps in MySQL DATETIME columns. JWT secret is read from `JWT_SECRET`.
- This is a minimal prototype — consider adding validation, pagination, rate-limiting, and HTTPS for production.
