import { useState } from 'react';
import { Eye, EyeOff, Sparkles, Rocket, Target, Zap, Users, Crown, Star, Heart } from 'lucide-react';
import { apiService } from '../services/api';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await apiService.login({
          username: formData.username,
          password: formData.password
        });
        onAuthSuccess(response.user);
      } else {
        // Register
        const response = await apiService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        });
        onAuthSuccess(response.user);
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <Sparkles className="logo-icon" />
              <h1>StartupQuest</h1>
            </div>
            <p className="auth-subtitle">
              {isLogin ? 'Welcome back, Founder!' : 'Begin your startup journey!'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {isLogin ? 'Login' : 'Create Account'}
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Section */}
          <div className="auth-toggle">
            <div className="toggle-divider">
              <span>or</span>
            </div>
            <button
              type="button"
              className="toggle-btn"
              onClick={toggleAuthMode}
            >
              {isLogin ? (
                <>
                  <Users size={16} />
                  Create New Account
                </>
              ) : (
                <>
                  <Target size={16} />
                  Already have an account? Login
                </>
              )}
            </button>
          </div>

          {/* Theme Elements */}
          <div className="auth-theme-elements">
            <div className="theme-element">
              <Rocket size={20} />
              <span>Build Your Startup</span>
            </div>
            <div className="theme-element">
              <Target size={20} />
              <span>Achieve Your Goals</span>
            </div>
            <div className="theme-element">
              <Zap size={20} />
              <span>Gain Experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 