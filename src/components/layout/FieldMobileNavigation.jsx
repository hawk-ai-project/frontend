"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { isFieldInspectorRole } from "@/constants/roles";

const ITEMS = [
  { href: ROUTES.home, label: "홈", icon: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z" /> },
  { href: ROUTES.inspection, label: "현장점검", primary: true, icon: <><path d="M4 7.5h3L8.5 5h7L17 7.5h3a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="4"/></> },
  { href: ROUTES.histories, label: "점검이력", icon: <><path d="M5 3h14v18H5V3Z"/><path d="M8 8h8M8 12h8M8 16h5"/></> },
  { href: ROUTES.profile, label: "내 정보", icon: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></> },
];

export default function FieldMobileNavigation() {
  const pathname = usePathname() || ROUTES.home;
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !isFieldInspectorRole(user?.role) || pathname.startsWith("/admin")) return null;

  const active = (href) => href === ROUTES.home ? pathname === href : pathname.startsWith(href);
  return <>
    <header className="field-mobile-header">
      <Link href={ROUTES.home}><span>HAWK-AI</span><strong>현장 점검</strong></Link>
      <Link className="field-mobile-account" href={ROUTES.profile} aria-label="내 정보">{(user?.name || "점").slice(0, 1)}</Link>
    </header>
    <nav className="field-mobile-navigation" aria-label="현장 점검자 메뉴">
      {ITEMS.map((item) => <Link key={item.href} href={item.href} className={`${active(item.href) ? "active" : ""}${item.primary ? " primary" : ""}`}>
        <span><svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg></span><small>{item.label}</small>
      </Link>)}
    </nav>
  </>;
}