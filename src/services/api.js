import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const entryService = {
  createEntry: (data) => api.post('/entries', data),
  getAllEntries: () => api.get('/entries'),
  getEntriesByMonth: (month) => api.get(`/entries/${month}`),
  getAllMonths: () => api.get('/months'),
  getProfitStats: () => api.get('/stats/profit'),
  deleteEntriesByMonth: (month) => api.delete(`/entries/month/${month}`),
  deleteMultipleEntries: (ids) => api.delete('/entries', { data: { ids } }),
  deleteEntry: (id) => api.delete(`/entries/${id}`),
  updateEntry: (id, data) => api.put(`/entries/${id}`, data),
};

export default api;
