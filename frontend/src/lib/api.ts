import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/auth')) {
    localStorage.removeItem('token');
  }
  return Promise.reject(error);
});

export const apiService = {
  get: (url: string, params?: any) => api.get(url, { params }).then(res => res.data),
  post: (url: string, data?: any) => api.post(url, data).then(res => res.data),
  put: (url: string, data?: any) => api.put(url, data).then(res => res.data),
  delete: (url: string) => api.delete(url).then(res => res.data),
  
  bugs: {
    analyze: (submissionData: any) => api.post('/bugs/analyze', submissionData).then(res => res.data),
    list: (params?: any) => api.get('/bugs', { params }).then(res => res.data),
    get: (id: string | number) => api.get(`/bugs/${id}`).then(res => res.data),
    getReport: (id: string | number) => api.get(`/bugs/${id}/report`).then(res => res.data),
    resolve: (id: string | number, payload?: any) => api.post(`/bugs/${id}/resolve`, payload).then(res => res.data),
    checkDuplicates: (payload: { text: string; duplicate_threshold?: number; similar_threshold?: number }) =>
      api.post('/bugs/duplicate-check', payload).then(res => res.data),
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/bugs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data);
    },
  },

  knowledge: {
    list: (params?: any) => api.get('/knowledge', { params }).then(res => res.data),
    create: (data: any) => api.post('/knowledge', data).then(res => res.data),
    get: (id: string | number) => api.get(`/knowledge/${id}`).then(res => res.data),
  },

  auth: {
    login: (credentials: any) => api.post('/auth/login', credentials).then(res => res.data),
    register: (data: any) => api.post('/auth/register', data).then(res => res.data),
    me: () => api.get('/auth/me').then(res => res.data),
    updateProfile: (data: any) => api.put('/auth/profile', data).then(res => res.data),
    changePassword: (data: { current_password: string; new_password: string }) =>
      api.post('/auth/change-password', data).then(res => res.data),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.resolve({ success: true });
    },
  },

  team: {
    members: () => api.get('/team/members').then(res => res.data),
    invitations: () => api.get('/team/invitations').then(res => res.data),
    invite: (data: { name: string; email: string; role: string; message?: string }) =>
      api.post('/team/invite', data).then(res => res.data),
    cancelInvitation: (invId: string | number) =>
      api.delete(`/team/invitations/${invId}`).then(res => res.data),
    resendInvitation: (invId: string | number) =>
      api.post(`/team/invitations/${invId}/resend`).then(res => res.data),
    updateRole: (memberId: string | number, role: string) =>
      api.patch(`/team/members/${memberId}/role`, { role }).then(res => res.data),
    remove: (memberId: string | number) =>
      api.delete(`/team/members/${memberId}`).then(res => res.data),
  },

  settings: {
    get: () => api.get('/auth/settings').then(res => res.data),
    update: (data: any) => api.put('/auth/settings', data).then(res => res.data),
  },

  analytics: {
    dashboard: () => api.get('/analytics/dashboard').then(res => res.data),
    overview: () => api.get('/analytics/overview').then(res => res.data),
    severity: () => api.get('/analytics/severity-distribution').then(res => res.data),
    duplicateRate: () => api.get('/analytics/duplicate-rate').then(res => res.data),
  },

  reports: {
    generate: (type: string = 'weekly') => api.get('/reports/generate', { params: { report_type: type } }).then(res => res.data),
    exportCsvUrl: () => `${import.meta.env.VITE_API_URL || '/api'}/reports/export-csv`,
  },

  search: {
    query: (q: string) => api.get('/search', { params: { q } }).then(res => res.data),
  },

  notifications: {
    list: () => api.get('/auth/notifications').then(res => res.data),
    markRead: (id: number | string) => api.post(`/auth/notifications/${id}/read`).then(res => res.data),
    markAllRead: () => api.post('/auth/notifications/read-all').then(res => res.data),
  },
};

export default api;

