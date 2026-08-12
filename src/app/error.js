"use client";

export default function AppError({ reset }) {
  return <div className="page-shell"><section className="card card-pad" role="alert"><h1>화면을 불러오지 못했습니다</h1><p className="subtitle">네트워크 연결을 확인한 후 다시 시도해 주세요.</p><button className="btn btn-primary" type="button" onClick={reset}>다시 불러오기</button></section></div>;
}
