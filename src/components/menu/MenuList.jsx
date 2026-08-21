"use client";

import { useEffect, useMemo, useState } from "react";

export default function MenuList({
  menus = [],
  isLoading = false,
  onSaveBatch,
  isSaving = false,
}) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setItems(menus);
    if (
      menus.length > 0 &&
      (!selectedId || !menus.some((m) => m.id === selectedId))
    ) {
      setSelectedId(menus[0].id);
    }
  }, [menus]);

  const menuTree = useMemo(() => {
    const map = {};
    const roots = [];

    items.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  }, [items]);

  const selectedMenu = useMemo(() => {
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  const handleChange = (field, value) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSave = () => {
    if (onSaveBatch) {
      onSaveBatch(items);
    }
  };

  const renderTreeNode = (node, depth = 0) => {
    const isSelected = selectedId === node.id;
    const hasChildren = Boolean(node.children && node.children.length > 0);

    return (
      <div key={node.id}>
        <div
          onClick={() => setSelectedId(node.id)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            paddingLeft: `${depth * 20 + 12}px`,
            cursor: "pointer",
            borderRadius: "6px",
            marginBottom: "2px",
            backgroundColor: isSelected ? "#eff6ff" : "transparent",
            color: isSelected ? "#2563eb" : "#334155",
            fontWeight: isSelected ? "600" : "400",
            transition: "all 0.15s ease-in-out",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "14px" }}>
            {hasChildren ? "📁" : "📄"}
          </span>
          <span
            style={{
              fontSize: "14px",
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {node.name}
          </span>

          {Boolean(node.is_admin_only) ? (
            <span
              style={{
                fontSize: "11px",
                color: "#e11d48",
                fontWeight: "600",
                marginLeft: "4px",
              }}
            >
              (관리자)
            </span>
          ) : null}

          {!Boolean(node.is_use) ? (
            <span
              style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}
            >
              (미사용)
            </span>
          ) : null}
        </div>

        {hasChildren
          ? node.children.map((child) => renderTreeNode(child, depth + 1))
          : null}
      </div>
    );
  };

  return (
    <article className="card card-pad">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ fontSize: "14px", color: "#64748b" }}>
          좌측 트리를 클릭하여 메뉴를 선택 후 수정한 뒤 <b>저장</b> 버튼을
          누르세요.
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving || isLoading || items.length === 0}
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          minHeight: "420px",
        }}
      >
        {/* 좌측 메뉴 구조 트리 영역 */}
        <div
          style={{
            flex: "1 1 280px",
            borderRight: "1px solid #e2e8f0",
            paddingRight: "16px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 250px)",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "12px",
            }}
          >
            메뉴 구조
          </h3>
          {isLoading ? (
            <div
              style={{ padding: "20px", color: "#94a3b8", fontSize: "13px" }}
            >
              메뉴를 불러오는 중...
            </div>
          ) : menuTree.length > 0 ? (
            menuTree.map((node) => renderTreeNode(node, 0))
          ) : (
            <div
              style={{ padding: "20px", color: "#94a3b8", fontSize: "13px" }}
            >
              등록된 메뉴가 없습니다.
            </div>
          )}
        </div>

        {/* 우측 상세 정보 수정 영역 */}
        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "16px",
            }}
          >
            상세 정보 수정 {selectedMenu && `(ID: ${selectedMenu.id})`}
          </h3>

          {selectedMenu ? (
            <div className="menu-detail-grid">
              {/* JSX 내장 CSS를 활용하여 PC 2열 고정 / 모바일 1열 분기 */}
              <style jsx>{`
                .menu-detail-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
                }
                @media (max-width: 640px) {
                  .menu-detail-grid {
                    grid-template-columns: 1fr;
                  }
                }
              `}</style>

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
                  value={selectedMenu.parent_id || ""}
                  onChange={(e) =>
                    handleChange(
                      "parent_id",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">최상위 메뉴 (그룹)</option>
                  {items
                    .filter((m) => m.id !== selectedMenu.id)
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
                  value={selectedMenu.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
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
                  value={selectedMenu.path || ""}
                  onChange={(e) => handleChange("path", e.target.value)}
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
                  value={selectedMenu.menu_type || "PAGE"}
                  onChange={(e) => handleChange("menu_type", e.target.value)}
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
                  value={selectedMenu.sort_order ?? 0}
                  onChange={(e) =>
                    handleChange("sort_order", Number(e.target.value))
                  }
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
                  value={selectedMenu.is_use ? "true" : "false"}
                  onChange={(e) =>
                    handleChange("is_use", e.target.value === "true")
                  }
                  style={{
                    color: selectedMenu.is_use ? "#2563eb" : "#dc2626",
                    fontWeight: "600",
                  }}
                >
                  <option
                    value="true"
                    style={{ color: "#2563eb", fontWeight: "600" }}
                  >
                    사용
                  </option>
                  <option
                    value="false"
                    style={{ color: "#dc2626", fontWeight: "600" }}
                  >
                    미사용
                  </option>
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
                  value={selectedMenu.is_admin_only ? "true" : "false"}
                  onChange={(e) =>
                    handleChange("is_admin_only", e.target.value === "true")
                  }
                  style={{
                    color: selectedMenu.is_admin_only ? "#e11d48" : "#334155",
                    fontWeight: "600",
                  }}
                >
                  <option
                    value="false"
                    style={{ color: "#334155", fontWeight: "600" }}
                  >
                    전체 (일반 사용자)
                  </option>
                  <option
                    value="true"
                    style={{ color: "#e11d48", fontWeight: "600" }}
                  >
                    관리자 전용 (ADMIN)
                  </option>
                </select>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "40px 0",
                color: "#94a3b8",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              수정할 메뉴를 좌측 목록에서 선택하세요.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
