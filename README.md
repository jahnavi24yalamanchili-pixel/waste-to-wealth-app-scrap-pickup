# Waste to Wealth

Waste to Wealth is a simple MERN stack scrap pickup app. Users can check scrap material prices, estimate pickup weight, schedule a pickup, and earn Green Points.

## Project Structure

```text
waste to wealth/
  backend/
    APIs/
    data/
    models/
    server.js
  frontend/
    src/
      components/
      store/
      App.jsx
      App.css
      index.css
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs locally on `http://localhost:5000`.
Deployed backend: `https://waste-to-wealth-app-scrap-pickup.onrender.com`.
Backend health check: `https://waste-to-wealth-app-scrap-pickup.onrender.com/health`.

For backend deployment, set `CLIENT_URL` to your deployed frontend:

```bash
CLIENT_URL=https://waste-to-wealth-app-scrap-pickup.vercel.app
```

Main API paths:

- `POST /auth-api/register`
- `POST /auth-api/login`
- `GET /auth-api/me`
- `GET /user-api/collectors`
- `GET /material-api/materials`
- `POST /material-api/material`
- `GET /pickup-api/pickups`
- `POST /pickup-api/pickup`
- `GET /pickup-api/my-pickups`
- `GET /pickup-api/collector-pickups`
- `PUT /pickup-api/assign/:pickupId`
- `PUT /pickup-api/status/:pickupId`

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

When the backend is deployed, add the deployed backend URL in Vercel as the
frontend environment variable:

```bash
VITE_API_URL=https://waste-to-wealth-app-scrap-pickup.onrender.com
```

The frontend also defaults to the Render backend in production builds, so it
will not try to call `localhost:5000` after deployment.

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd` instead:

```bash
npm.cmd install
npm.cmd run dev
```

## Main Features

- Scheduled pickup requests
- Real-time material price list from API
- Weight-based earning estimation
- Green Points loyalty calculation
- Login and registration
- Customer, collector, and admin roles
- Admin pickup assignment to collectors
- Collector pickup status updates
- Customer-specific Green Points and pickup history
- Separate frontend and backend folders
