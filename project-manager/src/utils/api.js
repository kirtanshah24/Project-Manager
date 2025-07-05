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

// Project API calls
export const projectAPI = {
  // Get all projects
  getProjects: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    return apiCall(endpoint);
  },

  // Get single project
  getProject: async (id) => {
    return apiCall(`/projects/${id}`);
  },

  // Add new project
  addProject: async (projectData) => {
    return apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Update project
  updateProject: async (id, projectData) => {
    return apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  // Delete project
  deleteProject: async (id) => {
    return apiCall(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Archive/Unarchive project
  toggleArchiveProject: async (id, isArchived) => {
    return apiCall(`/projects/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived }),
    });
  },

  // Get project statistics
  getProjectStats: async () => {
    return apiCall('/projects/stats');
  },
};

// Task API calls
export const taskAPI = {
  // Get all tasks
  getTasks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return apiCall(endpoint);
  },

  // Get single task
  getTask: async (id) => {
    return apiCall(`/tasks/${id}`);
  },

  // Add new task
  addTask: async (taskData) => {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update task
  updateTask: async (id, taskData) => {
    return apiCall(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Delete task
  deleteTask: async (id) => {
    return apiCall(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Update task status
  updateTaskStatus: async (id, status) => {
    return apiCall(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Add time entry to task
  addTimeEntry: async (id, timeEntryData) => {
    return apiCall(`/tasks/${id}/time-entry`, {
      method: 'POST',
      body: JSON.stringify(timeEntryData),
    });
  },

  // Get task statistics
  getTaskStats: async () => {
    return apiCall('/tasks/stats');
  },
};

// Expense API calls
export const expenseAPI = {
  // Get all expenses
  getExpenses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/expenses?${queryString}` : '/expenses';
    return apiCall(endpoint);
  },

  // Get single expense
  getExpense: async (id) => {
    return apiCall(`/expenses/${id}`);
  },

  // Add new expense
  addExpense: async (expenseData) => {
    return apiCall('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    return apiCall(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  // Delete expense
  deleteExpense: async (id) => {
    return apiCall(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Update expense reimbursement status
  updateExpenseReimbursement: async (id, reimbursementData) => {
    return apiCall(`/expenses/${id}/reimbursement`, {
      method: 'PATCH',
      body: JSON.stringify(reimbursementData),
    });
  },

  // Get expense statistics
  getExpenseStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/expenses/stats?${queryString}` : '/expenses/stats';
    return apiCall(endpoint);
  },
}; 