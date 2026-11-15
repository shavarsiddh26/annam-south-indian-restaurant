# ANNAM — South Indian Restaurant Website

A lightweight local website with a Node.js backend, menu API, order validation, and persistent order storage. It uses only Node.js built-in modules, so it does not require native database bindings, Express, Python, or Visual Studio Build Tools.

## Requirements
- Node.js 20 or newer (Node.js 24 is supported)

## Run on Windows PowerShell
Open PowerShell in this project folder and run:

```powershell
npm install
npm start
```

Then visit http://localhost:3000

`npm install` has no third-party dependencies to compile. The order store is created automatically at `data/orders.json` when the server starts.

## API
- `GET /api/health` — health check
- `GET /api/menu` — menu items
- `POST /api/orders` — validate and save an order
- `GET /api/staff/orders` — retrieve the latest 100 orders; requires `STAFF_API_KEY` and an `x-staff-key` header

For staff access in PowerShell, set a key before starting the server:

```powershell
$env:STAFF_API_KEY = "replace-with-a-long-random-secret"
npm start
```

This is a local starter project. Before public production deployment, add proper staff authentication, HTTPS, rate limiting, payment-provider integration, and a managed database with backups.
