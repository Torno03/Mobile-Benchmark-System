# Mobile Benchmarking System

A full-stack web application to compare mobile phones by benchmark scores, ratings, and value-for-money indicators.

## Tech Stack

- **Frontend:** React, React Router, Axios, Firebase Auth
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth/Admin:** Firebase Authentication + Firebase Admin SDK

## Key Features

- Browse and compare phone benchmark information
- View phone details, ratings, and comments
- Save phones to wishlist
- Notifications and FAQs support
- Admin actions for managing content and admin role assignment

## Project Structure

```text
.
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   └── server.js
├── frontend
│   ├── public
│   └── src
└── README.md
```

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB database (Atlas or local)
- Firebase project (for auth/admin)

## Environment Setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Fill required values:

```env
PORT=1080
MONGO_URI=<your-mongodb-connection-string>
FIREBASE_SERVICE_ACCOUNT_PATH=backend/config/serviceAccountKey.json
```

3. Add your Firebase Admin JSON file at `backend/config/serviceAccountKey.json`
	- You can use `backend/config/serviceAccountKey.example.json` as a template.

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Fill Firebase web config values:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

## Installation

Install dependencies for both apps:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Run Locally

### Option 1: From project root (runs backend + frontend together)

```bash
npm start
```

### Option 2: Run separately

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

Frontend default: `http://localhost:3000`  
Backend default: `http://localhost:1080`

## API Base Paths

- `/api/phones`
- `/api/ratings`
- `/api/admin`
- `/api/wishlist`
- `/api/notifications`
- `/api/faqs`

## Deployment Notes

- Backend includes `backend/vercel.json` for Vercel deployment.
- Ensure all environment variables are set in your deployment platform.
- Never commit real `.env` files or service account keys.

## GitHub Publishing Checklist

- [ ] Remove/rotate any previously exposed secrets (MongoDB/Firebase)
- [ ] Confirm `.env` files are not tracked
- [ ] Confirm service account key file is not tracked
- [ ] Push with this updated documentation

## License

This project is for educational/research usage unless otherwise specified by the repository owner.