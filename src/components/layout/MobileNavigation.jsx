"use client";

import { useState } from "react";
import Link from "next/link";
import { NAVIGATION } from "@/constants/routes";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
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
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
