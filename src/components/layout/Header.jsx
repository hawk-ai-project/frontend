"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import AuthNavigation from "./AuthNavigation";
import MobileNavigation from "./MobileNavigation";
import { menuService } from "@/services/menuService";

export default function Header() {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    menuService
      .getMenuTree()
      .then((data) => setNavigation(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Menu fetch failed:", err));
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
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
        <nav className="nav" aria-label="주요 메뉴">
          {navigation.map((item) => {
            const hasChildren = Boolean(
              item.children && item.children.length > 0,
            );

            if (hasChildren) {
              return (
                <div key={item.id} className="nav-dropdown" ref={dropdownRef}>
                  <Link
                    href={item.href}
                    className={isActive(item.href) ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen((prev) => !prev);
                    }}
                  >
                    {item.label}
                  </Link>

                  {dropdownOpen && (
                    <div className="sub-menu">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={`sub-menu-item ${isActive(sub.href) ? "active" : ""}`}
                          onClick={() => setDropdownOpen(false)}
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
          <MobileNavigation navigation={navigation} />
        </div>
      </div>
    </header>
  );
}
