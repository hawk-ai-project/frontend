"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function AuthNavigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  if (isLoading) return <span className="auth-status">인증 확인 중</span>;
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
      <div className="profile">
        <div className="avatar">{user?.name?.[0] || "사"}</div>
        <span>
          {user?.name} <small>({user?.role})</small>
        </span>
      </div>
      <button className="logout-btn" onClick={logout}>
        로그아웃
      </button>
    </div>
  );
}
