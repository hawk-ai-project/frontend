import { apiClient } from "./apiClient";

export const historyService = {
  /**
   * 점검 이력 목록 조회 (조건 검색 대응)
   */
  getHistories: (params) =>
    apiClient.get("/inspection/histories", { params }).then(({ data }) => data),

  /**
   * 폐기물 유형 목록 조회
   */
  getWasteNames: () =>
    apiClient.get("/inspection/waste-types").then(({ data }) => data),

  /**
   * 점검 이력 상세 조회
   */
  getHistoryById: (id) =>
    apiClient.get(`/inspection/histories/${id}`).then(({ data }) => data),

  /**
   * 점검 이미지 다운로드 (Blob)
   */
  getHistoryImage: (id, kind = "ANNOTATED") =>
    apiClient
      .get(`/inspection/histories/${id}/image`, {
        params: { kind, _: Date.now() },
        responseType: "blob",
      })
      .then(({ data }) => data),

  /**
   * 점검 이미지 URL 생성 헬퍼
   */
  getInspectionImageUrl: (id, kind = "COLLECTION_PROOF") => {
    const baseURL = apiClient.defaults.baseURL || "/api";
    return `${baseURL}/inspection/histories/${id}/image?kind=${kind}`;
  },

  /**
   * 담당자 목록 조회
   */
  getAssignees: () =>
    apiClient.get("/inspection/assignees").then(({ data }) => data),

  /**
   * 담당자 지정
   */
  assignHistory: (id, assigneeId) =>
    apiClient
      .patch(`/inspection/histories/${id}/assignee`, { assigneeId })
      .then(({ data }) => data),

  /**
   * 점검 이력 삭제
   */
  deleteHistory: (id) =>
    apiClient.delete(`/inspection/histories/${id}`).then(({ data }) => data),

  /**
   * 점검 의견/후속 조치 수정
   */
  updateNotes: (id, notes) =>
    apiClient
      .patch(`/inspection/histories/${id}/notes`, { notes })
      .then(({ data }) => data),

  // 상태 업데이트
  updateStatus: (id, status) =>
    apiClient
      .patch(`/inspection/histories/${id}/status`, { status })
      .then(({ data }) => data),

  /**
   * 수거 완료 증빙사진 업로드
   */
  uploadProofImage: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient
      .post(`/inspection/histories/${id}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => data);
  },

  /**
   * 수거 작업 완료 처리
   */
  completeHistory: (id, file) => {
    const formData = new FormData();
    if (file) {
      formData.append("afterImage", file);
    }
    return apiClient
      .patch(`/inspection/histories/${id}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => data);
  },

  /**
   * AI 분석 실행
   */
  analyzeImage: (id) =>
    apiClient
      .post(`/inspection/histories/${id}/analyze`)
      .then(({ data }) => data),

  /* =========================================================================
   * 재점검(Reinspection) 관련 API
   * (실제 백엔드 경로 /inspection/reinspection-targets 및 하위 호환 폴백 대응)
   * ========================================================================= */

  /**
   * 재점검 대상 목록 조회
   */
  getReinspectionTargets: async () => {
    try {
      const { data } = await apiClient.get("/inspection/reinspection-targets");
      return data;
    } catch (err) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.get("/reinspections");
        return data;
      }
      throw err;
    }
  },

  /**
   * 재점검 선택 항목 검수 완료 승인
   */
  approveReinspectionTargets: async (targetIds) => {
    const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
    const payload = { inspectionIds: ids, targetIds: ids, ids };
    try {
      const { data } = await apiClient.patch(
        "/inspection/reinspection-targets/approve",
        payload,
      );
      return data;
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const { data } = await apiClient.post(
          "/reinspections/approve",
          payload,
        );
        return data;
      }
      throw err;
    }
  },

  /**
   * 재점검 상세 데이터 조회
   */
  getReinspectionDetail: async (id) => {
    try {
      const { data } = await apiClient.get(
        `/inspection/reinspection-targets/${id}`,
      );
      return data;
    } catch (err) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.get(`/reinspections/${id}`);
        return data;
      }
      throw err;
    }
  },

  /**
   * 재점검 라벨링용 폐기물 클래스 목록 조회
   */
  getReinspectionClasses: async () => {
    try {
      const { data } = await apiClient.get(
        "/inspection/reinspection-targets/classes",
      );
      return data;
    } catch (err) {
      try {
        const { data } = await apiClient.get("/inspection/waste-types");
        return data;
      } catch {
        throw err;
      }
    }
  },

  getReinspectionModels: () =>
    apiClient
      .get("/inspection/reinspection-targets/models")
      .then(({ data }) => data),

  selectReinspectionModel: (inspectionId, modelId) =>
    apiClient
      .post(`/inspection/reinspection-targets/${inspectionId}/model/select`, {
        modelId,
      })
      .then(({ data }) => data),

  /**
   * 재점검 수동 라벨링 데이터 저장
   */
  saveReinspectionAnnotations: async (id, payload) => {
    try {
      const { data } = await apiClient.put(
        `/inspection/reinspection-targets/${id}/annotations`,
        payload,
      );
      return data;
    } catch (err) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.put(
          `/reinspections/${id}/annotations`,
          payload,
        );
        return data;
      }
      throw err;
    }
  },

  /**
   * 재점검 사용 모델 상세 지표 조회
   */
  getReinspectionModelDetail: async (id) => {
    try {
      const { data } = await apiClient.get(
        `/inspection/reinspection-targets/${id}/model`,
      );
      return data;
    } catch (err) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.get(`/reinspections/${id}/model`);
        return data;
      }
      throw err;
    }
  },

  /**
   * 재점검 모델 산출물 이미지 파일 조회 (Blob)
   */
  getReinspectionModelArtifact: async (id, path) => {
    const encodedPath = encodeURIComponent(path);
    try {
      const { data } = await apiClient.get(
        `/inspection/reinspection-targets/${id}/model/artifacts/${encodedPath}`,
        { responseType: "blob" },
      );
      return data;
    } catch (err) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.get(
          `/reinspections/${id}/artifacts/${encodedPath}`,
          { responseType: "blob" },
        );
        return data;
      }
      throw err;
    }
  },
};
