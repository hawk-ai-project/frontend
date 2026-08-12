'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#8b5cf6', '#38bdf8', '#2563eb', '#3b82f6', '#6366f1', '#ec4899'];

export default function AnalyticsCharts({ trends = [], distribution = [] }) {
  // 모바일 여부 감지 상태
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // 초기 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxCount = Math.max(...trends.map((item) => Number(item.count ?? 0)), 0);

  const normalizedDistribution = distribution.map((item) => {
    const value = Number(item.value ?? item.count ?? item.cnt ?? item.total ?? 0);
    const name = item.name ?? item.label ?? item.wasteType ?? item.waste_type ?? '기타';
    return { ...item, name, value };
  });

  const totalWaste = normalizedDistribution.reduce((sum, item) => sum + item.value, 0);

  const renderCenterLabel = ({ cx, cy, index }) => {
    if (index !== 0) return null;

    return (
      <g>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: isMobile ? '11px' : '12px', fill: '#64748b', fontWeight: '500' }}
        >
          총 탐지량
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: isMobile ? '15px' : '18px', fill: '#0f172a', fontWeight: 'bold' }}
        >
          {totalWaste}개
        </text>
      </g>
    );
  };

  const renderLegendText = (value, entry) => {
    const itemValue = entry.payload?.value ?? 0;
    const percentage = totalWaste > 0 ? ((itemValue / totalWaste) * 100).toFixed(1) : 0;

    return (
      <span style={{ color: '#334155', fontSize: isMobile ? '11px' : '13px', marginLeft: '4px' }}>
        {value} <strong style={{ color: '#0f172a' }}>{itemValue}개</strong> ({percentage}%)
      </span>
    );
  };

  return (
    <div
      id="analytics-charts-area"
      className="grid grid-2"
      style={{
        marginBottom: '24px',
      }}
    >
      {/* 기간별 탐지 추이 */}
      <div className="card card-pad">
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>기간별 탐지 추이</h2>
        <div style={{ width: '100%', height: isMobile ? '260px' : '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="peakBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" unit="건" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [`${val}건`, '탐지 건수']} />

              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {trends.map((entry, index) => {
                  const val = Number(entry.count ?? 0);
                  const isPeak = maxCount > 0 && val === maxCount;
                  const isWarning = entry.isWarning || entry.isHighlight;

                  return (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={isPeak || isWarning ? 'url(#peakBarGradient)' : 'url(#primaryBarGradient)'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 폐기물 분포 */}
      <div className="card card-pad">
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>폐기물 분포</h2>
        <div style={{ width: '100%', height: isMobile ? '360px' : '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={normalizedDistribution}
                cx={isMobile ? '50%' : '35%'}
                cy={isMobile ? '35%' : '50%'}
                innerRadius={isMobile ? 45 : 60}
                outerRadius={isMobile ? 70 : 85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={renderCenterLabel}
                labelLine={false}
              >
                {normalizedDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [`${val}개`, '수량']} />
              <Legend
                layout={isMobile ? 'horizontal' : 'vertical'}
                align={isMobile ? 'center' : 'right'}
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                formatter={renderLegendText}
                wrapperStyle={isMobile ? { paddingTop: '10px' } : undefined}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}