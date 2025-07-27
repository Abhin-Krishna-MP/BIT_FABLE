import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { badgeService } from '../services/badgeService';
import { User, LogIn, LogOut, AlertCircle, CheckCircle } from 'lucide-react';

const AuthStatus = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
    checkBackendStatus();
  }, []);

  const checkAuthStatus = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(!!currentUser);
    setLoading(false);
  };

  const checkBackendStatus = async () => {
    try {
      const available = await badgeService.isBackendAvailable();
      setBackendAvailable(available);
    } catch (error) {
      setBackendAvailable(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(loginData.username, loginData.password);
      checkAuthStatus();
      setShowLoginForm(false);
      setLoginData({ username: '', password: '' });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      checkAuthStatus();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="auth-status">
        <div className="auth-loading">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="auth-status">
      <div className="auth-header">
        <h4>Backend Authentication</h4>
        <div className="status-indicators">
          <div className={`status-indicator ${backendAvailable ? 'success' : 'warning'}`}>
            {backendAvailable ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>Backend {backendAvailable ? 'Available' : 'Unavailable'}</span>
          </div>
          <div className={`status-indicator ${isAuthenticated ? 'success' : 'warning'}`}>
            {isAuthenticated ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="auth-user-info">
          <div className="user-details">
            <User size={16} />
            <span>Logged in as: {user?.username || 'Unknown User'}</span>
          </div>
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="logout-button"
          >
            <LogOut size={16} />
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <div className="auth-login-section">
          {!showLoginForm ? (
            <button 
              onClick={() => setShowLoginForm(true)}
              className="login-button"
            >
              <LogIn size={16} />
              Login to Backend
            </button>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={loginData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLoginForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="auth-info">
        <p>
          <strong>Note:</strong> Badges will be saved locally if you're not authenticated with the backend.
          This ensures you don't lose your achievements even without backend access.
        </p>
      </div>

      <style>{`
        .auth-status {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          border: 1px solid #e5e7eb;
        }

        .auth-header {
          margin-bottom: 16px;
        }

        .auth-header h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .status-indicators {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status-indicator.success {
          color: #059669;
          background: #d1fae5;
        }

        .status-indicator.warning {
          color: #d97706;
          background: #fef3c7;
        }

        .auth-user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .user-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .logout-button:hover {
          background: #dc2626;
        }

        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-login-section {
          margin-bottom: 16px;
        }

        .login-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .login-button:hover {
          background: #2563eb;
        }

        .login-form {
          background: #f9fafb;
          padding: 16px;
          border-radius: 6px;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          font-size: 14px;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          color: #dc2626;
          font-size: 14px;
          margin-bottom: 12px;
          padding: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .submit-button {
          padding: 8px 16px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .submit-button:hover {
          background: #047857;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-button {
          padding: 8px 16px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .cancel-button:hover {
          background: #4b5563;
        }

        .auth-info {
          padding: 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          font-size: 14px;
          color: #1e40af;
        }

        .auth-loading {
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default AuthStatus; 