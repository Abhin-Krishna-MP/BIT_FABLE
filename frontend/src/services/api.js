const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Show more detailed error information
        if (data && typeof data === 'object') {
          const errorMessages = Object.entries(data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          throw new Error(errorMessages || 'Something went wrong');
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    try {
      return await this.request('/auth/logout/', {
        method: 'POST',
      });
    } catch (error) {
      // If logout fails (e.g., user not authenticated), that's okay
      // We still want to clear the local state
      console.log('Logout request failed, but clearing local state:', error.message);
      return { message: 'Logout successful' };
    }
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await this.getProfile();
      return response.user;
    } catch (error) {
      return null;
    }
  }

  // Chatbot methods
  async sendChatMessage(message) {
    return this.request('/chatbot/chat/', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const apiService = new ApiService(); 