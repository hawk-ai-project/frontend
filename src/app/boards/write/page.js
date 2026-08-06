import BoardWriteForm from '@/components/board/BoardWriteForm';

export const metadata = { title: '게시글 작성' };

export default function BoardWritePage() {
  return <div className="page-shell"><div className="page-head"><div><div className="eyebrow">Board Write</div><h1>게시글 작성</h1><p className="subtitle">Markdown으로 점검 결과와 현장 소식을 작성하세요.</p></div></div><BoardWriteForm /></div>;
}
