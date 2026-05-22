# DayOut - MERN Stack Travel Itinerary Planner

DayOut is an AI-powered travel itinerary planner that turns a few trip details into a complete day-by-day plan. It solves the "blank page" problem and makes planning faster, more structured, and budget-aware.

## Features

- AI-powered itinerary generation with Google Gemini
- Secure user authentication with JWT
- Save, manage, and revisit itineraries anytime
- Responsive, mobile-first UI
- Worldwide destination coverage
- Budget-conscious recommendations with budget type selection
- Modern UI with smooth animations and theming
- Visual themes: Coastal, Forest, Sunset, and a dedicated dark-only Night Sky mode
- Download itineraries as PDF

## Why I Built This

Trip planning is time-consuming and usually starts from scratch. I built DayOut to:

- Reduce the time it takes to plan a trip
- Offer budget-aware, structured itineraries
- Keep itineraries saved and easy to revisit
- Provide a clean, responsive UI with admin oversight and usage visibility

## What You Can Do

- Generate itineraries with AI
- Choose budget type and trip preferences
- Save, view, and delete itineraries
- Download itineraries as PDF
- Manage your profile (update info, change password, delete account)
- Access an admin dashboard for users and usage stats
- Preview themes from profile swatches, save your selection, toggle light/dark mode, and use the server-down fallback screen

## Key Features

- AI itinerary generation with rate limiting (global + per-user)
- JWT authentication with role-based access (user/admin)
- MongoDB Atlas storage for users and itineraries
- Vercel frontend + Render backend deployment

## Tech Stack

### Frontend
- React 18 + Vite
- React Router DOM
- Axios
- CSS theming with per-theme radial mesh hero gradients

### Backend
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + Bcryptjs
- Gemini API
- Express Validator

## API Endpoints (Summary)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `PUT /api/user/change-password`
- `DELETE /api/user`

### Itinerary
- `POST /api/itinerary/generate`
- `POST /api/itinerary/save`
- `GET /api/itinerary/user`
- `GET /api/itinerary/:id`
- `DELETE /api/itinerary/:id`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/role`
- `GET /api/admin/usage/global`
- `GET /api/admin/usage/users`

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

### Vercel (Frontend)
- Set `VITE_API_URL` to your Render API base (e.g., `https://your-backend.onrender.com/api`).
- Ensure SPA refresh works with [frontend/vercel.json](frontend/vercel.json).

### Render (Backend)
- Set env vars: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `ADMIN_REGISTER_CODE`, rate-limit values.
- Start command: `npm start`.

### MongoDB Atlas
- Create a cluster and user.
- Use the connection string for `MONGODB_URI`.

## Project Structure

```
DayOut/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    ├── .env.example
    ├── package.json
    ├── vercel.json
    └── vite.config.js
```

## Notes

- Rotating `JWT_SECRET` will log users out.
- The Contact page is informational; API endpoints remain available.
