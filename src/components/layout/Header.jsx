'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthNavigation from './AuthNavigation';
import MobileNavigation from './MobileNavigation';
import { NAVIGATION } from '@/constants/routes';

export default function Header() {
  const pathname = usePathname();
  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Hawk-AI 홈으로 이동">
          <Image src="/images/common/logo1.png" alt="Hawk-AI" width={150} height={56} priority />
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {NAVIGATION.map((item) => (
            <Link key={item.href} className={isActive(item.href) ? 'active' : ''} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <AuthNavigation />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
