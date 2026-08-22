import Link from "next/link";
export default function BoardTable({ items }) {
  return (
    <div className="board-list">
      {items.map((item) => (
        <Link className="content-card board-row" href={`/boards/${item.id}`} key={item.id}>
          <div className="board-no">{item.isNotice ? "공지" : item.id}</div>
          <div className="board-row-content">
            <div className="board-title">{item.title || item.subject}</div>
            <div className="board-meta">{item.summary || item.content}</div>
          </div>
          <div className="board-meta board-author">
            <span className="board-meta-label">작성자</span>
            {item.author?.name || item.authorName || "-"}
          </div>
          <div className="board-meta board-date">
            <span className="board-meta-label">작성일</span>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ko-KR") : "-"}
          </div>
        </Link>
      ))}
    </div>
  );
}
