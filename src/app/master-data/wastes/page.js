import WasteClient from "@/components/master-data/wastes/WasteClient";

export const metadata = {
  title: "폐기물 유형 관리 | Hawk-AI",
};

export default function WastePage() {
  return (
    <div className="page-shell waste-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Waste Management</div>
          <h1>폐기물 유형 관리</h1>
          <p className="subtitle">
            폐기물 유형 추가, 수정, 삭제를 관리하는 페이지입니다.
          </p>
        </div>
      </div>

      <WasteClient />
    </div>
  );
}
