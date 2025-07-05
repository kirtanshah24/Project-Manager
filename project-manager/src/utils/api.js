const API_BASE_URL = 'http://localhost:4000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('freelancer_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return apiCall('/auth/me');
  },
};

// Client API calls
export const clientAPI = {
  // Get all clients
  getClients: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/clients?${queryString}` : '/clients';
    return apiCall(endpoint);
  },

  // Get single client
  getClient: async (id) => {
    return apiCall(`/clients/${id}`);
  },

  // Add new client
  addClient: async (clientData) => {
    return apiCall('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  // Update client
  updateClient: async (id, clientData) => {
    return apiCall(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  // Delete client
  deleteClient: async (id) => {
    return apiCall(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
}; 