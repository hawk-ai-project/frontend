import BoardForm from "@/components/board/BoardForm";

export default async function BoardEditPage({ params }) {
  const { id } = await params;
  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Board Edit</div>
          <h1>게시글 수정</h1>
          <p className="subtitle">
            Markdown 본문과 게시글 정보를 함께 수정하세요.
          </p>
        </div>
      </div>
      <BoardForm boardId={id} />
    </div>
  );
}
