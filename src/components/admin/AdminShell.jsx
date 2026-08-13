"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import UserAvatar from "@/components/common/UserAvatar";

const ADMIN_MENU = [
  { key: "dashboard", label: "대시보드", icon: "home", href: ROUTES.admin },
  {
    key: "ai",
    label: "AI 관리",
    icon: "board",
    children: [{ href: ROUTES.adminDetections, label: "탐지 결과 검수" }],
  },
  {
    key: "users",
    label: "회원 관리",
    icon: "users",
    children: [
      { href: ROUTES.adminUsers, label: "회원 목록" },
      { href: `${ROUTES.adminUsers}/permissions`, label: "권한 관리" },
    ],
  },
  { key: "boards", label: "게시글 관리", icon: "board", href: ROUTES.adminBoards },
  { key: "comments", label: "댓글 관리", icon: "comments", href: ROUTES.adminComments },
  {
    key: "settings",
    label: "시스템 설정",
    icon: "settings",
    children: [
      { href: ROUTES.adminSettings, label: "서비스 설정" },
      { href: `${ROUTES.adminSettings}/security`, label: "세션 및 보안" },
      { href: ROUTES.adminForbiddenWords, label: "금칙어 관리" },
    ],
  },
];

function MenuIcon({ name }) {
  if (name === "home") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z" /></svg>;
  }
  if (name === "board") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4V4Zm4 4h8M8 12h8M8 16h5" /></svg>;
  }
  if (name === "users") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  }
  if (name === "comments") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8ZM8 9h8M8 13h5" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></svg>;
}

export default function AdminShell({ children }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const currentPath = usePathname() || ROUTES.admin;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState(() => currentPath.startsWith(ROUTES.adminSettings) ? "settings" : currentPath.startsWith(ROUTES.adminUsers) ? "users" : currentPath.startsWith("/admin/ai") ? "ai" : null);
  const isAdmin = isAuthenticated && user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace(isAuthenticated ? ROUTES.home : ROUTES.login);
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading || !isAdmin) {
    return <div className="admin-loading"><span className="admin-spinner" />관리자 권한을 확인하고 있습니다.</div>;
  }

  const toggleMenu = (key) => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setOpenMenu(key);
      return;
    }
    setOpenMenu((current) => current === key ? null : key);
  };

  return (
    <div className={`admin-layout${sidebarOpen ? "" : " sidebar-collapsed"}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href={ROUTES.home} aria-label="Hawk-AI 홈으로 이동">
            <Image src="/images/common/logo1.png" alt="Hawk-AI" width={132} height={44} priority />
          </Link>
          <button type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"} aria-expanded={sidebarOpen}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={sidebarOpen ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} /></svg>
          </button>
        </div>
        <nav aria-label="관리자 메뉴">
          {ADMIN_MENU.map((item) => {
            const children = item.children ?? [];
            const active = item.href ? currentPath === item.href : children.some((child) => currentPath === child.href);
            if (item.href) {
              return (
                <div className={`admin-menu-group${active ? " active" : ""}`} key={item.key}>
                  <Link className="admin-menu-parent" href={item.href} title={sidebarOpen ? undefined : item.label}>
                    <span className="admin-menu-icon"><MenuIcon name={item.icon} /></span>
                    <span className="admin-menu-label">{item.label}</span>
                  </Link>
                </div>
              );
            }
            const expanded = openMenu === item.key && sidebarOpen;
            return (
              <div className={`admin-menu-group${active ? " active" : ""}`} key={item.key}>
                <button type="button" className="admin-menu-parent" onClick={() => toggleMenu(item.key)} aria-expanded={expanded} title={sidebarOpen ? undefined : item.label}>
                  <span className="admin-menu-icon"><MenuIcon name={item.icon} /></span>
                  <span className="admin-menu-label">{item.label}</span>
                  <svg className={`admin-menu-chevron${expanded ? " expanded" : ""}`} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                </button>
                {expanded && (
                  <div className="admin-submenu">
                    {children.map((child) => (
                      <Link key={child.href} href={child.href} className={currentPath === child.href ? "active" : ""}>{child.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <span>{user?.name || "관리자"}</span><small>{user?.email || ""}</small><Link href={ROUTES.home}>서비스로 돌아가기</Link>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-account">
            <div className="profile"><UserAvatar user={user} fallback="A" /><span>{user?.name || "관리자"} <small>({user?.role})</small></span></div>
            <button type="button" className="logout-btn" onClick={logout}>로그아웃</button>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </div>
    </div>
  );
}
