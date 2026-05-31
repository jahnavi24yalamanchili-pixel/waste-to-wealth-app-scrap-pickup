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

Backend runs on `http://localhost:5000`.

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
