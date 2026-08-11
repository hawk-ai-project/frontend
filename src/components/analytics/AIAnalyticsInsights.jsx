"use client";

import { useEffect, useState } from "react";
import { analyticsInsightService } from "@/services/analyticsInsightService";
import { getApiErrorMessage } from "@/services/apiClient";


export default function AIAnalyticsInsights({ analytics, query }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    analyticsInsightService.analyze({
      startDate: query.startDate,
      endDate: query.endDate,
      locationId: query.locationId || null,
      summary: analytics.summary,
      trends: analytics.trends,
      distribution: analytics.distribution,
    })
      .then((result) => {
        if (!cancelled) setInsight(result);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setInsight(null);
        setError(getApiErrorMessage(requestError, "AI 분석 인사이트를 생성하지 못했습니다."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analytics, query]);

  return (
    <div className="card card-pad">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span className="badge progress">DATA INSIGHT</span>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>데이터 분석 인사이트</h2>
      </div>
      <div style={{ background: "var(--bg-sub, #f8fafc)", padding: "16px", borderRadius: "12px" }}>
        {loading && <p className="subtext">통계 데이터를 분석하고 있습니다.</p>}
        {!loading && error && <p className="subtext" role="alert">{error}</p>}
        {!loading && insight && (
          <>
            <p style={{ fontWeight: "600", color: "var(--text-1, #0f172a)", marginBottom: "6px" }}>{insight.title}</p>
            <p className="subtext" style={{ lineHeight: "1.6" }}>{insight.description}</p>
          </>
        )}
      </div>
    </div>
  );
}
