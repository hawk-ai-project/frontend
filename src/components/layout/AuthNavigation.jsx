"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import BoardAINotifications from "@/components/board/BoardAINotifications";
import UserAvatar from "@/components/common/UserAvatar";

export default function AuthNavigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <span className="auth-status auth-status-placeholder" aria-label="인증 상태 확인 중" />;
  }
  if (!isAuthenticated) {
    return (
      <div className="auth-guest">
        <a href={ROUTES.login}>로그인</a>
        <span className="auth-divider">/</span>
        <a href={ROUTES.signup}>회원가입</a>
      </div>
    );
  }

  return (
    <div className="auth-user">
      <BoardAINotifications />
      <details className="user-menu">
        <summary className="profile" aria-label="사용자 메뉴 열기">
          <UserAvatar user={user} />
          <span>{user?.name} <small>({user?.role})</small></span>
          <svg className="user-menu-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
        </summary>
        <div className="user-menu-dropdown">
          <div className="user-menu-info"><strong>{user?.name}</strong><small>{user?.email}</small></div>
          <Link className="user-menu-item" href={ROUTES.profile || "/profile"}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            프로필 수정
          </Link>
          {user?.role === ROLES.ADMIN && (
            <Link className="user-menu-item" href={ROUTES.admin || "/admin"}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg>
              관리자 화면
            </Link>
          )}
          <button type="button" className="user-menu-item danger" onClick={logout}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></svg>
            로그아웃
          </button>
        </div>
      </details>
    </div>
  );
}
