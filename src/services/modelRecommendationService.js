import { apiClient } from "./apiClient";

const recommend = (contextType, inspectionId) =>
  apiClient
    .post("/ai/model-recommendations", {
      contextType,
      ...(inspectionId == null ? {} : { inspectionId }),
    })
    .then(({ data }) => data);

export const modelRecommendationService = {
  recommendGlobal: () => recommend("GLOBAL"),
  recommendInspection: (inspectionId) => recommend("INSPECTION", inspectionId),
  recommendReinspection: (inspectionId) => recommend("REINSPECTION", inspectionId),
};
