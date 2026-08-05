// src/QuestionList.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function QuestionList() {
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/question/list`)
      .then((res) => {
        setQuestionList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('질문 목록 로드 실패:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#667085' }}>
        데이터 시각화 준비 중...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 상단 헤더 영역 */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}
      >
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
            📋 질문 목록
          </h2>
          <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
            등록된 질문 및 문의 사항을 실시간으로 관리합니다.
          </p>
        </div>

        <Link 
          to="/" 
          style={{ 
            padding: '10px 18px', 
            backgroundColor: '#FFFFFF', 
            color: '#344054', 
            border: '1px solid #D7DEEA',
            borderRadius: '12px', 
            textDecoration: 'none', 
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(38, 51, 82, 0.06)'
          }}
        >
          🏠 메인 홈으로
        </Link>
      </div>

      {/* 테이블 카드 영역 */}
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          borderRadius: '24px',
          border: '1px solid #E6EAF2',
          boxShadow: '0 12px 30px rgba(38, 51, 82, 0.08)',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#EEF2FA', borderBottom: '1px solid #E6EAF2' }}>
              <th style={{ padding: '16px 24px', width: '10%', textAlign: 'center', color: '#475467', fontSize: '14px' }}>
                번호
              </th>
              <th style={{ padding: '16px 24px', width: '60%', color: '#475467', fontSize: '14px' }}>
                제목
              </th>
              <th style={{ padding: '16px 24px', width: '30%', textAlign: 'center', color: '#475467', fontSize: '14px' }}>
                작성일시
              </th>
            </tr>
          </thead>
          <tbody>
            {questionList.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#98A2B3' }}>
                  등록된 질문이 없습니다.
                </td>
              </tr>
            ) : (
              questionList.map((question, index) => (
                <tr 
                  key={question.id || index} 
                  style={{ 
                    borderBottom: '1px solid #E6EAF2',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ padding: '16px 24px', textAlign: 'center', color: '#667085', fontSize: '14px' }}>
                    <span 
                      style={{ 
                        padding: '4px 10px', 
                        backgroundColor: '#F5F7FC', 
                        borderRadius: '999px',
                        fontWeight: '600'
                      }}
                    >
                      {question.id || index + 1}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Link 
                      to={`/question/detail/${question.id}`} 
                      style={{ 
                        textDecoration: 'none', 
                        color: '#111827', 
                        fontWeight: '600',
                        fontSize: '15px'
                      }}
                    >
                      {question.subject}
                    </Link>
                  </td>
                  <td 
                    style={{ 
                      padding: '16px 24px', 
                      textAlign: 'center', 
                      color: '#667085', 
                      fontSize: '14px',
                      fontVariantNumeric: 'tabular-nums' 
                    }}
                  >
                    {question.create_date ? new Date(question.create_date).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuestionList;