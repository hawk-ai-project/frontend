import { apiClient } from "./apiClient";

export const inspectionService = {
  recent: (limit = 10) =>
    apiClient
      .get("/inspection/histories", { params: { limit } })
      .then(({ data }) => data),
  image: (inspectionId) =>
    apiClient
      .get(`/inspection/histories/${inspectionId}/image`, {
        responseType: "blob",
      })
      .then(({ data }) => data),
  detail: (inspectionId) =>
    apiClient
      .get(`/inspection/histories/${inspectionId}`)
      .then(({ data }) => data),
  assignees: () =>
    apiClient
      .get("/inspection/assignees")
      .then(({ data }) => data),
  assign: (inspectionId, assigneeId) =>
    apiClient
      .patch(`/inspection/histories/${inspectionId}/assignee`, { assigneeId })
      .then(({ data }) => data),
};
