// import './analytics.css';
import AnalyticsClient from '@/components/analytics/AnalyticsClient';

export const metadata = { title: '통계 분석' };

export default function AnalyticsPage() {
  return (
    <div className="analytics-page-wrapper">
      <div className="analytics-container">
        <AnalyticsClient />
      </div>
    </div>
  );
}