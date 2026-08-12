"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { NAVIGATION, ROUTES } from "@/constants/routes";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();
  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    await logout();
  };

  return <div className="mobile-navigation">
    <button className="icon-btn mobile-menu" type="button" aria-label="메뉴 열기" aria-expanded={open} onClick={() => setOpen((value) => !value)}>☰</button>
    {open && <nav className="mobile-nav-panel" aria-label="모바일 메뉴">
      {NAVIGATION.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}
      {!isLoading && <div className="mobile-nav-auth">
        {isAuthenticated ? <button type="button" onClick={handleLogout}>로그아웃</button> : <><a href={ROUTES.login}>로그인</a><a href={ROUTES.signup}>회원가입</a></>}
      </div>}
    </nav>}
  </div>;
}
