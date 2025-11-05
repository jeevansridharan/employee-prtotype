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
# edit .env as needed (set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
```

2. Install dependencies

```powershell
npm install
```

3. Ensure MySQL is running, create the database (if not exists), and seed

Windows tips to start MySQL:
- Start Menu -> Services -> find "MySQL" (often "MySQL80") -> Start
- Or in PowerShell (as Administrator):

```powershell
# Try common service names; ignore errors if a name doesn't exist
Get-Service MySQL*, MariaDB* | Select-Object Name,Status,StartType
# Start if stopped (replace with your actual service name)
Start-Service -Name MySQL80
```

Verify the port is open (default 3306):

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3306
```

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
- The backend uses MySQL (configure `.env`) and stores timestamps in MySQL DATETIME columns. JWT secret is read from `JWT_SECRET`.
- DB_PORT is supported (default 3306).
- This is a minimal prototype — consider adding validation, pagination, rate-limiting, and HTTPS for production.
