'use client';

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
          style={{ fontSize: '12px', fill: '#64748b', fontWeight: '500' }}
        >
          총 탐지량
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '18px', fill: '#0f172a', fontWeight: 'bold' }}
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
      <span style={{ color: '#334155', fontSize: '13px', marginLeft: '6px' }}>
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
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
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
              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" unit="건" />
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
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={normalizedDistribution}
                cx="35%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
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
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={renderLegendText}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}