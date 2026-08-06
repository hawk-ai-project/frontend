import Link from "next/link";
import { prototypeBoards } from "./boardData";
import BoardArticleHeader from "./BoardArticleHeader";
import BoardArticleContent from "./BoardArticleContent";
import BoardArticleActions from "./BoardArticleActions";
import BoardPostNavigation from "./BoardPostNavigation";

export default function BoardDetail({ id }) {
  const currentIndex = prototypeBoards.findIndex(
    (item) => String(item.id) === String(id),
  );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const post = prototypeBoards[safeIndex];
  const previousPost = prototypeBoards[safeIndex + 1] || null;
  const nextPost = prototypeBoards[safeIndex - 1] || null;

  return (
    <article className="board-article">
      <Link className="board-list-link" href="/boards">
        ← 게시판 목록
      </Link>
      <BoardArticleHeader post={post} />
      <BoardArticleContent post={post} />
      <BoardArticleActions post={post} />
      <BoardPostNavigation previousPost={previousPost} nextPost={nextPost} />
    </article>
  );
}
