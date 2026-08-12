"use client";

export default function GlobalError({ reset }) {
  return <html lang="ko"><body style={{ margin: 0, background: "#f5f7fc", color: "#111827", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}><main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}><section style={{ width: "min(100%, 420px)", padding: 24, borderRadius: 18, background: "#fff", boxShadow: "0 12px 30px rgba(38,51,82,.1)" }}><h1 style={{ marginTop: 0, fontSize: 24 }}>화면을 불러오지 못했습니다</h1><p style={{ color: "#667085", lineHeight: 1.6 }}>네트워크 연결을 확인한 후 다시 시도해 주세요.</p><button type="button" onClick={reset} style={{ width: "100%", minHeight: 48, border: 0, borderRadius: 12, background: "#274c91", color: "#fff", fontWeight: 700 }}>다시 불러오기</button></section></main></body></html>;
}
