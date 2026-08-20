"use client";

import { useState, useEffect, useCallback } from "react";

export default function MenuHeader({ onCreateMenu, menus = [] }) {
  const [formData, setFormData] = useState({
    parent_id: "",
    name: "",
    path: "",
    icon: "",
    menu_type: "PAGE",
    description: "",
    sort_order: 1,
    is_use: true,
    is_admin_only: false,
  });

  // 상위 메뉴(parent_id)에 따른 다음 정렬 순서 계산 함수
  const calculateNextSortOrder = useCallback((parentId, menuList) => {
    if (!parentId) {
      const topMenus = menuList.filter((m) => !m.parent_id);
      if (topMenus.length === 0) return 1;
      const maxOrder = Math.max(
        ...topMenus.map((m) => Number(m.sort_order) || 0),
      );
      return maxOrder + 1;
    } else {
      const childMenus = menuList.filter(
        (m) => String(m.parent_id) === String(parentId),
      );
      if (childMenus.length === 0) return 1;
      const maxOrder = Math.max(
        ...childMenus.map((m) => Number(m.sort_order) || 0),
      );
      return maxOrder + 1;
    }
  }, []);

  // ★ parent_id 변경 시 sort_order 자동 계산 및 상위 메뉴 권한 연동
  useEffect(() => {
    const nextOrder = calculateNextSortOrder(formData.parent_id, menus);

    // 선택된 상위 메뉴 객체 찾기
    const parentMenu = menus.find(
      (m) => String(m.id) === String(formData.parent_id),
    );

    // 상위 메뉴가 관리자 전용(true)이면 true, 아니거나 최상위 메뉴면 false
    const parentIsAdminOnly = Boolean(parentMenu?.is_admin_only);

    setFormData((prev) => ({
      ...prev,
      sort_order: nextOrder,
      is_admin_only: parentIsAdminOnly, // ★ 상위 메뉴 권한 상태에 따라 자동 변경
    }));
  }, [formData.parent_id, menus, calculateNextSortOrder]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "is_use" || name === "is_admin_only"
            ? value === "true"
            : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await onCreateMenu(formData);
    if (success) {
      const nextOrder = calculateNextSortOrder("", menus);
      setFormData({
        parent_id: "",
        name: "",
        path: "",
        icon: "",
        menu_type: "PAGE",
        description: "",
        sort_order: nextOrder,
        is_use: true,
        is_admin_only: false,
      });
    }
  };

  return (
    <article className="card card-pad" style={{ marginBottom: "24px" }}>
      <form onSubmit={handleFormSubmit}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
            신규 메뉴 등록
          </h2>
          <button className="btn btn-primary" type="submit">
            메뉴 등록
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              상위 메뉴
            </label>
            <select
              className="input"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleFormChange}
            >
              <option value="">최상위 메뉴 (그룹)</option>
              {menus
                .filter((m) => !m.parent_id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.is_admin_only ? "(관리자)" : ""}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              메뉴명
            </label>
            <input
              className="input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              placeholder="예: 메뉴 관리"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              경로 (Path)
            </label>
            <input
              className="input"
              type="text"
              name="path"
              value={formData.path}
              onChange={handleFormChange}
              required
              placeholder="예: /menus"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              메뉴 유형
            </label>
            <select
              className="input"
              name="menu_type"
              value={formData.menu_type}
              onChange={handleFormChange}
            >
              <option value="PAGE">PAGE</option>
              <option value="GROUP">GROUP</option>
              <option value="ACTION">ACTION</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              정렬 순서
            </label>
            <input
              className="input"
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              사용 여부
            </label>
            <select
              className="input"
              name="is_use"
              value={formData.is_use ? "true" : "false"}
              onChange={handleFormChange}
            >
              <option value="true">사용</option>
              <option value="false">미사용</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              접근 권한
            </label>
            <select
              className="input"
              name="is_admin_only"
              value={formData.is_admin_only ? "true" : "false"}
              onChange={handleFormChange}
              style={{
                color: formData.is_admin_only ? "#e11d48" : "#334155",
                fontWeight: "600",
              }}
            >
              <option value="false" style={{ color: "#334155" }}>
                전체 (일반 사용자)
              </option>
              <option value="true" style={{ color: "#e11d48" }}>
                관리자 전용 (ADMIN)
              </option>
            </select>
          </div>
        </div>
      </form>
    </article>
  );
}
