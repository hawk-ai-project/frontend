const CATEGORIES = [
  "전체",
  "개발 기록",
  "점검 결과",
  "프로젝트 공지",
  "수거 요청",
];

export default function BoardFilter({
  category,
  keyword,
  onCategoryChange,
  onKeywordChange,
  onSubmit,
}) {
  return (
    <form className="card board-filter" onSubmit={onSubmit}>
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        {CATEGORIES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <input
        className="input"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="제목 또는 내용 검색"
      />
      <button className="btn btn-primary">검색</button>
    </form>
  );
}
