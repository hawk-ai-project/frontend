import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// .env의 VITE_API_BASE_URL을 사용하거나 기본값 적용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function QuestionDetail() {
  const { id } = useParams(); // URL 주소에서 :id 값을 가져옵니다.
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 해당 ID의 단건 질문 정보 조회 API 호출
    axios.get(`${API_BASE_URL}/api/question/detail/${id}`)
      .then((res) => {
        setQuestion(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('질문 상세 로드 실패:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center' }}>상세 내용을 불러오는 중입니다...</div>;
  }

  if (!question) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <p>존재하지 않거나 삭제된 질문입니다.</p>
        <Link to="/question/list">📋 질문 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 제목 영역 */}
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        {question.subject}
      </h2>

      {/* 작성일시 */}
      <div style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        작성일: {question.create_date ? new Date(question.create_date).toLocaleString() : '-'}
      </div>

      {/* 본문 내용 */}
      <div 
        style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px', 
          minHeight: '150px',
          whiteSpace: 'pre-line', // 줄바꿈 반영
          lineHeight: '1.6'
        }}
      >
        {question.content}
      </div>

      {/* 하단 버튼 구역 */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <Link 
          to="/question/list" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}
        >
          📋 목록으로
        </Link>
      </div>
    </div>
  );
}

export default QuestionDetail;