import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import PastItineraries from './pages/PastItineraries.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import Landing from './pages/Landing.jsx';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Landing />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/past-itineraries" element={<ProtectedRoute><PastItineraries /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
