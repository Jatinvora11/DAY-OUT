import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard.jsx';
import ServerDown from './pages/ServerDown.jsx';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const UserRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return user?.role === 'admin' ? <Navigate to="/admin" /> : children;
};

const AdminBlockRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return user?.role === 'admin' ? children : <Navigate to="/home" />;
};

const AppShell = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('dayout-theme') || 'coastal';
    const storedMode = localStorage.getItem('dayout-mode') || 'light';
    const modeSuffix = storedMode === 'dark' ? '-dark' : '';
    document.documentElement.setAttribute('data-theme', `${storedTheme}${modeSuffix}`);
  }, [isAuthenticated]);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return undefined;

    if (typeof window.IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    elements.forEach((element) => element.setAttribute('data-reveal', 'pending'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.removeAttribute('data-reveal');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    elements.forEach((element) => observer.observe(element));

    requestAnimationFrame(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95) {
          element.classList.add('is-visible');
          element.removeAttribute('data-reveal');
          observer.unobserve(element);
        }
      });
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const handleDown = () => setServerDown(true);
    const handleUp = () => setServerDown(false);
    window.addEventListener('dayout:server-down', handleDown);
    window.addEventListener('dayout:server-up', handleUp);

    return () => {
      window.removeEventListener('dayout:server-down', handleDown);
      window.removeEventListener('dayout:server-up', handleUp);
    };
  }, []);

  const defaultRoute = isAuthenticated && user?.role === 'admin' ? '/admin' : '/home';

  if (serverDown) {
    return (
      <>
        <Header />
        <main className="main-content">
          <ServerDown onRetry={() => window.location.reload()} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <Landing />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={defaultRoute} /> : <Register />} />
          <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/past-itineraries" element={<UserRoute><PastItineraries /></UserRoute>} />
          <Route path="/contact" element={<AdminBlockRoute><Contact /></AdminBlockRoute>} />
          <Route path="/about" element={<AdminBlockRoute><About /></AdminBlockRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

function App() {
  const { loading } = useAuth();

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
        <AppShell />
      </div>
    </Router>
  );
}

export default App;
