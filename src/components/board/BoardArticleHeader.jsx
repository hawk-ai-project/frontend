import Image from "next/image";

function calculateReadingTime(content) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default function BoardArticleHeader({ post }) {
  const authorName = post.author?.name || post.authorName || "Hawk-AI";
  return (
    <header className="board-article-header">
      <span className="article-category">
        {post.category || "프로젝트 기록"}
      </span>
      <h1>{post.title}</h1>
      {post.summary && <p className="article-summary">{post.summary}</p>}
      <div className="article-author-row">
        <div className="article-avatar" aria-hidden="true">
          {post.author?.profileImageUrl
            ? <Image src={post.author.profileImageUrl} alt="" fill sizes="44px" unoptimized />
            : authorName.charAt(0)}
        </div>
        <div>
          <strong>{authorName}</strong>
          <p>
            <span>{formatDate(post.createdAt)}</span>
            {post.updatedAt && <span>수정됨 {formatDate(post.updatedAt)}</span>}
            <span>{calculateReadingTime(post.content)}분 읽기</span>
            <span>조회 {post.viewCount?.toLocaleString() || 0}</span>
          </p>
        </div>
      </div>
      {post.tags?.length > 0 && (
        <ul className="article-tags" aria-label="게시글 태그">
          {post.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      )}
    </header>
  );
}
