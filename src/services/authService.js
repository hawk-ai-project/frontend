import { apiClient } from './apiClient';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials).then(({ data }) => data),
  signup: (payload) => apiClient.post('/auth/signup', payload).then(({ data }) => data),
  me: () => apiClient.get('/auth/me').then(({ data }) => data),
  logout: () => apiClient.post('/auth/logout').then(({ data }) => data),
};
