import { apiClient } from "./apiClient";

export const favoriteService = {
  /**
   * 자주 방문한 메뉴 (Top 5) 조회
   */
  getTop5Favorites: async () => {
    try {
      const response = await apiClient.get("/favorites/top5");
      return response.data || response;
    } catch (err) {
      if (err?.response?.status === 401) {
        console.warn("인증되지 않은 사용자입니다. (Top 5 조회 건너뜀)");
        return [];
      }
      console.error("Top 5 조회 중 오류 발생:", err);
      return [];
    }
  },

  /**
   * 페이지 방문 시 자동 기록
   */
  logPageVisit: async (pageData) => {
    try {
      const response = await apiClient.post("/favorites", pageData);
      return response.data || response;
    } catch (err) {
      if (err?.response?.status === 401) {
        console.warn("인증되지 않은 사용자입니다. (방문 기록 저장 건너뜀)");
        return null;
      }
      console.error("방문 기록 저장 중 오류 발생:", err);
      return null;
    }
  },

  /**
   * 즐겨찾기 항목 클릭 기록
   */
  recordClick: async (favoriteId) => {
    try {
      const response = await apiClient.post(`/favorites/${favoriteId}/click`);
      return response.data || response;
    } catch (err) {
      if (err?.response?.status === 401) {
        return null;
      }
      console.error("클릭 기록 중 오류 발생:", err);
      return null;
    }
  },

  /**
   * 즐겨찾기 항목 삭제
   */
  deleteFavorite: async (favoriteId) => {
    try {
      const response = await apiClient.delete(`/favorites/${favoriteId}`);
      return response.data || response;
    } catch (err) {
      if (err?.response?.status === 401) {
        return null;
      }
      console.error("즐겨찾기 삭제 중 오류 발생:", err);
      throw err;
    }
  },
};
