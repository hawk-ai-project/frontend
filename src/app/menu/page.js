import MenuClient from "@/components/menu/MenuClient";

export const metadata = {
  title: "메뉴 관리 | Hawk-AI",
};

export default function MenusPage() {
  return (
    <div className="page-shell menu-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Menu Management</div>
          <h1>메뉴 관리</h1>
          <p className="subtitle">
            메뉴 추가, 수정, 삭제를 관리하는 페이지입니다.
          </p>
        </div>
      </div>

      <MenuClient />
    </div>
  );
}
