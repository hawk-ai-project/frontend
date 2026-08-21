export const ROUTES = Object.freeze({
  home: "/",
  login: "/login",
  signup: "/signup",
  profile: "/profile",
  inspection: "/inspection",
  histories: "/histories",
  analytics: "/analytics",
  boards: "/boards",
  hokeytoon: "/hokeytoon",
  boardWrite: "/boards/write",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminBoards: "/admin/boards",
  adminComments: "/admin/comments",
  adminActivity: "/admin/activity",
  adminDetections: "/admin/ai/detections",
  adminAiData: "/admin/ai/data",
  adminAiModels: "/admin/ai/models",
  adminSettings: "/admin/settings",
  adminForbiddenWords: "/admin/settings/forbidden-words",

  // ★ 동적 메뉴 관리 화면 경로 추가
  adminMenus: "/menu",

  // masterData 경로
  masterData: "/master-data",
  masterDataWastes: "/master-data/wastes",
  masterDataLocations: "/master-data/locations",
});
