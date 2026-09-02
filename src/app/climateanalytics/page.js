// 기후·계절별 통계분석 페이지 (frontend/src/app/climateanalytics/page.js)

import ClimateAnalyticsClient from "@/components/climateanalytics/ClimateAnalyticsClient";

export const metadata = { title: "기후·계절별 통계분석" };

export default function ClimateAnalyticsPage() {
  return (
    <div className="analytics-page-wrapper">
      <div className="analytics-container">
        <ClimateAnalyticsClient />
      </div>
    </div>
  );
}
