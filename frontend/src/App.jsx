import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './components/AuthPage';
import { apiService } from './services/api';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated with the backend
    const checkAuth = async () => {
      try {
        const userData = await apiService.checkAuth();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading StartupQuest...</h2>
          <p>Preparing your entrepreneurial journey</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        ) : (
          <Routes>
            <Route path="/" element={<Index user={user} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
