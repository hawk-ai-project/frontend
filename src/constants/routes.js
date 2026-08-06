export const ROUTES = Object.freeze({
  home: "/",
  login: "/login",
  signup: "/signup",
  inspection: "/inspection",
  histories: "/histories",
  analytics: "/analytics",
  boards: "/boards",
  boardWrite: "/boards/write",
});

export const NAVIGATION = [
  { href: ROUTES.home, label: "HOME" },
  { href: ROUTES.inspection, label: "현장점검" },
  { href: ROUTES.histories, label: "점검이력" },
  { href: ROUTES.analytics, label: "통계분석" },
  { href: ROUTES.boards, label: "게시판" },
];
