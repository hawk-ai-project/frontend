import { apiClient } from "./apiClient";

function absoluteApiUrl(path) {
  if (/^https?:\/\//.test(path)) return path;
  const baseURL = apiClient.defaults.baseURL || "/api";
  const apiOrigin = baseURL.replace(/\/api\/?$/, "");
  return `${apiOrigin}${path}`;
}

function normalizeBoard(board) {
  if (!board?.author?.profileImageUrl) return board;
  return {
    ...board,
    author: {
      ...board.author,
      profileImageUrl: absoluteApiUrl(board.author.profileImageUrl),
    },
  };
}

export const boardService = {
  list: (params) =>
    apiClient.get("/boards", { params }).then(({ data }) => data),
  detail: (id) => apiClient.get(`/boards/${id}`).then(({ data }) => normalizeBoard(data)),
  create: (payload) =>
    apiClient.post("/boards", payload).then(({ data }) => data),
  update: (id, payload) =>
    apiClient.patch(`/boards/${id}`, payload).then(({ data }) => data),
  remove: (id) => apiClient.delete(`/boards/${id}`).then(({ data }) => data),
  uploadImage: (file) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient
      .post("/boards/images", body, { timeout: 60000 })
      .then(({ data }) => ({ ...data, imageUrl: absoluteApiUrl(data.imageUrl) }));
  },
  copyInspectionImage: (inspectionId) =>
    apiClient
      .post(`/boards/images/from-inspection/${inspectionId}`)
      .then(({ data }) => ({ ...data, imageUrl: absoluteApiUrl(data.imageUrl) })),
  generateDraft: (payload) =>
    apiClient.post("/boards/ai/generate", payload).then(({ data }) => data),
  aiJobs: () => apiClient.get("/boards/ai/jobs").then(({ data }) => data),
  aiJob: (jobId) =>
    apiClient.get(`/boards/ai/generate/${jobId}`).then(({ data }) => data),
  readAIJob: (jobId) =>
    apiClient.patch(`/boards/ai/generate/${jobId}/read`).then(({ data }) => data),
};
