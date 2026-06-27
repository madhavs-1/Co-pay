# Co-pay

A shared wallet app for groups — create pools, add funds, pay together, and track transaction history.

## Stack

- **Backend:** Flask, SQLAlchemy, SQLite
- **Frontend:** React (Vite)

## Features

- Phone-based login and registration
- Personal app wallet with balance
- Shared pools with join codes and admin approval for new members
- Deposit to wallet or pool, pay from pool
- Transaction history and group chat UI
- Light/dark mode

## Getting started

### Backend

```bash
pip install -r requirements.txt
python app.py
```

Runs on `http://127.0.0.1:5000`.

### Frontend

From the `frontend/` directory, install dependencies and start the dev server (Vite proxies `/api` to the Flask backend):

```bash
npm install
npm run dev
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login by phone |
| POST | `/api/register` | Register new user |
| GET | `/api/me` | Current user |
| GET | `/api/groups` | List pools |
| POST | `/api/pool` | Create pool |
| POST | `/api/pool/join` | Request to join pool |
| POST | `/api/pool/add` | Add funds to pool |
| POST | `/api/pool/pay` | Pay from pool |
| POST | `/api/wallet/add` | Top up app wallet |
| GET | `/api/transactions/<group_id>` | Pool transactions |
| GET | `/api/history/<user_id>` | User history |
