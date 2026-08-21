import { apiClient } from "./apiClient";

export const wastesService = {
  /**
   * 전체 폐기물 유형 목록 조회
   */
  getWasteTypes: () => apiClient.get("/wastes").then(({ data }) => data),

  /**
   * 특정 폐기물 유형 상세 조회
   */
  getWasteType: (id) => apiClient.get(`/wastes/${id}`).then(({ data }) => data),

  /**
   * 폐기물 유형 생성
   */
  createWasteType: (data) =>
    apiClient.post("/wastes", data).then(({ data }) => data),

  /**
   * 폐기물 유형 수정 (PATCH)
   */
  updateWasteType: (id, data) =>
    apiClient.patch(`/wastes/${id}`, data).then(({ data }) => data),

  /**
   * 폐기물 유형 삭제
   */
  deleteWasteType: (id) =>
    apiClient.delete(`/wastes/${id}`).then(({ data }) => data),
};
