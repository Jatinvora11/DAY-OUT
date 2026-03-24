# DayOut - MERN Stack Travel Itinerary Planner

A modern, AI-powered travel itinerary planning application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Google Gemini API.

## Features

- 🤖 **AI-Powered Itinerary Generation** - Uses Google Gemini API to create personalized travel plans
- 🔐 **User Authentication** - Secure JWT-based authentication system
- 💾 **Save & Manage Itineraries** - Save your favorite itineraries and access them anytime
- 📱 **Responsive Design** - Beautiful, mobile-friendly interface
- 🌍 **Worldwide Coverage** - Plan trips to any destination
- 💰 **Budget-Conscious** - Get recommendations that match your budget
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations

## Tech Stack

### Frontend
- React 18
- React Router DOM for navigation
- Axios for API calls
- Context API for state management
- CSS3 with custom animations

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcryptjs for password hashing
- Google Generative AI (Gemini API)
- Express Validator for input validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- A Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd DayOut-MERN
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your configuration:
# - MongoDB URI
# - JWT Secret
# - Gemini API Key
# - Port number
```

Edit the `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayout
JWT_SECRET=your_super_secret_jwt_key_change_this
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit the `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Option 2: Use Concurrently (from root)

You can set up a script to run both simultaneously. Add this to a `package.json` in the root:

```json
{
  "name": "dayout-mern",
  "scripts": {
    "install-all": "cd backend && npm install && cd ../frontend && npm install",
    "backend": "cd backend && npm run dev",
    "frontend": "cd frontend && npm start",
    "dev": "concurrently \"npm run backend\" \"npm run frontend\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Then run:
```bash
npm install
npm run dev
```

## Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (Protected)

### Itinerary
- `POST /api/itinerary/generate` - Generate itinerary with AI (Protected)
- `POST /api/itinerary/save` - Save itinerary (Protected)
- `GET /api/itinerary/user` - Get user's itineraries (Protected)
- `GET /api/itinerary/:id` - Get specific itinerary (Protected)
- `DELETE /api/itinerary/:id` - Delete itinerary (Protected)

### Contact
- `POST /api/contact` - Submit contact message
- `GET /api/contact` - Get all contact messages

## Project Structure

```
DayOut-MERN/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Itinerary.js          # Itinerary schema
│   │   └── ContactMessage.js     # Contact message schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── user.js               # User routes
│   │   ├── itinerary.js          # Itinerary routes
│   │   └── contact.js            # Contact routes
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── Header.css
    │   │   ├── Footer.js
    │   │   └── Footer.css
    │   ├── context/
    │   │   └── AuthContext.js    # Authentication context
    │   ├── pages/
    │   │   ├── Landing.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Home.js
    │   │   ├── Profile.js
    │   │   ├── PastItineraries.js
    │   │   ├── Contact.js
    │   │   ├── About.js
    │   │   └── [corresponding CSS files]
    │   ├── utils/
    │   │   └── api.js            # API utility functions
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    ├── .gitignore
    └── package.json
```

## Usage Guide

### 1. Register an Account
- Navigate to `/register`
- Enter username, email, and password (min 6 characters)
- Click "Register"

### 2. Login
- Navigate to `/login`
- Enter your credentials
- Click "Login"

### 3. Generate Itinerary
- Go to Home page
- Fill in the form:
  - Location
  - Start and End dates
  - Number of adults and children
  - Budget
  - Trip type (Leisure, Adventure, Cultural, Business)
  - Special requests (optional)
- Click "Generate Itinerary"
- Review the AI-generated itinerary
- Save it to your account or regenerate if needed

### 4. View Past Itineraries
- Click "Past Itineraries" in the navigation
- View all your saved itineraries
- Delete unwanted itineraries

### 5. Profile
- Click "Profile" to view your account details
- See member since date and account information

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayout
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes and API endpoints
- Input validation with express-validator
- Secure HTTP headers with CORS

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

## Production Deployment

### Backend
1. Set environment variables
2. Build: `npm install --production`
3. Start: `npm start`

### Frontend
1. Set production API URL in .env
2. Build: `npm run build`
3. Serve the `build` folder with a web server

### Deployment Platforms
- **Backend:** Heroku, Railway, Render, DigitalOcean
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** MongoDB Atlas

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify port 27017 is not in use

### API Connection Issues
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure frontend proxy is set correctly

### Gemini API Issues
- Verify API key is correct
- Check API quota and usage limits
- Ensure network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## License

This project is open source and available under the MIT License.

## Credits

- Built with ❤️ using MERN Stack
- AI powered by Google Gemini
- Original PHP version migrated to MERN

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@dayout.com

---

**Happy Traveling! ✈️🌍**
