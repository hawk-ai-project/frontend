import { apiClient } from "./apiClient";

const recommend = (contextType, inspectionId) =>
  apiClient
    .post("/ai/model-recommendations", {
      // 추천 범위와 기준 점검을 함께 전달해 Context를 구분
      contextType,
      ...(inspectionId == null ? {} : { inspectionId }),
    })
    .then(({ data }) => data);

export const modelRecommendationService = {
  // GLOBAL: 전체 후보 모델의 공통 추천
  recommendGlobal: () =>
    apiClient
      .get("/ai/model-recommendations/cached/global")
      .then(({ data }) => data),

  // INSPECTION: 특정 점검 정보를 반영한 추천
  recommendInspection: (inspectionId) => recommend("INSPECTION", inspectionId),

  // REINSPECTION: 오탐·미탐 검토 결과를 반영한 추천
  recommendReinspection: (inspectionId) =>
    apiClient
      .get(`/ai/model-recommendations/cached/reinspections/${inspectionId}`)
      .then(({ data }) => data),
};
