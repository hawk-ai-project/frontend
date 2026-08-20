// src/services/menuService.js
import { apiClient } from "./apiClient";

export const menuService = {
  /**
   * Header 및 MobileNavigation용 계층형 트리 메뉴 조회
   */
  getMenuTree: () => apiClient.get("/menus/tree").then(({ data }) => data),

  /**
   * 관리자 화면용 전체 메뉴 목록 조회 (Flat)
   */
  getAllMenus: () => apiClient.get("/menus").then(({ data }) => data),

  /**
   * 메뉴 생성
   */
  createMenu: (menuData) =>
    apiClient.post("/menus", menuData).then(({ data }) => data),

  /**
   * 메뉴 수정 (PATCH 방식)
   */
  updateMenu: (id, menuData) =>
    apiClient.patch(`/menus/${id}`, menuData).then(({ data }) => data),
};
