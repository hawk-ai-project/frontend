import MenuClient from "@/components/menu/MenuClient";

export const metadata = { title: "메뉴 관리" };

export default function AdminMenusPage() {
  return (
    <div className="admin-page admin-management-page">
      <header className="admin-page-head">
        <div>
          <span className="admin-kicker">SYSTEM</span>
          <h1>메뉴 관리</h1>
          <p>서비스 메뉴의 구조, 노출 여부와 접근 권한을 관리합니다.</p>
        </div>
      </header>
      <div className="admin-management-content">
        <MenuClient />
      </div>
    </div>
  );
}