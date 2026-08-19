import { apiClient } from "./apiClient";

export const historyService = {
  // 1. 점검 이력 목록 조회
  getHistories: (params) =>
    apiClient.get("/inspection/histories", { params }).then(({ data }) => data),

  // 2. 점검 이력 상세 조회
  getHistoryById: (id) =>
    apiClient.get(`/inspection/histories/${id}`).then(({ data }) => data),

  // 3. 점검 이미지 조회 (Blob)
  getHistoryImage: (id, kind = "ANNOTATED") =>
    apiClient
      .get(`/inspection/histories/${id}/image`, {
        params: { kind },
        responseType: "blob",
      })
      .then(({ data }) => data),

  // 3-1. 점검 이미지 URL 생성 헬퍼
  getInspectionImageUrl: (id, kind = "COLLECTION_PROOF") => {
    const baseURL = apiClient.defaults.baseURL || "/api";
    return `${baseURL}/inspection/histories/${id}/image?kind=${kind}`;
  },

  // 4. 담당자 목록 조회
  getAssignees: () =>
    apiClient.get("/inspection/assignees").then(({ data }) => data),

  // 5. 담당자 지정 (PATCH)
  assignHistory: (id, assigneeId) =>
    apiClient
      .patch(`/inspection/histories/${id}/assignee`, { assigneeId })
      .then(({ data }) => data),

  // 6. 점검 이력 삭제
  deleteHistory: (id) =>
    apiClient.delete(`/inspection/histories/${id}`).then(({ data }) => data),

  // 7. 점검 의견/후속 조치 저장 (PATCH)
  updateNotes: (id, notes) =>
    apiClient
      .patch(`/inspection/histories/${id}/notes`, { notes })
      .then(({ data }) => data),

  // 8. 수거 완료 증빙사진 업로드 (POST /api/inspection/histories/{id}/proof-image)
  uploadProofImage: (id, file) => {
    const formData = new FormData();
    if (file) formData.append("file", file);
    return apiClient
      .post(`/inspection/histories/${id}/proof-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => data);
  },

  // 9. 수거 작업 완료 처리 (PATCH /api/inspection/histories/{id}/complete)
  completeHistory: (id, file) => {
    const formData = new FormData();
    if (file) formData.append("afterImage", file);
    return apiClient
      .patch(`/inspection/histories/${id}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => data);
  },

  // 10. AI 수동 분석 실행 (POST /api/inspection/histories/{id}/analyze)
  analyzeImage: (id) =>
    apiClient
      .post(`/inspection/histories/${id}/analyze`)
      .then(({ data }) => data),
};
