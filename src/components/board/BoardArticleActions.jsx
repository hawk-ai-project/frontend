import Link from 'next/link';

export default function BoardArticleActions({ post }) {
  return (
    <div className="article-actions">
      <Link className="btn btn-secondary" href="/boards">목록으로</Link>
      {post.canEdit && <div><Link className="btn btn-soft" href={`/boards/${post.id}/edit`}>수정</Link><button type="button" className="btn btn-secondary" title="서버 연동 후 사용할 수 있습니다">삭제</button></div>}
    </div>
  );
}
