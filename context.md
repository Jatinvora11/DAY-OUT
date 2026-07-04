# DayOut - MERN Stack Travel Itinerary Planner Project Context

This document provides a comprehensive technical overview of the **DayOut** project. It is structured to help an LLM understand the project's layout, tech stack, codebase pattern, data models, APIs, and key architectural choices.

---

## 1. Project Overview & Core Features
**DayOut** is an AI-powered travel itinerary planner that takes basic trip parameters (destination, dates, number of travelers, budget, budget type, trip style, and special requests) and generates a structured, day-by-day itinerary.

### Project Summary
* Built a full-stack AI travel planner where users input destination, dates, and budget to receive a Gemini-generated day-by-day itinerary; deployed frontend on Vercel, backend on Render.
* Designed a custom token-aware rate limiter in MongoDB tracking requests and token usage per-user and globally across minute/day windows — preventing API cost overruns without third-party libraries.
* Implemented role-based access control (user/admin), JWT authentication, admin dashboard with live usage analytics, and a multi-theme UI (4 palettes × light/dark mode) with React + Vite.


### Key Capabilities
- **AI Itinerary Generation:** Leverages Google Gemini APIs with multiple fallback models and auto-retry capabilities.
- **Smart Rate Limiting:** Implements custom minute/day limits on both global and per-user levels, measuring both request counts and estimated token consumption.
- **Secure Authentication:** Built on JSON Web Tokens (JWT) with user and admin roles.
- **User Dashboard:** Allows saving, retrieving, downloading (as PDF), and deleting itineraries.
- **Profile Management:** Enables updating email/username, changing passwords, and deleting accounts.
- **Admin Oversight:** Admin panel to list users, change roles, inspect user details, and monitor system-wide rate-limit metrics.
- **Reliable Fallbacks:** Features an automated server-down detection screen and theme matching (light/dark with theme colors).

---

## 2. Directory Structure
The repository is set up as a monorepo split into `backend/` and `frontend/` folders:

```
DayOut/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── middleware/
│   │   ├── auth.js               # JWT security and role verification
│   │   └── rateLimiter.js        # Global & per-user rate limit validation
│   ├── models/
│   │   ├── ContactMessage.js     # Schema for user feedback/contact
│   │   ├── Itinerary.js          # Schema for saved travel plans
│   │   ├── RateLimitUsage.js     # Schema for rate limiter consumption tracking
│   │   └── User.js               # Schema for registered accounts
│   ├── routes/
│   │   ├── admin.js              # Admin features & usage analytics
│   │   ├── auth.js               # Registration and login routes
│   │   ├── contact.js            # Contact form submission
│   │   ├── itinerary.js          # Generation, saving, fetching, and deletion of plans
│   │   └── user.js               # Profile settings and account deletion
│   ├── scripts/
│   │   └── listModels.js         # Script to list local database objects
│   ├── .env.example              # Template for server configuration
│   ├── package.json              # Backend dependencies and startup scripts
│   └── server.js                 # App initialization, routes attachment, and startup
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx        # Navigation bar (manages dark mode & themes toggle)
    │   │   ├── Footer.jsx        # Site footer
    │   │   └── ...
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication react hook wrapper
    │   ├── pages/
    │   │   ├── Home.jsx          # Input form to generate and preview itineraries
    │   │   ├── Landing.jsx       # Public landing page
    │   │   ├── AdminDashboard.jsx# Monitoring page for users and usage stats
    │   │   ├── Profile.jsx       # Settings, change password, account actions
    │   │   ├── PastItineraries.jsx# List of stored itineraries for the current user
    │   │   ├── ServerDown.jsx    # Fallback page shown when API is unreachable
    │   │   ├── About.jsx         # Project context & info
    │   │   └── Contact.jsx       # Inquiry submission form
    │   ├── utils/
    │   │   ├── api.js            # Axios client, interceptors, and API client mappings
    │   │   └── pdf.js            # jsPDF utility for printing itineraries
    │   ├── App.jsx               # Navigation router and app shell lifecycle
    │   ├── index.css             # Main styling system, themes, and CSS variables
    │   └── index.jsx             # React DOM injection point
    ├── vite.config.js            # Vite configurations
    ├── vercel.json               # SPA routing rewrite rule for deployment
    └── package.json              # Frontend package dependencies
```

