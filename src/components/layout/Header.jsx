"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import AuthNavigation from "./AuthNavigation";
import MobileNavigation from "./MobileNavigation";
import { menuService } from "@/services/menuService";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth"; // ★ 1. useAuth hook 추가[cite: 12]

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth(); // ★ 2. 로그인 사용자 정보 가져오기[cite: 12]
  const [navigation, setNavigation] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    menuService
      .getMenuTree()
      .then((data) => setNavigation(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Menu fetch failed:", err));
  }, []);

  // ★ 3. 상위 메뉴 및 하위(sub) 메뉴 권한 필터링
  const visibleMenus = navigation
    .filter(
      (item) =>
        item.label !== "기준정보" &&
        !item.href?.startsWith(ROUTES.masterData),
    )
    .filter((item) => !(item.is_admin_only && user?.role !== "ADMIN"))
    .map((item) => ({
      ...item,
      children: item.children
        ? item.children.filter(
            (sub) => !(sub.is_admin_only && user?.role !== "ADMIN"),
          )
        : [],
    }));

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Hawk-AI 홈으로 이동">
          <Image
            src="/images/common/logo1.png"
            alt="Hawk-AI"
            width={150}
            height={56}
            priority
          />
        </Link>
        <nav className="nav" ref={dropdownRef} aria-label="주요 메뉴">
          {/* ★ 4. navigation 대신 필터링된 visibleMenus 사용 */}
          {visibleMenus.map((item) => {
            const hasChildren = Boolean(
              item.children && item.children.length > 0,
            );

            if (hasChildren) {
              return (
                <div key={item.id} className="nav-dropdown">
                  <Link
                    href={item.href}
                    className={isActive(item.href) ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenuId((currentId) =>
                        currentId === item.id ? null : item.id,
                      );
                    }}
                  >
                    {item.label}
                  </Link>

                  {openMenuId === item.id && (
                    <div className="sub-menu">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={`sub-menu-item ${isActive(sub.href) ? "active" : ""}`}
                          onClick={() => setOpenMenuId(null)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                className={isActive(item.href) ? "active" : ""}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          <AuthNavigation />
          {/* ★ 5. MobileNavigation으로 전달하는 props도 visibleMenus로 변경 */}
          <MobileNavigation navigation={visibleMenus} />
        </div>
      </div>
    </header>
  );
}
