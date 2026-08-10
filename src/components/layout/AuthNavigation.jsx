"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

export default function AuthNavigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <span className="auth-status auth-status-placeholder" aria-label="인증 상태 확인 중" />;
  }
  if (!isAuthenticated) {
    return (
      <div className="auth-guest">
        <Link href={ROUTES.login}>로그인</Link>
        <span className="auth-divider">/</span>
        <Link href={ROUTES.signup}>회원가입</Link>
      </div>
    );
  }

  return (
    <div className="auth-user">
      <details className="user-menu">
        <summary className="profile" aria-label="사용자 메뉴 열기">
          <div className="avatar">{user?.name?.[0] || "U"}</div>
          <span>{user?.name} <small>({user?.role})</small></span>
          <svg className="user-menu-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
        </summary>
        <div className="user-menu-dropdown">
          <div className="user-menu-info"><strong>{user?.name}</strong><small>{user?.email}</small></div>
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
