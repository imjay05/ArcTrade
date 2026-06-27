<div align="center">

# ArcTrade

### A full-stack stock trading platform with live market data.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-16a34a?style=for-the-badge)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019-149eca?style=for-the-badge&logo=react)](#)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](#)

[Live Demo](#-live-demo) • [Features](#-key-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Setup](#-local-setup) • [API Reference](#-api-reference)

</div>

---

## 📌 Overview

**ArcTrade** is a MERN-stack trading platform that simulates real-world stock investing — built end-to-end, from database schema design to a deployed, working product. It isn't a CRUD-only tutorial clone: it solves real engineering problems that production fintech systems face — **keeping money consistent under concurrent writes, verifying third-party payments cryptographically, and serving live external market data efficiently without hammering a rate-limited API.**

Users can sign up, fund a virtual wallet through a real Razorpay checkout, browse a live watchlist of 50+ NSE stocks across 9 market sectors, place BUY/SELL orders, and track their portfolio's profit & loss on a self-built candlestick chart.

---

## 🚀 Live Demo

| | |
|---|---|
| **Frontend** | [your-vercel-link-here](#) |
| **Backend API** | [your-render-link-here](#) |
| **Demo Credentials** | `demo@arctrade.com` / `demo1234` *(or "Sign up to test live")* |

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based stateless authentication with **bcrypt** password hashing (10-round salt).
- Auto-generated human-readable account IDs (e.g. `JS482931`) derived from the user's initials — similar to a real broker's Client ID.
- Centralized Express middleware (`protect`) guards every sensitive route and attaches the verified user to `req.user`.

### 💰 Trading Engine with ACID-Safe Money Movement
- Every order placement runs inside a **MongoDB multi-document transaction** — wallet debit/credit, order creation, and holdings update either **all succeed or all roll back together**. No partial trades, ever.
- Implements real **weighted-average cost basis** calculation when buying more of an already-held stock — the same logic real brokerage platforms use for P&L tracking.
- Server-side wallet balance validation on every order — the backend never trusts client-side checks.

### 💳 Real Payment Gateway Integration (Razorpay)
- Live "Add Funds" flow using Razorpay Checkout.
- **Server-side HMAC-SHA256 signature verification** on every payment before crediting a single rupee to a wallet — preventing forged/replayed payment confirmations from a malicious client.
- Full payment audit trail stored in a dedicated `Payments` collection (`created` → `paid` state machine).

### 📊 Live(ish) Market Data Pipeline
- Integrates real NSE stock quotes via a Yahoo Finance data endpoint, with custom symbol-mapping logic to handle real-world ticker quirks (`M&M`, `L&T`, `HUL` → `HINDUNILVR.NS`, etc.).
- **In-memory TTL cache + batched parallel fetching** (`Promise.allSettled`, 8-wide batches with throttling) — keeps the UI fast while respecting third-party rate limits and degrading gracefully (serves stale cached data with a visible warning) if the upstream API fails.
- A custom React hook (`useStockPrices`) shares one in-memory cache across every component on the dashboard (Watchlist, Holdings, Domain Chart, Summary) — eliminating duplicate network requests for the same symbol.

### 📈 Portfolio Visualization
- Hand-built **HTML5 Canvas candlestick chart** (no charting library) rendering live portfolio value over time, with a profit/loss baseline and per-holding breakdown.
- Domain/sector-wise performance dashboard across 9 industry sectors (IT, Banking, Pharma, Auto, Energy, Metals, Infra, Defence, FMCG).

### 🖥️ Polished, Responsive UI/UX
- Draggable Buy/Sell order ticket with live cost estimation and stale-price warnings.
- Fully responsive design (desktop split-panel auth screens → mobile-first collapsible nav & drawer).
- Toast notifications, password-strength meter, skeleton loading states, and optimistic UI feedback throughout.

---

## 🏗 System Architecture

```
┌──────────────────┐        HTTPS / JWT Bearer        ┌───────────────────┐
│   React + Vite   │ ───────────────────────────────▶│  Node.js + Express │
│   (Frontend)     │ ◀─────────────────────────────  │     (Backend)      │
└──────────────────┘            JSON REST API         └───────────────────┘
                                                              │      │
                                                              │      │
                                          ┌───────────────────┘      └───────────────────┐
                                          ▼                                              ▼
                              ┌───────────────────────┐                    ┌─────────────────────┐
                              │   MongoDB + Mongoose  │                    │External Services    │
                              │  Users · Orders ·     │                    │ • Razorpay(payments)│
                              │  Holdings · Payments  │                    │ • Yahoo Finance     │
                              └───────────────────────┘                    └─────────────────────┘
```

**Request flow example — placing a BUY order:**

1. User submits an order from the `BuyActionWindow` → `POST /api/orders/new` with a JWT in the `Authorization` header.
2. Express `protect` middleware verifies the JWT and attaches the authenticated user.
3. Backend validates quantity/funds, then opens a **MongoDB session/transaction**.
4. Inside the transaction: wallet balance is debited (`$inc`), an `Order` document is created, and the `Holdings` document is created/updated with a recalculated weighted-average price.
5. If any step fails, MongoDB **automatically rolls back the entire transaction** — funds, orders, and holdings never go out of sync.
6. Response returns to the frontend → wallet balance refreshes app-wide via `AuthContext`.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, React Hot Toast, MUI Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose (ODM) |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Payments** | Razorpay Checkout + Orders API, Node `crypto` (HMAC verification) |
| **Market Data** | Yahoo Finance (unofficial endpoint via Axios) |
| **Tooling** | Git, GitHub|

---

## 📂 Project Structure

```
arctrade/
├── backend/
│   ├── config/DB.js               # MongoDB connection
│   ├── controllers/                # Auth, Orders, Holdings, Payment, StockPrices, StockAnalyzer
│   ├── middleware/AuthMiddleware.js  # JWT route protection
│   ├── model/index.js              # Mongoose model registry
│   ├── schemas/                    # User, Orders, Holdings, Payment schemas
│   ├── data/StockUniverse.js       # 9-sector, 50+ symbol stock universe
│   ├── routes/                     # REST route definitions per feature
│   └── Index.js                    # Express app entrypoint
│
└── frontend/
    ├── src/
    │   ├── auth/                   # Login, Signup
    │   ├── components/
    │   │   ├── buyActionWindow/    # Order ticket UI
    │   │   ├── candlestickChart/   # Canvas-based chart engine
    │   │   ├── dashboard/, holdings/, orders/, funds/, watchList/, domainChart/
    │   │   └── menu/, topBar/, protectedRoute/
    │   ├── context/AuthContext.jsx       # Global auth state + Axios interceptor
    │   ├── hooks/useStockPrices.js       # Shared-cache live price hook
    │   └── constants/, data/, utils/
    └── App.jsx
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local instance **or** a replica-set-enabled Atlas cluster — required for transactions)
- A free [Razorpay](https://razorpay.com) test account (Key ID + Secret)

### Backend
```bash
cd backend
npm install
```
Create a `.env` file:
```env
PORT=3002
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
```
```bash
npm start
```

### Frontend
```bash
cd frontend
npm install
```
Create a `.env`:
```env
VITE_API_URL=http://localhost:3002
```
```bash
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:3002`.

---

## 📡 API Reference

| Method |              Endpoint             |            Description                   | Auth |
|--------|-----------------------------------|------------------------------------------|----- |
| `POST` | `/api/auth/signup`                | Create account                           | ❌  |
| `POST` | `/api/auth/login`                 | Login, returns JWT                       | ❌  |
| `GET`  | `/api/auth/me`                    | Get current user                         | ✅  |
| `POST` | `/api/auth/logout`                | Logout                                   | ✅  |
| `POST` | `/api/orders/new`                 | Place a BUY/SELL order (transactional)   | ✅  |
| `GET`  | `/api/orders`                     | Get order history                        | ✅  |
| `GET`  | `/api/holdings`                   | Get current holdings                     | ✅  |
| `GET`  | `/api/stock-prices?symbols=`      | Get live quotes (sequential, cached)     | ❌  |
| `GET`  | `/api/stock-prices/bulk?symbols=` | Get live quotes (parallel batched)       | ❌  |
| `GET`  | `/api/stock-analyzer`             | Holdings tagged by sector                | ✅  |
| `POST` | `/api/payment/create-order`       | Create a Razorpay order                  | ✅  |
| `POST` | `/api/payment/verify`             | Verify payment signature & credit wallet | ✅  |

All responses follow a consistent shape: `{ success: boolean, message?: string, data? }`.

---

## 🔮 Engineering Trade-offs & Roadmap

Honest notes on current limitations and what I'd build next — because knowing the gaps matters as much as the features:

- **JWT storage**: currently stored in `localStorage`; a production hardening pass would move to `httpOnly` cookies to mitigate XSS token theft.
- **Price feed**: built on an unofficial Yahoo Finance endpoint; a production version would use a licensed market-data provider with an SLA.
- **Real-time updates**: prices are polled on an interval rather than pushed; a WebSocket/SSE layer would reduce latency and redundant requests.
- **Caching**: the price cache is in-process memory, which doesn't scale across multiple server instances — the next step is an external shared cache (e.g. Redis) for horizontal scaling.
- **Planned**: order cancellation for pending Limit orders, portfolio value history (scheduled snapshot job instead of client-side simulation), and CI pipeline with automated tests.

---

## 👤 Author

**[Jay]**
[LinkedIn](#https://www.linkedin.com/in/jay-shelke-4323a22a5/) • [GitHub](#https://github.com/imjay05) 

---

<div align="center">
<i>Built as a full-stack engineering project to demonstrate production-style problem solving — transactional data integrity, third-party payment security, and resilient external API integration.</i>
</div>
