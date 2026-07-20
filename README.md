# DayOut - MERN Stack Travel Itinerary Planner

DayOut is an AI-powered travel itinerary planner that turns a few trip details into a complete day-by-day plan. It solves the "blank page" problem and makes planning faster, more structured, and budget-aware.

## Project Summary

Built a full-stack AI travel planner where users input destination, dates, and budget to receive a Gemini-generated day-by-day itinerary. The system utilizes a custom token-aware rate limiter in MongoDB tracking requests and token usage per-user and globally across minute/day windows — preventing API cost overruns without third-party libraries. It features robust role-based access control (user/admin), JWT authentication, an admin dashboard with live usage analytics, and a modernized, responsive interface featuring robust light and dark modes built with React + Vite.

## Features

- AI-powered itinerary generation with Google Gemini
- Secure user authentication with JWT and role-based access (user/admin)
- Save, manage, and revisit itineraries anytime
- Fully modernized, responsive UI
- Worldwide destination coverage
- Budget-conscious recommendations with budget type selection
- Refined typography, sleek layout structures, and smooth micro-interactions
- Built-in dynamic Light and Dark mode support
- Download itineraries as PDF for offline use
- Intelligent rendering of complex AI-generated itinerary data

## Why I Built This

Trip planning is time-consuming and usually starts from scratch. I built DayOut to:

- Reduce the time it takes to plan a trip
- Offer budget-aware, structured itineraries
- Keep itineraries saved and easy to revisit
- Provide a clean, premium, and responsive UI with admin oversight and usage visibility

## What You Can Do

- Generate tailored, multi-day itineraries with AI
- Choose budget type and trip preferences
- Save, view, and delete itineraries from your profile
- Download itineraries beautifully formatted as PDF
- Manage your profile (update info, change password, delete account)
- Toggle seamlessly between Light and Dark mode

## Tech Stack

### Frontend
- React 18 + Vite
- React Router DOM
- Axios
- Custom CSS with built-in Light/Dark mode theming and smooth transitions
- jsPDF for client-side PDF generation

### Backend
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + Bcryptjs
- Google Gemini API
- Express Validator
