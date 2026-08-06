import BoardDetail from "@/components/board/BoardDetail";

export default async function BoardDetailPage({ params }) {
  const { id } = await params;
  return (
    <main className="page-shell article-shell">
      <BoardDetail id={id} />
    </main>
  );
}