---

## 3. Technology Stack & Dependencies

### Backend
- **Node.js & Express:** Application server.
- **Mongoose & MongoDB Atlas:** Object Data Modeling (ODM) and cloud database.
- **@google/generative-ai:** API client wrapper for Google Gemini models.
- **jsonwebtoken & bcryptjs:** Credentials hashing and session authentication tokens.
- **express-validator:** Request body parser validation middleware.
- **cors & dotenv:** Cross-origin resource sharing and environment management.

### Frontend
- **React 18 & Vite:** Core view rendering engine and build bundler.
- **React Router DOM v6:** Declarative application routing and navigation logic.
- **Axios:** Network clients for server communication.
- **jsPDF:** Clientside generation of downloadable PDF documents.
- **Vanilla CSS Variables:** Fully themed layout setup supporting custom themes (e.g. `coastal`, `forest`, `sunset`) and dark-mode options.

---

## 4. Mongoose Database Models
The database requires four schemas stored in MongoDB:

### User Model (`backend/models/User.js`)
Stores system accounts with credentials and roles.
```javascript
{
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accountType: { type: String, enum: ['guest', 'registered'], default: 'registered' }
} // timestamps: true
```

### Itinerary Model (`backend/models/Itinerary.js`)
Stores generated itineraries linked to a user.
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  adults: { type: Number, required: true, min: 1 },
  children: { type: Number, required: true, min: 0, default: 0 },
  budget: { type: Number, required: true, min: 0 },
  budgetType: { type: String, enum: ['overall', 'per_person'], default: 'overall' },
  tripType: { type: String, enum: ['leisure', 'adventure', 'cultural', 'business'], required: true },
  specialRequests: { type: String, default: '' },
  itineraryText: { type: String, required: true }
} // timestamps: true
```

### RateLimitUsage Model (`backend/models/RateLimitUsage.js`)
Tracks requests and token limits for specific windows. Indexes `scope`, `user`, `window`, and `windowStart` as a compound unique key.
```javascript
{
  scope: { type: String, enum: ['global', 'user'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  window: { type: String, enum: ['minute', 'day'], required: true },
  windowStart: { type: Date, required: true },
  requestCount: { type: Number, default: 0 },
  tokenCount: { type: Number, default: 0 }
} // timestamps: true
```

### ContactMessage Model (`backend/models/ContactMessage.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true }
} // timestamps: true
```

---

## 5. Architectural Mechanism

### AI Generation & Model Fallback Sequence
Generation triggers a model waterfall order to ensure robust operation when APIs are overloaded. It tries:
1. `gemini-2.5-flash`
2. `gemini-flash-latest`
3. `gemini-pro-latest`
4. `gemini-2.5-pro`

Each model gets up to **2 attempts** with an **800ms exponential retry delay** when encountering 503 Service Unavailable errors. 

### Smart Token-Aware Rate Limiting
Rate limiting operates within database transactions using Mongoose `findOneAndUpdate(..., { upsert: true })`:
- **Calculations:**
  - Token usage is estimated using character counts (`Math.ceil(text.length / 4)`).
  - Pre-allocates tokens using the prompt size, and scales backend counts once the generated response returns (`tokenDelta`).
- **Configuration (default values):**
  - **Global:** 5 Requests/Min (RPM), 250k Tokens/Min (TPM), 20 Requests/Day (RPD).
  - **User:** 1 Request/Min (RPM), 50k Tokens/Min (TPM), 5 Requests/Day (RPD).
- **HTTP status:** Returns `429 Too Many Requests` along with a dynamic `Retry-After` header reporting remaining cooldown seconds.

### Router & Security Middleware
- `protect`: Extracts the `Bearer <token>` header, parses using `jwt.verify()`, and attaches the retrieved user document (`req.user`) to the request object.
- `requireAdmin`: Ensures the user profile contains `role: 'admin'`.

---

## 6. Complete API Route Map

### 🔐 Authentication Routes (`/api/auth`)
- `POST /register` -> Creates a user. Requires `username`, `email`, `password`. Accepts optional `adminCode` string (must match `process.env.ADMIN_REGISTER_CODE` to set `role: 'admin'`).
- `POST /login` -> Matches credentials. Returns JWT token and a serialized User payload.

### 👤 User Routes (`/api/user`)
- `GET /profile` -> Returns authenticated user profile.
- `PUT /profile` -> Updates profile info (email and username).
- `PUT /change-password` -> Modifies user password.
- `DELETE /delete-account` -> Deletes current account and all corresponding saved itineraries.

### 🗺️ Itinerary Routes (`/api/itinerary`)
- `POST /generate` -> Submits travel details, performs rate-limiting checks, and generates an itinerary from the Gemini API cascade.
- `POST /save` -> Saves an itinerary text payload to the user's account.
- `GET /user` -> Retrieves a list of saved itineraries for the logged-in user.
- `GET /:id` -> Fetches details of a specific itinerary.
- `DELETE /:id` -> Deletes a saved itinerary.

### ✉️ Contact Routes (`/api/contact`)
- `POST /` -> Submits a message from the Contact page.
- `GET /` -> Fetches feedback submissions (available for monitoring/debugging).

### 🛠️ Admin Routes (`/api/admin`)
- `GET /users` -> Lists all user accounts.
- `GET /users/:id` -> Retrieves a user details profile alongside their saved itineraries.
- `PATCH /users/:id/role` -> Updates a target user's role string.
- `GET /usage/global` -> Inspects global minute/day rate limits and actual usage.
- `GET /usage/users` -> Displays a table of per-user usage stats (request and token counts for current minute/day windows).

---

## 7. Frontend State & UI System

### Axios Interceptors & Custom Event Fallback
The frontend uses custom windows events dispatched by interceptors in `frontend/src/utils/api.js`:
1. **Network Failure/5xx Errors:** Dispatches a `'dayout:server-down'` custom event. The layout captures this in `App.jsx` and overrides the active route with the `<ServerDown />` screen.
2. **Successful API request:** Dispatches `'dayout:server-up'` to clear the server-down state.
3. **Session Expiry (401):** Dispatches `'dayout:auth-expired'` to automatically clear the token and redirect the user to the log-in page.

### Styling & Theming System
The app uses a unified stylesheet in `frontend/src/index.css` mapped to CSS custom variables attached to `[data-theme]` selectors:
- **Available Themes:** `coastal`, `forest`, `sunset` (each with light and dark mode variants, like `coastal-dark`).
- **Dynamic CSS Variables:** Defines colors (`--primary`, `--primary-rgb`, `--text-primary`, `--bg-primary`, etc.) using HSL profiles to create smooth animations and responsive gradients.
- **Reveals on Scroll:** Employs an `IntersectionObserver` triggered in `App.jsx` to dynamically assign the `is-visible` utility class to components carrying the `reveal` class wrapper, introducing smooth fade-in animations as the user scrolls.

### PDF Export Layout (`frontend/src/utils/pdf.js`)
Generates structured PDFs on the client using `jspdf`. It:
- Wraps long-form itinerary text automatically based on layout dimensions.
- Manages multi-page overflows dynamically (creates new pages if content height exceeds margin offsets).
- Cleans and strips raw markdown layout symbols (e.g. `*`, `#`, ````) to export readable plain-text reports.

---

## 8. Configuration & Local Execution

### Root package.json Dev Scripts
- Running `npm run dev` at the root folder concurrently launches both `npm run backend` and `npm run frontend`.

### Configuration Variables (.env)
Create local `.env` files based on `.env.example` templates in both folders:

**Backend Env Configuration (`backend/.env`):**
```ini
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dayout
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_REGISTER_CODE=your_admin_code
GLOBAL_RPM=5
GLOBAL_TPM=250000
GLOBAL_RPD=20
USER_RPM=1
USER_TPM=50000
USER_RPD=5
NODE_ENV=development
```

**Frontend Env Configuration (`frontend/.env`):**
```ini
VITE_API_URL=http://localhost:3000/api
```
