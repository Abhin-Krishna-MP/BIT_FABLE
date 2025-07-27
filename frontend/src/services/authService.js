const API_BASE_URL = 'http://localhost:8000/api';

export const authService = {
  // Login user
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies for session auth
      });

      if (response.ok) {
        const data = await response.json();
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register user
  register: async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear local storage regardless of response
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');

      if (response.ok) {
        return { message: 'Logout successful' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if logout fails
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return !!user;
  },

  // Get auth headers for API requests
  getAuthHeaders: () => {
    const user = authService.getCurrentUser();
    return {
      'Content-Type': 'application/json',
      // For session-based auth, we rely on cookies being sent automatically
      // For token-based auth, you would add: 'Authorization': `Bearer ${token}`
    };
  },
}; 