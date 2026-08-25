"use client";

import styles from "./ModelRecommendationCard.module.css";

export default function ModelRecommendationCard({
  recommendation,
  loading = false,
  error = "",
  title = "AI 추천 모델",
  description = "현재 데이터 기준 추천입니다.",
  unavailable = "",
  stale = false,
  onRefresh,
  onSelectModel,
  selectDisabled = false,
  selecting = false,
}) {
  const currentMatches = recommendation?.currentModelId === recommendation?.recommendedModelId;
  return <section className={styles.card} aria-live="polite">
    <header className={styles.head}><div><span className={styles.kicker}>AI RECOMMENDATION</span><h2>{title}</h2><p>{description}</p></div>{onRefresh&&<button type="button" className={styles.refresh} onClick={onRefresh} disabled={loading}>{loading?"비교 중...":"추천 새로고침"}</button>}</header>
    {stale&&<p className={styles.stale}>후보 모델 구성이 변경되었습니다. 추천을 새로고침해 주세요.</p>}
    {unavailable?<p className={styles.state}>{unavailable}</p>:loading&&!recommendation?<p className={styles.state}>AI가 후보 모델을 비교하고 있습니다.</p>:error?<p className={`${styles.state} ${styles.error}`}>{error}</p>:recommendation?<>
      <div className={styles.model}><strong>{recommendation.recommendedModelName}</strong><span className={styles.confidence}>추천 신뢰도 {Math.round(Number(recommendation.confidence)*100)}%</span></div>
      {recommendation.currentModelId&&<p className={styles.compare}>현재 모델 {recommendation.currentModelId} · {currentMatches?"현재 사용 중인 모델이 추천 모델입니다.":"현재 모델과 추천 모델이 다릅니다."}</p>}
      <p className={styles.summary}>{recommendation.summary}</p>
      <div className={styles.content}><div><h3>추천 근거</h3><ul>{recommendation.reasons.map((reason,index)=><li key={`${index}-${reason}`}>{reason}</li>)}</ul></div>{recommendation.warnings.length>0&&<div className={styles.warnings}><h3>참고 사항</h3><ul>{recommendation.warnings.map((warning,index)=><li key={`${index}-${warning}`}>{warning}</li>)}</ul></div>}</div>
      <footer className={styles.footer}><span className={styles.meta}>후보 {recommendation.candidateCount}개 기준</span>{onSelectModel&&<button type="button" className={styles.select} onClick={onSelectModel} disabled={selectDisabled||selecting}>{selecting?"적용 중...":"이 모델 사용"}</button>}</footer>
    </>:<p className={styles.state}>추천 정보를 불러오지 않았습니다.</p>}
  </section>;
}
