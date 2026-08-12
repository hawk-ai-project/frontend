"use client";

import { useState } from "react";
import Link from "next/link";
import { NAVIGATION, ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const closeMenu = () => setOpen(false);
  return (
    <div className="mobile-navigation">
      <button
        className="icon-btn mobile-menu"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ☰
      </button>
      {open && (
        <nav className="mobile-nav-panel" aria-label="모바일 메뉴">
          {NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          {!isLoading && !isAuthenticated && (
            <div className="mobile-auth-links">
              <Link href={ROUTES.login} onClick={closeMenu}>
                로그인
              </Link>
              <Link
                className="mobile-signup-link"
                href={ROUTES.signup}
                onClick={closeMenu}
              >
                회원가입
              </Link>
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
