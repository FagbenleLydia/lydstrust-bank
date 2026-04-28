# LydsTrust Bank

A full-stack digital banking application built with Node.js, Express, MongoDB, and React. Integrates with the NibssByPhoenix (NIBSS) API for BVN/NIN identity verification, account creation, and fund transfers.

## Features

- Customer registration and JWT-based authentication
- BVN and NIN identity verification via NIBSS
- Bank account creation (KYC-gated)
- Intra-bank and inter-bank fund transfers with name enquiry
- Real-time balance retrieval
- Full transaction history with PENDING → SUCCESS/FAILED lifecycle
- Transaction email alerts via Gmail SMTP
- Rate limiting, bcrypt password hashing, and security headers

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Nodemailer  
**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)
- NibssByPhoenix API credentials (see below)

### 1. Clone the repo

```bash
git clone https://github.com/FagbenleLydia/lydstrust-bank.git
cd lydstrust-bank
```

### 2. Get NIBSS API credentials

Register with NibssByPhoenix to get your API key and secret:

```bash
curl -X POST https://nibssbyphoenix.onrender.com/api/onboard \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "bankName": "Your Bank Name"}'
```

Your credentials will be returned in the response. Full API docs: https://nibssbyphoenix.onrender.com/api/docs/#/

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/lydstrust-bank
JWT_SECRET=your_long_random_secret
NIBSS_API_KEY=your_nibss_api_key
NIBSS_API_SECRET=your_nibss_api_secret
NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
BANK_CODE=your_bank_code
BANK_NAME=Your Bank Name
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> For `EMAIL_PASS`, use a Gmail App Password — not your regular Gmail password. Generate one at myaccount.google.com/apppasswords

### 4. Install dependencies and run

**Backend** (runs on port 5001):
```bash
cd backend
npm install
npm run dev
```

**Frontend** (runs on port 3000):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Testing the App

The app includes dev-only endpoints to seed test KYC data (no auth required):

**Seed a test BVN:**
```bash
curl -X POST http://localhost:5001/api/customers/insert-bvn \
  -H "Content-Type: application/json" \
  -d '{
    "bvn": "12345678901",
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "phone": "08012345678"
  }'
```

**Seed a test NIN:**
```bash
curl -X POST http://localhost:5001/api/customers/insert-nin \
  -H "Content-Type: application/json" \
  -d '{
    "nin": "12345678901",
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "phone": "08012345678"
  }'
```

Then register an account, verify with that BVN/NIN, create a bank account, and transfer between accounts.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new customer |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/customers/verify-bvn` | Verify BVN |
| POST | `/api/customers/verify-nin` | Verify NIN |
| POST | `/api/accounts/create` | Create bank account |
| GET | `/api/accounts/my-account` | Get account details |
| GET | `/api/accounts/balance` | Get real-time balance |
| GET | `/api/accounts/name-enquiry/:accountNumber` | Look up account name |
| POST | `/api/transactions/transfer` | Send money |
| GET | `/api/transactions/history` | Transaction history |
| GET | `/api/transactions/status/:reference` | Check transaction status |

All routes except auth, insert-bvn, and insert-nin require `Authorization: Bearer <token>`.
