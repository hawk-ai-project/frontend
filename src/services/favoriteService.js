import { apiClient } from "./apiClient";

export const favoriteService = {
  /**
   * 자주 방문한 메뉴 (Top 5) 조회
   */
  getTop5Favorites: async () => {
    const response = await apiClient.get("/favorites/top5");
    return response.data || response;
  },

  /**
   * 페이지 방문 시 자동 기록
   */
  logPageVisit: async (pageData) => {
    const response = await apiClient.post("/favorites", pageData);
    return response.data || response;
  },

  /**
   * 즐겨찾기 항목 클릭 기록
   */
  recordClick: async (favoriteId) => {
    const response = await apiClient.post(`/favorites/${favoriteId}/click`);
    return response.data || response;
  },

  /**
   * 즐겨찾기 항목 삭제
   */
  deleteFavorite: async (favoriteId) => {
    const response = await apiClient.delete(`/favorites/${favoriteId}`);
    return response.data || response;
  },
};
