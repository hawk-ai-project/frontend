export const ROUTES = Object.freeze({
  home: "/",
  login: "/login",
  signup: "/signup",
  profile: "/profile",
  inspection: "/inspection",
  histories: "/histories",
  analytics: "/analytics",
  boards: "/boards",
  boardWrite: "/boards/write",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminBoards: "/admin/boards",
  adminSettings: "/admin/settings",
});

export const NAVIGATION = [
  { href: ROUTES.home, label: "HOME" },
  { href: ROUTES.inspection, label: "현장점검" },
  { href: ROUTES.histories, label: "점검이력" },
  { href: ROUTES.analytics, label: "통계분석" },
  { href: ROUTES.boards, label: "게시판" },
];
