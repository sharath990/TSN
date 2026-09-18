import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (formData) => api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const subcategoryAPI = {
  getAll: (params) => api.get('/subcategories', { params }),
  getById: (id) => api.get(`/subcategories/${id}`),
  create: (data) => api.post('/subcategories', data),
  update: (id, data) => api.put(`/subcategories/${id}`, data),
  delete: (id) => api.delete(`/subcategories/${id}`),
};

export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (formData) => api.post('/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/services/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/services/${id}`),
};

export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancel: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  getStatus: (orderId) => api.get(`/payments/status/${orderId}`),
  verify: (orderId) => api.get(`/payments/verify/${orderId}`),
  refund: (orderId, data) => api.post(`/payments/refund/${orderId}`, data),
};

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  updateStatus: (id, data) => api.patch(`/customers/${id}/status`, data),
  getStats: () => api.get('/customers/stats'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
};

export const serviceAreaAPI = {
  getAll: (params) => api.get('/service-areas', { params }),
  getById: (id) => api.get(`/service-areas/${id}`),
  create: (data) => api.post('/service-areas', data),
  update: (id, data) => api.put(`/service-areas/${id}`, data),
  delete: (id) => api.delete(`/service-areas/${id}`),
  check: (lat, lng) => api.get('/service-areas/check', { params: { lat, lng } }),
};
