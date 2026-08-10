'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { inspectionHistories, STATUS_OPTIONS, statusClass } from './historyData';

const formatDateTime = (value) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value));

export default function HistoryList() {
  const [items, setItems] = useState(inspectionHistories);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('전체 장소');
  const [status, setStatus] = useState('전체 상태');
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [searched, setSearched] = useState({ keyword: '', location: '전체 장소', status: '전체 상태', date: '' });
  const locations = [...new Set(inspectionHistories.map((item) => item.location.split(' ')[0]))];
  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesKeyword = !searched.keyword || `${item.id} ${item.location}`.toLowerCase().includes(searched.keyword.toLowerCase());
    const matchesLocation = searched.location === '전체 장소' || item.location.startsWith(searched.location);
    const matchesStatus = searched.status === '전체 상태' || item.status === searched.status;
    const matchesDate = !searched.date || item.inspectedAt.startsWith(searched.date);
    return matchesKeyword && matchesLocation && matchesStatus && matchesDate;
  }), [items, searched]);
  const allSelected = filteredItems.length > 0 && filteredItems.every((item) => selected.includes(item.id));

  const search = (event) => {
    event.preventDefault();
    setSearched({ keyword: keyword.trim(), location, status, date });
    setSelected([]);
  };
  const toggleAll = () => setSelected(allSelected ? [] : filteredItems.map((item) => item.id));
  const toggleItem = (id) => setSelected((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]);
  const applyStatus = () => {
    if (!bulkStatus || !selected.length) return;
    setItems((current) => current.map((item) => selected.includes(item.id) ? { ...item, status: bulkStatus } : item));
    setSelected([]);
    setBulkStatus('');
  };

  return <>
    <form className="card history-filter" onSubmit={search}>
      <input className="input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="장소 또는 점검번호 검색" />
      <select value={location} onChange={(event) => setLocation(event.target.value)}><option>전체 장소</option>{locations.map((name) => <option key={name}>{name}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option>전체 상태</option>{STATUS_OPTIONS.map((name) => <option key={name}>{name}</option>)}</select>
      <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="점검 날짜" />
      <button className="btn btn-primary">검색</button>
    </form>
    <article className="card card-pad">
      <div className="bulk-toolbar">
        <div><b>{selected.length}건 선택</b><span>선택한 점검의 상태를 일괄 변경할 수 있습니다.</span></div>
        <div className="bulk-actions"><select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} aria-label="변경할 상태"><option value="">상태 선택</option>{STATUS_OPTIONS.map((name) => <option key={name}>{name}</option>)}</select><button className="btn btn-primary" type="button" disabled={!bulkStatus || !selected.length} onClick={applyStatus}>상태 변경</button></div>
      </div>
      <div className="table-wrap">
        <table className="history-table"><thead><tr><th><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="전체 선택" /></th><th>이미지</th><th>점검번호</th><th>점검 일시</th><th>장소</th><th>탐지 수</th><th>주요 폐기물</th><th>상태</th></tr></thead>
          <tbody>{filteredItems.length ? filteredItems.map((item) => <tr className={selected.includes(item.id) ? 'selected' : ''} key={item.id}><td><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleItem(item.id)} aria-label={`${item.id} 선택`} /></td><td><span className="history-thumb" aria-hidden="true" /></td><td><Link className="history-link" href={`/histories/${item.id}`}>{item.id}</Link></td><td>{formatDateTime(item.inspectedAt)}</td><td>{item.location}</td><td>{item.detectedCount}개</td><td>{item.waste}</td><td><span className={`badge ${statusClass(item.status)}`}>{item.status}</span></td></tr>) : <tr><td className="history-empty" colSpan="8">조건에 맞는 점검 이력이 없습니다.</td></tr>}</tbody>
        </table>
      </div>
      <nav className="number-pagination" aria-label="점검 이력 페이지"><button disabled>‹</button><button className="active">1</button><button disabled>›</button></nav>
    </article>
  </>;
}
