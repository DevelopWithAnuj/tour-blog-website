# Backend

Express API for the Drimora travel platform.

## Setup

1. Copy `.env.example` to `.env` in this directory.
2. Replace the database, token, SMTP, and OAuth placeholder values.
3. From the repository root, run `npm run server` or `npm run dev`.

The API is mounted under `/api/v1`. Cookie-authenticated state-changing
requests must send an `Origin` matching `CORS_ORIGIN` (or a matching `Referer`
when `Origin` is unavailable).

## Structure

- `config/` - Passport and logger configuration
- `controllers/` - request handlers
- `db/` - MongoDB connection
- `middleware/` - authentication, validation, CSRF/origin checks, and errors
- `models/` - Mongoose models
- `routes/` - API route declarations
- `scripts/` - seed scripts
- `tests/` - Node.js tests
- `utils/` - shared API, mail, constants, and environment utilities
