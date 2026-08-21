"use client";

import { useState, useEffect } from "react";

export default function WasteList({
  wastes = [],
  isLoading = false,
  isSaving = false,
  onSaveBatch,
}) {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const formatted = wastes.map((w) => ({
      ...w,
      _status: "NORMAL",
      _isNew: false,
    }));
    setItems(formatted);
    setSelectedIds([]);
  }, [wastes]);

  const handleInputChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (updated._status !== "NEW" && updated._status !== "DELETED") {
          updated._status = "MODIFIED";
        }
        return updated;
      }),
    );
  };

  const handleSortOrderChange = (id, value) => {
    const onlyNums = value.replace(/[^0-9]/g, "");
    handleInputChange(
      id,
      "sort_order",
      onlyNums === "" ? null : Number(onlyNums),
    );
  };

  const handleAddRow = () => {
    const tempId = `new_${Date.now()}`;
    const newRow = {
      id: tempId,
      code: "",
      name_ko: "",
      name_en: "",
      description: "",
      is_active: true,
      sort_order: null,
      _status: "NEW",
      _isNew: true,
    };
    setItems((prev) => [newRow, ...prev]);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    setItems((prev) =>
      prev
        .filter((item) => !(item._isNew && selectedIds.includes(item.id)))
        .map((item) => {
          if (selectedIds.includes(item.id)) {
            return { ...item, _status: "DELETED" };
          }
          return item;
        }),
    );
    setSelectedIds([]);
  };

  const handleSubmit = () => {
    const toCreate = items
      .filter((i) => i._status === "NEW")
      .map(({ id, _status, _isNew, ...rest }) => rest);

    const toUpdate = items
      .filter((i) => i._status === "MODIFIED")
      .map(({ _status, _isNew, ...rest }) => rest);

    const toDelete = items
      .filter((i) => i._status === "DELETED" && !i._isNew)
      .map((i) => i.id);

    if (
      toCreate.length === 0 &&
      toUpdate.length === 0 &&
      toDelete.length === 0
    ) {
      alert("변경 사항이 없습니다.");
      return;
    }

    if (
      window.confirm(
        `신규 ${toCreate.length}건, 수정 ${toUpdate.length}건, 삭제 ${toDelete.length}건을 저장하시겠습니까?`,
      )
    ) {
      onSaveBatch({ toCreate, toUpdate, toDelete });
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "NEW":
      case "MODIFIED":
        return (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            수정
          </span>
        );
      case "DELETED":
        return (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            삭제
          </span>
        );
      default:
        return (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            완료
          </span>
        );
    }
  };

  return (
    /* maxWidth 제한을 제거하여 메뉴관리와 동일한 전체 너비를 사용합니다 */
    <div style={{ width: "100%" }}>
      <article className="card card-pad">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
            폐기물 유형 목록
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="btn" onClick={handleAddRow}>
              + 행 추가
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleDeleteSelected}
              style={{
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fca5a5",
              }}
            >
              삭제
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSaving || isLoading}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                <th
                  style={{
                    padding: "12px",
                    width: "40px",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      items.length > 0 && selectedIds.length === items.length
                    }
                  />
                </th>
                <th style={{ padding: "12px", width: "180px" }}>클래스 코드</th>
                <th style={{ padding: "12px", width: "180px" }}>한글 이름</th>
                <th style={{ padding: "12px", width: "180px" }}>영문 이름</th>
                <th style={{ padding: "12px" }}>설명</th>
                <th style={{ padding: "12px", width: "120px" }}>사용 여부</th>
                <th style={{ padding: "12px", width: "100px" }}>순서</th>
                <th
                  style={{ padding: "12px", width: "90px", textAlign: "right" }}
                >
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    등록된 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDeleted = item._status === "DELETED";
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: isDeleted ? "#fef2f2" : "transparent",
                        opacity: isDeleted ? 0.6 : 1,
                      }}
                    >
                      <td style={{ textAlign: "center", padding: "12px" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          className="input"
                          type="text"
                          value={item.code || ""}
                          disabled={isDeleted}
                          onChange={(e) =>
                            handleInputChange(item.id, "code", e.target.value)
                          }
                          placeholder="예: PLASTIC"
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          className="input"
                          type="text"
                          value={item.name_ko || ""}
                          disabled={isDeleted}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "name_ko",
                              e.target.value,
                            )
                          }
                          placeholder="예: 플라스틱"
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          className="input"
                          type="text"
                          value={item.name_en || ""}
                          disabled={isDeleted}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "name_en",
                              e.target.value,
                            )
                          }
                          placeholder="예: Plastic"
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          className="input"
                          type="text"
                          value={item.description || ""}
                          disabled={isDeleted}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="상세 설명"
                          style={{ width: "100%" }}
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <select
                          className="input"
                          value={item.is_active ? "true" : "false"}
                          disabled={isDeleted}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "is_active",
                              e.target.value === "true",
                            )
                          }
                        >
                          <option value="true">사용</option>
                          <option value="false">미사용</option>
                        </select>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          className="input"
                          type="text"
                          inputMode="numeric"
                          value={item.sort_order ?? ""}
                          disabled={isDeleted}
                          onChange={(e) =>
                            handleSortOrderChange(item.id, e.target.value)
                          }
                          placeholder=""
                          style={{ width: "100%" }}
                        />
                      </td>
                      <td style={{ textAlign: "right", padding: "12px" }}>
                        {renderStatusBadge(item._status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
