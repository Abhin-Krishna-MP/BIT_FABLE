const API_BASE_URL = 'http://localhost:8000/api';

export const badgeService = {
  // Get all badges for a user
  getUserBadges: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/user/${userId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch user badges');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  },

  // Create a new badge record
  createBadge: async (badgeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
      });
      if (!response.ok) {
        throw new Error('Failed to create badge');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  },

  // Update badge status
  updateBadgeStatus: async (badgeId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update badge status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating badge status:', error);
      throw error;
    }
  },

  // Get badge by ID
  getBadge: async (badgeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch badge');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching badge:', error);
      return null;
    }
  },

  // Get all available badge types
  getBadgeTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/types/`);
      if (!response.ok) {
        throw new Error('Failed to fetch badge types');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching badge types:', error);
      return [];
    }
  },
}; 