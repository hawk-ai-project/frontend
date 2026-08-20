"use client";

import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

export default function MenuList({
  menus = [],
  isLoading = false,
  onSaveBatch,
  isSaving = false,
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setItems(menus);
  }, [menus]);

  const handleChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const toggleUse = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_use: !item.is_use } : item,
      ),
    );
  };

  const handleSave = () => {
    if (onSaveBatch) {
      onSaveBatch(items);
    }
  };

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [items, page]);

  return (
    <article className="card card-pad">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "14px", color: "#64748b" }}>
          항목 수정 후 우측 상단의 <b>저장</b> 버튼을 누르면 일괄 적용됩니다.
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

      <div className="table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>ID</th>
              <th>메뉴명</th>
              <th>경로</th>
              <th style={{ width: "120px" }}>유형</th>
              <th style={{ width: "90px" }}>순서</th>
              <th style={{ width: "100px" }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="history-empty" colSpan="6">
                  로딩 중...
                </td>
              </tr>
            ) : pagedItems.length ? (
              pagedItems.map((menu) => (
                <tr key={menu.id}>
                  <td>{menu.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {menu.parent_id && (
                        <span style={{ color: "#94a3b8", marginRight: "6px" }}>
                          └
                        </span>
                      )}
                      <input
                        className="input"
                        type="text"
                        value={menu.name || ""}
                        onChange={(e) =>
                          handleChange(menu.id, "name", e.target.value)
                        }
                        style={{ height: "34px", padding: "4px 8px" }}
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      className="input"
                      type="text"
                      value={menu.path || ""}
                      onChange={(e) =>
                        handleChange(menu.id, "path", e.target.value)
                      }
                      style={{ height: "34px", padding: "4px 8px" }}
                    />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={menu.menu_type || "PAGE"}
                      onChange={(e) =>
                        handleChange(menu.id, "menu_type", e.target.value)
                      }
                      style={{ height: "34px", padding: "4px 8px" }}
                    >
                      <option value="PAGE">PAGE</option>
                      <option value="GROUP">GROUP</option>
                      <option value="ACTION">ACTION</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      value={menu.sort_order ?? 0}
                      onChange={(e) =>
                        handleChange(
                          menu.id,
                          "sort_order",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        height: "34px",
                        padding: "4px 8px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleUse(menu.id)}
                      style={{
                        border: "none",
                        borderRadius: "16px",
                        padding: "4px 14px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.15s ease-in-out",
                        backgroundColor: menu.is_use ? "#e8f8f0" : "#fee2e2",
                        color: menu.is_use ? "#0d7a5f" : "#dc2626",
                      }}
                    >
                      {menu.is_use ? "사용" : "미사용"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="history-empty" colSpan="6">
                  등록된 메뉴가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="number-pagination" aria-label="메뉴 목록 페이지">
        <button
          className="pagination-arrow"
          type="button"
          aria-label="이전 페이지"
          disabled={page === 1}
          onClick={() => setPage((v) => v - 1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (number) => (
            <button
              type="button"
              key={number}
              className={page === number ? "active" : ""}
              onClick={() => setPage(number)}
            >
              {number}
            </button>
          ),
        )}
        <button
          className="pagination-arrow"
          type="button"
          aria-label="다음 페이지"
          disabled={page === pageCount}
          onClick={() => setPage((v) => v + 1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </nav>
    </article>
  );
}
