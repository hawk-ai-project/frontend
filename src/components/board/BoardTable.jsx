import Link from "next/link";
export default function BoardTable({ items }) {
  return (
    <div className="board-list">
      {items.map((item) => (
        <Link className="board-row" href={`/boards/${item.id}`} key={item.id}>
          <div className="board-no">{item.isNotice ? "공지" : item.id}</div>
          <div>
            <div className="board-title">{item.title || item.subject}</div>
            <div className="board-meta">{item.summary || item.content}</div>
          </div>
          <div className="board-meta">
            {item.author?.name || item.authorName || "-"}
          </div>
          <div className="board-meta">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ko-KR") : "-"}
          </div>
        </Link>
      ))}
    </div>
  );
}
