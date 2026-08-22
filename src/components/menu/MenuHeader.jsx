"use client";

import { useEffect, useState } from "react";

const nextSortOrder = (parentId, menus) => {
  const siblings = menus.filter((menu) => parentId
    ? String(menu.parent_id) === String(parentId)
    : !menu.parent_id);
  return siblings.length ? Math.max(...siblings.map((menu) => Number(menu.sort_order) || 0)) + 1 : 1;
};

export default function MenuHeader({ onCreateMenu, menus = [], onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => ({
    parent_id: "", name: "", path: "", icon: "", menu_type: "PAGE",
    description: "", sort_order: nextSortOrder("", menus), is_use: true, is_admin_only: false,
  }));

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const change = (event) => {
    const { name, value } = event.target;
    if (name === "parent_id") {
      const parent = menus.find((menu) => String(menu.id) === String(value));
      setFormData((prev) => ({ ...prev, parent_id: value, sort_order: nextSortOrder(value, menus), is_admin_only: Boolean(parent?.is_admin_only) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: name === "is_use" || name === "is_admin_only" ? value === "true" : name === "sort_order" ? Number(value) : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const success = await onCreateMenu(formData);
    setSubmitting(false);
    if (success) onClose();
  };

  return <div className="admin-menu-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="admin-menu-modal" role="dialog" aria-modal="true" aria-labelledby="new-menu-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="admin-menu-modal-head">
        <div><span className="admin-kicker">SYSTEM MENU</span><h2 id="new-menu-title">신규 메뉴 등록</h2><p>메뉴 정보와 접근 권한을 설정합니다.</p></div>
        <button type="button" className="admin-menu-modal-close" onClick={onClose} aria-label="닫기">×</button>
      </header>
      <form onSubmit={submit}>
        <div className="admin-menu-modal-grid">
          <label><span>상위 메뉴</span><select className="input" name="parent_id" value={formData.parent_id} onChange={change}><option value="">최상위 메뉴</option>{menus.filter((menu) => !menu.parent_id).map((menu) => <option key={menu.id} value={menu.id}>{menu.name}{menu.is_admin_only ? " (관리자)" : ""}</option>)}</select></label>
          <label><span>메뉴명</span><input className="input" name="name" value={formData.name} onChange={change} required placeholder="예: 메뉴 관리" autoFocus /></label>
          <label><span>경로 (Path)</span><input className="input" name="path" value={formData.path} onChange={change} required placeholder="예: /menus" /></label>
          <label><span>메뉴 유형</span><select className="input" name="menu_type" value={formData.menu_type} onChange={change}><option value="PAGE">PAGE</option><option value="GROUP">GROUP</option><option value="ACTION">ACTION</option></select></label>
          <label><span>정렬 순서</span><input className="input" type="number" name="sort_order" value={formData.sort_order} onChange={change} min="1" /></label>
          <label><span>사용 여부</span><select className="input" name="is_use" value={String(formData.is_use)} onChange={change}><option value="true">사용</option><option value="false">미사용</option></select></label>
          <label><span>접근 권한</span><select className="input" name="is_admin_only" value={String(formData.is_admin_only)} onChange={change}><option value="false">전체 사용자</option><option value="true">관리자 전용</option></select></label>
        </div>
        <footer className="admin-menu-modal-actions"><button type="button" onClick={onClose}>취소</button><button type="submit" className="admin-primary-btn" disabled={submitting}>{submitting ? "등록 중..." : "메뉴 등록"}</button></footer>
      </form>
    </section>
  </div>;
}