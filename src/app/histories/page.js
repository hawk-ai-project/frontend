import Link from "next/link";
import HistoryList from "@/components/history/HistoryList";
import { ROUTES } from "@/constants/routes";

export default function HistoriesPage() {
  return (
    <div className="page-shell history-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">History</div>
          <h1>점검 이력</h1>
          <p className="subtitle">
            저장된 점검 기록을 조건별로 검색하고 처리 상태를 확인합니다.
          </p>
        </div>
        <Link className="btn btn-primary" href={ROUTES.inspection}>
          + 새 점검
        </Link>
      </div>
      <HistoryList />
    </div>
  );
}
