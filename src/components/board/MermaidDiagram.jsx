'use client';

import { useEffect, useId, useState } from 'react';

export default function MermaidDiagram({ chart }) {
  const reactId = useId();
  const [result, setResult] = useState({ url:'', error:'' });

  useEffect(() => {
    let cancelled = false;
    const renderDiagram = async () => {
      try {
        const { default:mermaid } = await import('mermaid');
        mermaid.initialize({ startOnLoad:false, securityLevel:'strict', theme:'default', fontFamily:'Pretendard, SUIT, sans-serif' });
        const diagramId = `hawk-mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const { svg } = await mermaid.render(diagramId, chart);
        if (!cancelled) setResult({ url:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, error:'' });
      } catch {
        if (!cancelled) setResult({ url:'', error:'Mermaid 다이어그램 문법을 확인해 주세요.' });
      }
    };
    renderDiagram();
    return () => { cancelled = true; };
  }, [chart, reactId]);

  if (result.error) return <div className="mermaid-error" role="alert">{result.error}<pre>{chart}</pre></div>;
  if (!result.url) return <div className="mermaid-loading" role="status">다이어그램을 그리는 중입니다.</div>;
  return <object className="mermaid-diagram" type="image/svg+xml" data={result.url} aria-label="Markdown Mermaid 다이어그램">Mermaid 다이어그램</object>;
}
