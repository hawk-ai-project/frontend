// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './Navbar';
import QuestionList from './QuestionList';
import QuestionDetail from './QuestionDetail';

// 1. DESIGN.md 기반 Hero Section 메인 홈
function MainHome() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero Section */}
      <div 
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F4F7FC 100%)',
          borderRadius: '32px',
          padding: '60px 40px',
          border: '1px solid rgba(222, 228, 240, 0.9)',
          boxShadow: '0 24px 60px rgba(52, 67, 104, 0.12)',
          textAlign: 'center',
          marginBottom: '40px'
        }}
      >
        <span 
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '999px',
            backgroundColor: '#EDF2FF',
            color: '#3F6FC4',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px'
          }}
        >
          ✨ 스마트 통합 관제 & 분석 플랫폼
        </span>
        
        <h1 
          style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#111827',
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0',
            lineHeight: '1.2'
          }}
        >
          데이터를 더 빠르게 이해하고,<br />더 정확하게 의사결정하세요.
        </h1>

        <p 
          style={{
            fontSize: '18px',
            color: '#667085',
            maxWidth: '640px',
            margin: '0 auto 36px auto',
            lineHeight: '1.6'
          }}
        >
          복잡한 데이터와 문의 내역을 직관적인 리포트와 자동화된 시스템으로
          관리하여 업무 효율을 높여드립니다.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link 
            to="/question/list" 
            style={{
              padding: '14px 28px',
              backgroundColor: '#3F6FC4',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(63, 111, 196, 0.22)',
              fontSize: '16px'
            }}
          >
            📋 질문 목록 바로가기
          </Link>
        </div>
      </div>

      {/* Feature KPI Cards Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}
      >
        <div style={kpiCardStyle}>
          <div style={{ fontSize: '14px', color: '#667085', marginBottom: '8px' }}>실시간 질문 등록(추후 계산하여 반영하거나 삭제)</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
            2,450 <span style={{ fontSize: '14px', color: '#28A77A', fontWeight: '600' }}>+12.8%</span>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ fontSize: '14px', color: '#667085', marginBottom: '8px' }}>답변 완료율(추후 계산하여 반영하거나 삭제)</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
            98.2% <span style={{ fontSize: '14px', color: '#3F6FC4', fontWeight: '600' }}>최상위</span>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ fontSize: '14px', color: '#667085', marginBottom: '8px' }}>평균 응답 시간(추후 계산하여 반영하거나 삭제)</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
            15분 <span style={{ fontSize: '14px', color: '#E66C8B', fontWeight: '600' }}>-5분 단축</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const kpiCardStyle = {
  background: '#FFFFFF',
  borderRadius: '20px',
  padding: '24px',
  border: '1px solid #E6EAF2',
  boxShadow: '0 4px 12px rgba(38, 51, 82, 0.06)'
};

// 2. 전체 App 구조
function App() {
  const [navPosition, setNavPosition] = useState('top');

  const mainStyle = {
    marginLeft: navPosition === 'left' ? '220px' : '0',
    backgroundColor: '#F5F7FC',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
    transition: 'margin-left 0.2s ease'
  };

  return (
    <BrowserRouter>
      <Navbar position={navPosition} setPosition={setNavPosition} />
      <main style={mainStyle}>
        <Routes>
          <Route path="/" element={<MainHome />} />
          <Route path="/question/list" element={<QuestionList />} />
          <Route path="/question/detail/:id" element={<QuestionDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;