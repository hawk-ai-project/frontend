"use client";
import { useEffect, useMemo, useState } from "react";

const parentKey = (value) => value ?? null;
const byOrder = (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.id - b.id;

export default function MenuList({ menus = [], isLoading, onSaveBatch, isSaving, onCreateClick }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(menus);
      setSelectedId((id) => menus.some((menu) => menu.id === id) ? id : menus[0]?.id ?? null);
    }, 0);
    return () => clearTimeout(timer);
  }, [menus]);

  const tree = useMemo(() => {
    const map = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
    const roots = [];
    items.forEach((item) => {
      if (item.parent_id && map.has(item.parent_id)) map.get(item.parent_id).children.push(map.get(item.id));
      else roots.push(map.get(item.id));
    });
    const sort = (nodes) => { nodes.sort(byOrder); nodes.forEach((node) => sort(node.children)); };
    sort(roots);
    return roots;
  }, [items]);

  const selected = items.find((item) => item.id === selectedId);
  const change = (field, value) => setItems((prev) => prev.map((item) => item.id === selectedId ? { ...item, [field]: value } : item));
  const toggle = (id) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const drop = (targetId) => {
    setItems((prev) => {
      const dragged = prev.find((item) => item.id === draggedId);
      const target = prev.find((item) => item.id === targetId);
      if (!dragged || !target || parentKey(dragged.parent_id) !== parentKey(target.parent_id)) return prev;
      const siblings = prev.filter((item) => parentKey(item.parent_id) === parentKey(target.parent_id)).sort(byOrder);
      const from = siblings.findIndex((item) => item.id === draggedId);
      const to = siblings.findIndex((item) => item.id === targetId);
      const reordered = [...siblings];
      reordered.splice(to, 0, reordered.splice(from, 1)[0]);
      const orders = new Map(reordered.map((item, index) => [item.id, index + 1]));
      return prev.map((item) => orders.has(item.id) ? { ...item, sort_order: orders.get(item.id) } : item);
    });
    setDraggedId(null);
    setOverId(null);
  };

  const nodeView = (node, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isClosed = collapsed.has(node.id);
    return <div key={node.id}>
      <div
        className={"admin-menu-tree-row" + (selectedId === node.id ? " selected" : "") + (reorderMode ? " reorder-mode" : "") + (overId === node.id ? " drag-over" : "")}
        style={{ paddingLeft: depth * 22 + 10, opacity: draggedId === node.id ? .45 : 1 }}
        draggable={reorderMode}
        onClick={() => setSelectedId(node.id)}
        onDragStart={(event) => { if (!reorderMode) return; setDraggedId(node.id); event.dataTransfer.effectAllowed = "move"; }}
        onDragEnd={() => { setDraggedId(null); setOverId(null); }}
        onDragOver={(event) => {
          const dragged = items.find((item) => item.id === draggedId);
          if (reorderMode && dragged && parentKey(dragged.parent_id) === parentKey(node.parent_id)) {
            event.preventDefault();
            setOverId(node.id);
          }
        }}
        onDrop={(event) => { if (!reorderMode) return; event.preventDefault(); drop(node.id); }}
      >
        {reorderMode && <span className="admin-menu-drag-handle" title="드래그하여 순서 변경">⠿</span>}
        {hasChildren
          ? <>
              <button type="button" className="admin-menu-collapse" aria-expanded={!isClosed} aria-label={isClosed ? "하위 메뉴 펼치기" : "하위 메뉴 접기"} onClick={(event) => { event.stopPropagation(); toggle(node.id); }}>{isClosed ? "▸" : "▾"}</button>
              <span className="admin-menu-folder" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d={isClosed ? "M3 6.5h7l2 2h9v10.5H3V6.5Z" : "M3 7h7l2 2h9l-2 10H4L3 7Z"} /></svg>
              </span>
            </>
          : <span className="admin-menu-leaf" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6V3Zm8 0v5h5" /></svg></span>}
        <span className="admin-menu-node-name">{node.name}</span>
        {Boolean(node.is_admin_only) && <small className="admin-menu-badge admin">관리자</small>}
        {!Boolean(node.is_use) && <small className="admin-menu-badge">미사용</small>}
      </div>
      {hasChildren && !isClosed && node.children.map((child) => nodeView(child, depth + 1))}
    </div>;
  };

  return <article className="admin-panel admin-menu-manager">
    <div className="admin-toolbar admin-menu-toolbar">
      <div className="admin-menu-guide">같은 단계의 메뉴를 드래그해 순서를 변경하세요. 화살표를 누르면 하위 메뉴가 접힙니다.</div>
      <button type="button" className="admin-primary-btn" disabled={isSaving || isLoading || !items.length} onClick={() => onSaveBatch?.(items)}>{isSaving ? "저장 중..." : "변경사항 저장"}</button>
    </div>
    <div className="admin-menu-layout">
      <section className="admin-menu-tree"><div className="admin-menu-tree-head"><h3>메뉴 구조</h3><div className="admin-menu-tree-actions"><button type="button" className={reorderMode ? "active" : ""} onClick={() => { setReorderMode((value) => !value); setDraggedId(null); setOverId(null); }}>{reorderMode ? "순서 변경 완료" : "순서 변경"}</button><button type="button" className="admin-menu-add-button" onClick={onCreateClick} aria-label="신규 메뉴 등록" title="신규 메뉴 등록">+</button></div></div>{isLoading ? <div className="admin-menu-empty">불러오는 중...</div> : tree.length ? tree.map((node) => nodeView(node)) : <div className="admin-menu-empty">등록된 메뉴가 없습니다.</div>}</section>
      <section className="admin-menu-detail"><h3>상세 정보 수정 {selected && `(ID: ${selected.id})`}</h3>
        {selected ? <div className="admin-menu-detail-grid">
          <label><span>상위 메뉴</span><select className="input" value={selected.parent_id || ""} onChange={(e) => change("parent_id", e.target.value ? Number(e.target.value) : null)}><option value="">최상위 메뉴</option>{items.filter((item) => item.id !== selected.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span>메뉴명</span><input className="input" value={selected.name || ""} onChange={(e) => change("name", e.target.value)} /></label>
          <label><span>경로 (Path)</span><input className="input" value={selected.path || ""} onChange={(e) => change("path", e.target.value)} /></label>
          <label><span>메뉴 유형</span><select className="input" value={selected.menu_type || "PAGE"} onChange={(e) => change("menu_type", e.target.value)}><option>PAGE</option><option>GROUP</option><option>ACTION</option></select></label>
          <label><span>정렬 순서</span><input className="input" type="number" value={selected.sort_order ?? 0} onChange={(e) => change("sort_order", Number(e.target.value))} /></label>
          <label><span>사용 여부</span><select className="input" value={selected.is_use ? "true" : "false"} onChange={(e) => change("is_use", e.target.value === "true")}><option value="true">사용</option><option value="false">미사용</option></select></label>
          <label><span>접근 권한</span><select className="input" value={selected.is_admin_only ? "true" : "false"} onChange={(e) => change("is_admin_only", e.target.value === "true")}><option value="false">전체 사용자</option><option value="true">관리자 전용</option></select></label>
        </div> : <div className="admin-menu-empty">수정할 메뉴를 선택하세요.</div>}
      </section>
    </div>
  </article>;
}