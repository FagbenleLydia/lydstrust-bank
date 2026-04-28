# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** — run from `backend/`:
```bash
npm run dev    # Development with nodemon auto-reload
npm start      # Production start (port 5000)
```

**Frontend** — run from `frontend/`:
```bash
npm run dev    # Vite dev server on port 3000 (proxies /api → localhost:5000)
npm run build  # Production build to frontend/dist/
```

Run both simultaneously: start the backend first, then the frontend.

No test framework is configured in either project.

## Architecture

Full-stack app. **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT auth + NIBSS external API. **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6 + Axios.

```
backend/src/
├── server.js              # Express app bootstrap, route mounting, DB connection
├── config/database.js     # Mongoose connection
├── middleware/auth.middleware.js  # JWT protect() middleware
├── models/                # Mongoose schemas (customer, account, transaction)
├── controllers/           # Route handlers (auth, customer, account, transaction)
├── routes/                # Express routers mounted at /api/*
└── services/nibss.service.js  # All external NIBSS API calls, token caching

frontend/src/
├── main.jsx               # React entry point
├── App.jsx                # Route definitions (public + protected)
├── api/axios.js           # Axios instance with /api base URL + JWT interceptor
├── context/AuthContext.jsx # Global auth state (user, login, register, logout, refreshUser)
├── components/
│   ├── Layout.jsx         # Sidebar + main wrapper for all authenticated pages
│   ├── ProtectedRoute.jsx # Redirects to /login if no token
│   └── Spinner.jsx        # Reusable loading spinner
└── pages/
    ├── Landing.jsx        # Public marketing page
    ├── Login.jsx / Register.jsx
    ├── Dashboard.jsx      # Balance card, quick actions, recent transactions
    ├── Verify.jsx         # BVN/NIN verification form
    ├── Transfer.jsx       # Two-step: name enquiry → transfer
    └── Transactions.jsx   # Full history with expandable detail rows
```

Backend request flow: `routes → controllers → services/models → MongoDB`  
Frontend API calls: all go through `src/api/axios.js` which proxies to `localhost:5000/api` via Vite's dev proxy.

## Key Domain Concepts

**NIBSS integration** (`services/nibss.service.js`) is the core external dependency — it handles BVN/NIN KYC validation, account creation, fund transfers, name enquiry, and balance sync. Tokens are cached for 55 minutes. Base URL: `NIBSS_BASE_URL` env var pointing to `nibssbyphoenix.onrender.com`.

**Dual balance management**: Accounts store balance locally in MongoDB AND can fetch real-time balance from NIBSS. The balance endpoint prefers NIBSS but falls back to local.

**KYC gate on account creation**: Customers must verify BVN or NIN before creating a bank account. `customer.isVerified` flag controls this.

**Intra-bank transfers**: When sender and receiver share the same `BANK_CODE`, the controller automatically creates a CREDIT transaction and updates the receiver's local balance without waiting on NIBSS to propagate.

**Transaction lifecycle**: Records are created as `PENDING` before calling NIBSS, then updated to `SUCCESS` or `FAILED`. Each transaction stores `balanceBefore` and `balanceAfter` snapshots.

**Test data endpoints** (no auth required): `POST /api/customers/insert-bvn` and `POST /api/customers/insert-nin` seed test KYC records directly into MongoDB — development/testing only.

## Environment Variables

Required in `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lydstrust-bank
JWT_SECRET=...
NIBSS_API_KEY=...
NIBSS_API_SECRET=...
NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
BANK_CODE=415
BANK_NAME=LYD Bank
```

## API Surface

- `POST /api/auth/register` / `POST /api/auth/login` / `GET /api/auth/me`
- `POST /api/customers/verify-bvn` / `verify-nin` / `GET /api/customers/profile`
- `POST /api/accounts/create` / `GET /api/accounts/my-account` / `balance` / `name-enquiry/:accountNumber`
- `POST /api/transactions/transfer` / `GET /api/transactions/history` / `status/:reference`

All routes except auth, insert-bvn, and insert-nin require `Authorization: Bearer <token>`.
