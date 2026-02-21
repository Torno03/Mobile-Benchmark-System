# Backend

Node.js/Express API for the Mobile Benchmarking System.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGO_URI`
3. Add Firebase admin credentials to `config/serviceAccountKey.json` (use `config/serviceAccountKey.example.json` as template)
4. Install dependencies and run:

```bash
npm install
npm run dev
```

Server default URL: `http://localhost:1080`.

For full project instructions, see the root [README](../README.md).
