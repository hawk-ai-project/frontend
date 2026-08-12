import Link from "next/link";
import BoardList from "@/components/board/BoardList";
export const metadata = { title: "게시판" };
export default function BoardsPage() {
  return (
    <div className="page-shell board-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Board</div>
          <h1>게시판</h1>
          <p className="subtitle">
            점검 결과, 수거 요청, 현장 공지 등을 공유합니다.
          </p>
        </div>
        <Link className="btn btn-primary" href="/boards/write">
          + 게시글 작성
        </Link>
      </div>
      <BoardList />
    </div>
  );
}
