const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sr_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      // Token might be invalid or expired
      localStorage.removeItem('sr_token');
      localStorage.removeItem('sr_user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    const message = data.message || (data.errors && data.errors.join(' ')) || 'An unexpected error occurred.';
    throw new Error(message);
  }
  return data;
};

export const api = {
  // Auth API
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    updatePassword: async (passwords) => {
      const res = await fetch(`${API_BASE}/auth/update-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwords)
      });
      return handleResponse(res);
    }
  },

  // Admin API
  admin: {
    getDashboardStats: async () => {
      const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getUsers: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/admin/users?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getStores: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/admin/stores?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getStoreOwners: async () => {
      const res = await fetch(`${API_BASE}/admin/store-owners`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    addUser: async (userData) => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    addStore: async (storeData) => {
      const res = await fetch(`${API_BASE}/admin/stores`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(storeData)
      });
      return handleResponse(res);
    }
  },

  // Stores API
  stores: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/stores?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Ratings API
  ratings: {
    submit: async ({ storeId, rating }) => {
      const res = await fetch(`${API_BASE}/ratings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ storeId, rating })
      });
      return handleResponse(res);
    },
    getOwnerDashboard: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/ratings/owner-dashboard?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};
