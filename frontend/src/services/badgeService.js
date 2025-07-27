const API_BASE_URL = 'http://localhost:8000/api';

// Local storage fallback for when backend is not available
const LOCAL_STORAGE_KEY = 'startup_quest_badges';

const getAuthHeaders = () => {
  // Try to get auth token from localStorage or session
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const getLocalBadges = () => {
  try {
    const badges = localStorage.getItem(LOCAL_STORAGE_KEY);
    return badges ? JSON.parse(badges) : [];
  } catch (error) {
    console.error('Error reading local badges:', error);
    return [];
  }
};

const saveLocalBadge = (badgeData) => {
  try {
    const badges = getLocalBadges();
    const newBadge = {
      id: Date.now(), // Generate local ID
      ...badgeData,
      created_at: new Date().toISOString(),
      is_local: true // Flag to indicate this is stored locally
    };
    badges.push(newBadge);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(badges));
    return newBadge;
  } catch (error) {
    console.error('Error saving local badge:', error);
    throw error;
  }
};

export const badgeService = {
  // Get all badges for a user
  getUserBadges: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/user_badges/?user_id=${userId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 403) {
        console.warn('Backend requires authentication, using local storage fallback');
        return getLocalBadges();
      } else {
        throw new Error('Failed to fetch user badges');
      }
    } catch (error) {
      console.warn('Backend not available, using local storage fallback:', error.message);
      return getLocalBadges();
    }
  },

  // Create a new badge record
  createBadge: async (badgeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(badgeData),
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 403) {
        console.warn('Backend requires authentication, saving badge locally');
        return saveLocalBadge(badgeData);
      } else {
        throw new Error(`Failed to create badge: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Backend not available, saving badge locally:', error.message);
      return saveLocalBadge(badgeData);
    }
  },

  // Update badge status
  updateBadgeStatus: async (badgeId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 403) {
        console.warn('Backend requires authentication, updating badge locally');
        // Update local badge
        const badges = getLocalBadges();
        const badgeIndex = badges.findIndex(b => b.id === badgeId);
        if (badgeIndex !== -1) {
          badges[badgeIndex].status = status;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(badges));
          return badges[badgeIndex];
        }
        throw new Error('Badge not found locally');
      } else {
        throw new Error('Failed to update badge status');
      }
    } catch (error) {
      console.error('Error updating badge status:', error);
      throw error;
    }
  },

  // Get badge by ID
  getBadge: async (badgeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 403) {
        console.warn('Backend requires authentication, getting badge from local storage');
        const badges = getLocalBadges();
        return badges.find(b => b.id === badgeId) || null;
      } else {
        throw new Error('Failed to fetch badge');
      }
    } catch (error) {
      console.warn('Backend not available, getting badge from local storage:', error.message);
      const badges = getLocalBadges();
      return badges.find(b => b.id === badgeId) || null;
    }
  },

  // Get all available badge types
  getBadgeTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/types/`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 403) {
        console.warn('Backend requires authentication, using default badge types');
        return [
          { type: 'pitch-master', name: 'Pitch Master', description: 'Awarded for completing the Pitch & Scale phase.' },
          { type: 'ideation-expert', name: 'Ideation Expert', description: 'Awarded for completing the Ideation phase.' },
          { type: 'validation-pro', name: 'Validation Pro', description: 'Awarded for completing the Validation phase.' },
          { type: 'mvp-builder', name: 'MVP Builder', description: 'Awarded for completing the MVP phase.' },
          { type: 'launch-champion', name: 'Launch Champion', description: 'Awarded for completing the Launch phase.' },
          { type: 'feedback-guru', name: 'Feedback Guru', description: 'Awarded for completing the Feedback & Iterate phase.' },
          { type: 'monetization-master', name: 'Monetization Master', description: 'Awarded for completing the Monetization phase.' },
        ];
      } else {
        throw new Error('Failed to fetch badge types');
      }
    } catch (error) {
      console.warn('Backend not available, using default badge types:', error.message);
      return [
        { type: 'pitch-master', name: 'Pitch Master', description: 'Awarded for completing the Pitch & Scale phase.' },
        { type: 'ideation-expert', name: 'Ideation Expert', description: 'Awarded for completing the Ideation phase.' },
        { type: 'validation-pro', name: 'Validation Pro', description: 'Awarded for completing the Validation phase.' },
        { type: 'mvp-builder', name: 'MVP Builder', description: 'Awarded for completing the MVP phase.' },
        { type: 'launch-champion', name: 'Launch Champion', description: 'Awarded for completing the Launch phase.' },
        { type: 'feedback-guru', name: 'Feedback Guru', description: 'Awarded for completing the Feedback & Iterate phase.' },
        { type: 'monetization-master', name: 'Monetization Master', description: 'Awarded for completing the Monetization phase.' },
      ];
    }
  },

  // Check if backend is available
  isBackendAvailable: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/badges/types/`, {
        method: 'HEAD',
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get all badges (both from backend and local storage)
  getAllBadges: async (userId) => {
    const backendBadges = await badgeService.getUserBadges(userId);
    const localBadges = getLocalBadges();
    
    // Combine and deduplicate badges
    const allBadges = [...backendBadges];
    localBadges.forEach(localBadge => {
      if (!allBadges.find(b => b.transaction_hash === localBadge.transaction_hash)) {
        allBadges.push(localBadge);
      }
    });
    
    return allBadges;
  },

  // Clear local badges (for testing)
  clearLocalBadges: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
}; 