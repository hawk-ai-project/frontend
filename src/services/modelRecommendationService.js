import { apiClient } from "./apiClient";

const recommend = (contextType, inspectionId) =>
  apiClient
    .post("/ai/model-recommendations", {
      contextType,
      ...(inspectionId == null ? {} : { inspectionId }),
    })
    .then(({ data }) => data);

export const modelRecommendationService = {
  recommendGlobal: () =>
    apiClient.get("/ai/model-recommendations/cached/global").then(({ data }) => data),
  recommendInspection: (inspectionId) => recommend("INSPECTION", inspectionId),
  recommendReinspection: (inspectionId) =>
    apiClient.get(`/ai/model-recommendations/cached/reinspections/${inspectionId}`).then(({ data }) => data),
};
