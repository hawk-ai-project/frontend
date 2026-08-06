import { apiClient } from './apiClient';

export const boardService = {
  list: (params) => apiClient.get('/boards', { params }).then(({ data }) => data),
  detail: (id) => apiClient.get(`/boards/${id}`).then(({ data }) => data),
  create: (payload) => apiClient.post('/boards', payload).then(({ data }) => data),
  update: (id, payload) => apiClient.patch(`/boards/${id}`, payload).then(({ data }) => data),
  remove: (id) => apiClient.delete(`/boards/${id}`).then(({ data }) => data),
};
