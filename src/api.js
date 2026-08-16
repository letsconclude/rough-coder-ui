const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Authentication endpoints
export const auth = {
  signin: async (email, password) => {
    return apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (fullName, email, password) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
};

// Blog/Articles endpoints
export const articles = {
  getAll: async (search = '', category = '', page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('page', page);
    params.append('limit', limit);

    return apiCall(`/articles?${params.toString()}`, {
      method: 'GET',
    });
  },

  getFeatured: async () => {
    return apiCall('/articles/featured', {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return apiCall(`/articles/${id}`, {
      method: 'GET',
    });
  },
};

// Categories endpoints
export const categories = {
  getAll: async () => {
    return apiCall('/categories', {
      method: 'GET',
    });
  },
};

// Newsletter endpoints
export const newsletter = {
  subscribe: async (email) => {
    return apiCall('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

export default {
  API_BASE_URL,
  auth,
  articles,
  categories,
  newsletter,
};
