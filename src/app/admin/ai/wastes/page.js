import WasteClient from "@/components/master-data/wastes/WasteClient";

export const metadata = { title: "폐기물 유형 관리" };

export default function AdminWasteTypesPage() {
  return (
    <div className="admin-page admin-management-page">
      <header className="admin-page-head">
        <div>
          <span className="admin-kicker">AI DATA</span>
          <h1>폐기물 유형 관리</h1>
          <p>AI 탐지와 데이터 분류에 사용하는 폐기물 클래스 정보를 관리합니다.</p>
        </div>
      </header>
      <div className="admin-management-content">
        <WasteClient />
      </div>
    </div>
  );
}