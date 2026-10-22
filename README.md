<p align="center">
  <img src="./public/logo.png" alt="Drimora logo" width="180" />
</p>

<h1 align="center">🌍 Drimora</h1>

<p align="center">
  <strong>Explore • Plan • Book • Travel</strong>
</p>

<p align="center">
  A modern travel and tour booking platform built with React, Tailwind CSS, and a Node.js/Express API.
</p>

<p align="center">
  <a href="#local-setup">🛠️ Run locally</a> •
  <a href="https://github.com/DevelopWithAnuj/tour-blog-website">⭐ Repository</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

## Overview

Drimora is a full-stack travel website for discovering curated tours, reading destination stories, and completing bookings with a polished user experience. The project combines a responsive frontend with a secure backend API and admin tooling.

This version of the app includes:

- Tour discovery and detailed destination pages
- Booking flow with payment and confirmation steps
- User authentication and protected routes
- Blog and travel article publishing
- Admin dashboard for users, bookings, tours, and blog posts
- Contact and support pages with validation and anti-spam protection

## Current Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Motion animations
- Radix UI primitives and custom UI components

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Passport.js for Google/GitHub social login
- Helmet, CORS, rate limiting, validation, and CSRF protection
- Nodemailer + Mailtrap for email notifications

## Key Features

- Responsive travel landing page with immersive hero design
- Searchable, filterable tour catalog
- Tour detail pages with itinerary, pricing, and booking CTA
- Secure authentication flow for login, register, forgot/reset password
- Protected user dashboard and admin dashboard
- Blog listing and individual blog post pages
- Booking management and cancellation policy logic
- Contact form with honeypot validation
- Light/dark-inspired premium travel brand styling

## Tech Architecture

The project is split into a frontend app and a backend API:

- `src/` contains the React front-end and routed pages
- `backend/` contains the Express server, API routes, validators, models, and MongoDB logic
- `public/` contains static assets and branding files

## Project Structure

```text
travel-blog/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── tests/
│   ├── utils/
│   ├── app.js
│   ├── index.js
│   └── .env.example
├── public/
│   ├── img/
│   ├── logo.png
│   └── favicon files
├── src/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── index.html
├── jsconfig.json
└── README.md
```

## Available Scripts

```bash
npm install
npm run dev
npm run client
npm run server
npm run build
npm run preview
npm run test
npm run format
npm run format:check
npm run seed:tours
npm run seed:blogs
```

## Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the backend environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
4. Update the environment values with your MongoDB credentials and API secrets.
5. Start the app:
   ```bash
   npm run dev
   ```

The frontend will run via Vite, and the backend Express server will run in parallel.

## Required Environment Variables

The backend expects values such as:

- `MONGO_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `FORGOT_PASSWORD_REDIRECT_URL`
- `MAILTRAP_SMTP_HOST`
- `MAILTRAP_SMTP_PORT`
- `MAILTRAP_SMTP_USER`
- `MAILTRAP_SMTP_PASS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

A full template is included in `backend/.env.example`.

## API Overview

The project uses a versioned API under `/api/v1`.

Main areas include:

- `/api/v1/auth` — registration, login, social login, password reset
- `/api/v1/tours` — browsing and managing tour listings
- `/api/v1/bookings` — bookings and reservation workflow
- `/api/v1/blogs` — travel blog content
- `/api/v1/admin` — admin operations for content and users
- `/api/v1/contact` — support and inquiry submissions

## Main Pages

- Home
- About
- Contact / Contact Support
- Help / Privacy / Terms
- Tours and Tour Details
- Blog and Blog Post Details
- Login / Register / Forgot Password / Reset Password
- User Dashboard
- Admin Dashboard

## Deployment Notes

This project is structured for deployment as a combined frontend + backend application, with the backend serving the built frontend in production when the `dist/` folder exists.

## Contributing

Pull requests are welcome.

For major changes, please open an issue first so the proposed changes can be reviewed.

## License

This project is currently distributed under the ISC license as defined in `package.json`.

## Author

Anuj Prajapati

## Project Status

Active full-stack travel website with modern UI, booking flow, and admin content management.
