import { apiClient } from "./apiClient";

export const inspectionService = {
  create: (payload) =>
    apiClient
      .post("/inspection", payload, { timeout: 120000 })
      .then(({ data }) => data),
  recent: (limit = 100) =>
    apiClient
      .get("/inspection/histories", { params: { limit } })
      .then(({ data }) => data),
  image: (inspectionId, kind) =>
    apiClient
      .get(`/inspection/histories/${inspectionId}/image`, {
        params: kind ? { kind } : undefined,
        responseType: "blob",
      })
      .then(({ data }) => data),
  analyzeHistory: (inspectionId) =>
    apiClient
      .post(
        "/inspection/analyze",
        { inspection_id: inspectionId },
        {
          timeout: 120000,
        },
      )
      .then(({ data }) => data),
  detail: (inspectionId) =>
    apiClient
      .get(`/inspection/histories/${inspectionId}`)
      .then(({ data }) => data),
  delete: (inspectionId) =>
    apiClient.delete(`/inspection/histories/${inspectionId}`),
  assignees: () =>
    apiClient.get("/inspection/assignees").then(({ data }) => data),
  assign: (inspectionId, assigneeId) =>
    apiClient
      .patch(`/inspection/histories/${inspectionId}/assignee`, { assigneeId })
      .then(({ data }) => data),
};
