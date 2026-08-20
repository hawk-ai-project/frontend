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
  });

  // 상위 메뉴(parent_id)에 따른 다음 정렬 순서 계산 함수
  const calculateNextSortOrder = useCallback((parentId, menuList) => {
    if (!parentId) {
      // 1. 최상위 메뉴(그룹/단독 PAGE)인 경우: parent_id가 없는 항목들 중 최대값 + 1
      const topMenus = menuList.filter((m) => !m.parent_id);
      if (topMenus.length === 0) return 1;
      const maxOrder = Math.max(
        ...topMenus.map((m) => Number(m.sort_order) || 0),
      );
      return maxOrder + 1;
    } else {
      // 2. 특정 그룹 하위 메뉴인 경우: 해당 parent_id를 가진 항목들 중 최대값 + 1
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

  // parent_id가 바뀌거나 메뉴 목록(menus)이 전달/갱신될 때 sort_order 자동 계산
  useEffect(() => {
    const nextOrder = calculateNextSortOrder(formData.parent_id, menus);
    setFormData((prev) => ({
      ...prev,
      sort_order: nextOrder,
    }));
  }, [formData.parent_id, menus, calculateNextSortOrder]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "is_use"
            ? value === "true"
            : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await onCreateMenu(formData);
    if (success) {
      // 등록 성공 시 폼 초기화 (parent_id를 비워 최상위 메뉴 기준으로 재설정)
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
      });
    }
  };

  return (
    <article className="card card-pad" style={{ marginBottom: "24px" }}>
      <form onSubmit={handleFormSubmit}>
        {/* 상단 라인: 좌측 제목 / 우측 메뉴 등록 버튼 */}
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

        {/* 2열 입력 필드 레이아웃 */}
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
                    {m.name}
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
        </div>
      </form>
    </article>
  );
}
