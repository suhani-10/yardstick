import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  return response.json();
};

export const notesApi = {
  getAll: () => apiCall('/notes'),
  create: (note) => apiCall('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  }),
  update: (id, note) => apiCall(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  }),
  delete: (id) => apiCall(`/notes/${id}`, {
    method: 'DELETE',
  }),
};

export const tenantsApi = {
  upgrade: (slug) => apiCall(`/tenants/${slug}/upgrade`, {
    method: 'POST',
  }),
};

export const adminApi = {
  getAnalytics: () => apiCall('/admin/analytics'),
  getUsers: () => apiCall('/admin/users'),
  getNotes: () => apiCall('/admin/notes'),
  createUser: (user) => apiCall('/admin/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  deleteUser: (userId) => apiCall(`/admin/users/${userId}`, {
    method: 'DELETE',
  }),
  getUpgradeRequests: () => apiCall('/upgrade-requests/admin'),
  approveUpgrade: (requestId) => apiCall(`/upgrade-requests/admin/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'approved' }),
  }),
  rejectUpgrade: (requestId) => apiCall(`/upgrade-requests/admin/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'rejected' }),
  }),
};

export const upgradeApi = {
  createRequest: () => apiCall('/upgrade-requests', {
    method: 'POST',
  }),
  getStatus: () => apiCall('/upgrade-requests/status'),
};