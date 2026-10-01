# Attendance System

Full-stack attendance system with a React/Vite dashboard, an Express/MongoDB API, and optional ESP32 RFID reader firmware.

## Requirements

- [Node.js 20.19+ or 22.12+](https://nodejs.org/en/download) (npm is included with Node.js)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas/database) connection URI
- Git, if cloning this repository
- Arduino IDE and the hardware listed in [firmware/README.md](firmware/README.md), only if setting up the ESP32 reader

## 1. Configure MongoDB and the backend

Install and start MongoDB Community Server, or create an Atlas cluster and obtain its connection URI. For a local MongoDB instance, the example URI below works with the default port.

In PowerShell, from the repository root:

```powershell
cd backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Open `backend/.env` and set `MONGO_URI` to your local or Atlas URI. Set `JWT_SECRET` to a long, random value. The sample values are for local development only; do not use them in production. `PORT` defaults to `5000` if omitted.

Install the backend dependencies and start its development server:

```powershell
npm ci
npm run dev
```

Keep this terminal open. The API is available at `http://localhost:5000/api`. Confirm that it is running by opening `http://localhost:5000/api/health`; a healthy response contains `"success": true`.

For a non-reloading server, use `npm start` instead of `npm run dev`.

## 2. Configure and run the frontend

Open a second PowerShell terminal at the repository root:

```powershell
cd frontend
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm ci
npm run dev
```

The frontend defaults to the backend at `http://localhost:5000/api`. If your backend uses another URL, edit `frontend/.env.local` and set `VITE_API_URL` to the full API base URL, including `/api`; restart Vite after changing it.

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 3. Create the first administrator

The login form pre-fills `admin@attendance.com` and `admin123`, but the application does not create that account automatically. With the backend running, open a third PowerShell terminal and register an administrator using your own email and password:

```powershell
$body = @{
  name = "System Administrator"
  email = "admin@example.com"
  password = "choose-a-password"
  role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body $body
```

Use the email and password you chose on the frontend login page. Passwords must be at least six characters. The registration endpoint is open in the current application, so keep this development service private and do not expose it publicly without adding appropriate access controls.

## Common commands

Run these from the indicated app directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API with automatic reload |
| `backend` | `npm start` | Start the API normally |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run preview` | Preview the production build locally |
| `frontend` | `npm run lint` | Run ESLint |

## Optional: ESP32 RFID firmware

Follow [firmware/README.md](firmware/README.md) for wiring and Arduino IDE library installation. Configure the Wi-Fi credentials and `SERVER_URL` in `firmware/esp32_attendance/esp32_attendance.ino`. When the board calls the API, use the computer's LAN IP address in the URL instead of `localhost`, and make sure both devices are on the same network and the backend port is reachable.

## Troubleshooting

- **MongoDB connection error:** Confirm MongoDB is running and `MONGO_URI` is correct. For Atlas, verify the database user and network access allowlist.
- **Frontend cannot reach the API:** Confirm the backend health URL works and `VITE_API_URL` points to the API base URL with `/api` at the end. Restart Vite after changing the env file.
- **Login returns invalid credentials:** Register an account first; the prefilled login credentials are not provisioned automatically.
- **Port already in use:** Change `PORT` in `backend/.env`. Vite will normally select another available frontend port and print it in the terminal.