"use client";

import styles from "./ModelRecommendationCard.module.css";

const list = (value) => Array.isArray(value) ? value : [];

function RecommendationDetails({ item }) {
  const sections = [["강점",list(item.strengths)],["적합한 상황",list(item.bestFor)],["고려사항",list(item.tradeoffs)]];
  return <>{item.summary&&<p className={styles.summary}>{item.summary}</p>}<div className={styles.details}>{sections.map(([heading,values])=>values.length>0&&<div key={heading}><h3>{heading}</h3><ul>{values.map((value,index)=><li key={`${index}-${value}`}>{value}</li>)}</ul></div>)}</div></>;
}

export default function ModelRecommendationCard({
  recommendation, loading = false, error = "", title = "AI 추천 모델",
  description = "현재 데이터 기준 추천입니다.", unavailable = "", stale = false,
  onRefresh, onSelectModel, selectedModelId, selectableModels = [], selectingModelId = "",
}) {
  const legacyRecommendation = recommendation?.recommendedModelId || recommendation?.recommendedModelName ? [{
    rank:1, modelId:recommendation.recommendedModelId, modelName:recommendation.recommendedModelName,
    label:"AI 추천", summary:recommendation.summary, strengths:list(recommendation.reasons), bestFor:[], tradeoffs:[],
  }] : [];
  const rankedRecommendations = Array.isArray(recommendation?.recommendations) && recommendation.recommendations.length > 0 ? recommendation.recommendations : legacyRecommendation;
  const currentModelId = selectedModelId || recommendation?.currentModelId;
  const selectableById = new Map(selectableModels.map((model)=>[model.id,model]));
  const primaryDiffers = currentModelId && rankedRecommendations[0]?.modelId !== currentModelId;
  const action = (item) => {
    if (!onSelectModel) return null;
    const model = selectableById.get(item.modelId);
    if (!model) return null;
    const selected = currentModelId === item.modelId;
    const selecting = selectingModelId === item.modelId;
    return <button type="button" className={styles.select} onClick={()=>onSelectModel(item.modelId)} disabled={selected||!model.hasWeights||selecting}>{selecting?"적용 중...":selected?"사용 중":model.hasWeights?"이 모델 사용":"선택 불가"}</button>;
  };

  return <section className={styles.card} aria-live="polite">
    <header className={styles.head}><div><span className={styles.kicker}>AI RECOMMENDATION</span><h2>{title}</h2><p>{description}</p></div>{onRefresh&&<button type="button" className={styles.refresh} onClick={onRefresh} disabled={loading}>{loading?"비교 중...":"추천 새로고침"}</button>}</header>
    {stale&&<p className={styles.stale}>후보 모델 구성이 변경되었습니다. 최신 후보 기준 추천을 확인하려면 새로고침해 주세요.</p>}
    {unavailable?<p className={styles.state}>{unavailable}</p>:loading&&!recommendation?<p className={styles.state}>AI가 후보 모델을 비교하고 있습니다.</p>:error&&!recommendation?<p className={`${styles.state} ${styles.error}`}>{error}</p>:rankedRecommendations.length>0?<>
      {error&&<p className={`${styles.state} ${styles.error}`}>{error}</p>}
      {primaryDiffers&&<p className={styles.compare}>현재 선택 모델과 AI 1순위 추천 모델이 다릅니다.</p>}
      <div className={styles.recommendationGrid}>{rankedRecommendations.map((item,index)=>{const selected=currentModelId===item.modelId;return <article className={`${styles.recommendation}${selected?` ${styles.selected}`:""}`} key={`${item.modelId}-${index}`}><div className={styles.rankLine}><span className={styles.rank}>#{item.rank ?? index+1}</span><span className={styles.label}>{item.label}</span>{selected&&<span className={styles.current}>현재 사용 중</span>}</div><h3 className={styles.modelName}>{item.modelName}</h3><RecommendationDetails item={item}/>{action(item)}</article>;})}</div>
      <footer className={styles.footer}><span className={styles.meta}>후보 {recommendation?.candidateCount ?? rankedRecommendations.length}개 기준</span></footer>
      {list(recommendation?.warnings).length>0&&<div className={styles.warnings}><h3>참고 사항</h3><ul>{recommendation.warnings.map((warning,index)=><li key={`${index}-${warning}`}>{warning}</li>)}</ul></div>}
    </>:<p className={styles.state}>추천 정보를 불러오지 않았습니다.</p>}
  </section>;
}
