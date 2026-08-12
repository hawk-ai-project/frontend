import { apiClient } from "./apiClient";

function normalizeComment(comment) {
  return {
    ...comment,
    replies: (comment.replies || []).map(normalizeComment),
  };
}

export const hokeytoonService = {
  comments: (episodeId) =>
    apiClient.get(`/hokeytoon/${episodeId}/comments`).then(({ data }) => data.map(normalizeComment)),
  createComment: (episodeId, payload) =>
    apiClient.post(`/hokeytoon/${episodeId}/comments`, payload).then(({ data }) => normalizeComment(data)),
  updateComment: (commentId, payload) =>
    apiClient.patch(`/hokeytoon/comments/${commentId}`, payload).then(({ data }) => normalizeComment(data)),
  removeComment: (commentId) => apiClient.delete(`/hokeytoon/comments/${commentId}`),
};
