const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('adminToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Generic request
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async post(endpoint, body = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async put(endpoint, body = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async patch(endpoint, body = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload/single`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async uploadMultipleFiles(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    const res = await fetch(`${API_BASE}/upload/multiple`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  // Products
  getProducts: (params) => api.get('/products', params),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  toggleProductStatus: (id, isActive) => api.patch(`/products/${id}/status`, { isActive }),
  toggleProductFeatured: (id, isFeatured) => api.patch(`/products/${id}/featured`, { isFeatured }),
  toggleProductTrending: (id, isTrending) => api.patch(`/products/${id}/trending`, { isTrending }),
  getProductFiltersMeta: () => api.get('/products/filters/meta'),
  
  // Track Click & get redirect URL (AJAX mode)
  trackClick: (productIdOrSlug) => api.get(`/products/${productIdOrSlug}/click`, { json: 'true' }),

  // Categories
  getCategories: (params) => api.get('/categories', params),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  toggleCategoryStatus: (id, isActive) => api.patch(`/categories/${id}/status`, { isActive }),

  // Admin Auth & Stats
  loginAdmin: (credentials) => api.post('/admin/login', credentials),
  getAdminProfile: () => api.get('/admin/me'),
  updateAdminProfile: (data) => api.put('/admin/profile', data),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getClickLogs: (params) => api.get('/admin/clicks', params),
};

export default api;
