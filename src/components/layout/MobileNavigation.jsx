"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNavigation({ navigation = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // ★ user 정보 추가 추출
  const { isAuthenticated, isLoading, user } = useAuth();

  const closeMenu = () => setOpen(false);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // ★ 모바일 메뉴 자체 2중 권한 필터링 (Header에서 넘어온 목록 필터링)
  const visibleMenus = navigation
    .filter((item) => !(item.is_admin_only && user?.role !== "ADMIN"))
    .map((item) => ({
      ...item,
      children: item.children
        ? item.children.filter(
            (sub) => !(sub.is_admin_only && user?.role !== "ADMIN"),
          )
        : [],
    }));

  return (
    <div className="mobile-navigation">
      <button
        className="icon-btn mobile-menu"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <nav className="mobile-nav-panel" aria-label="모바일 메뉴">
          {/* ★ navigation 대신 visibleMenus 사용 */}
          {visibleMenus.map((item) => {
            const hasChildren = Boolean(
              item.children && item.children.length > 0,
            );

            if (hasChildren) {
              return (
                <div key={item.id} className="mobile-nav-group">
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`mobile-nav-parent ${isActive(item.href) ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                  <div className="mobile-sub-menu">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        onClick={closeMenu}
                        className={`mobile-sub-item ${isActive(sub.href) ? "active" : ""}`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeMenu}
                className={isActive(item.href) ? "active" : ""}
              >
                {item.label}
              </Link>
            );
          })}

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
