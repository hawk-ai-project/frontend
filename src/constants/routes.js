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
  adminSettings: "/admin/settings",
  adminForbiddenWords: "/admin/settings/forbidden-words",
});

export const NAVIGATION = [
  { href: ROUTES.home, label: "HOME" },
  { href: ROUTES.inspection, label: "현장점검" },
  { href: ROUTES.histories, label: "점검이력" },
  { href: ROUTES.analytics, label: "통계분석" },
  { href: ROUTES.boards, label: "게시판" },
  { href: ROUTES.hokeytoon, label: "호키툰" },
];
