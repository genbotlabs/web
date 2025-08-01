// src/components/CustomCard.jsx
import React, { useEffect, useState } from 'react';

const cardDataList = [
  {
    title: 'MBTI에 따라 나에게 어울리는 금융상품 알아보기!',
    subtitle: '(다양한 이자 혜택도 드려요!)',
    question: 'Q1. 난 쉴 때 주로?',
    options: ['집에서 퐁당퐁당이 최고지~!', '날씨도 좋은데 밖에 나가서 산책이나 할까?'],
  },
  {
    title: '나에게 딱 맞는 투자 성향 테스트!',
    subtitle: '(초보자도 걱정 NO)',
    question: 'Q2. 투자할 때 나는?',
    options: ['안정적이게 천천히 가는 편', '리스크 있어도 수익이 중요!'],
  },
  {
    title: 'GenBot과 함께하는 맞춤 금융 코칭',
    subtitle: '(내 상황에 딱 맞게!)',
    question: 'Q3. 월급 받으면?',
    options: ['저축 먼저!', '일단 지름!'],
  },
];

export default function CustomCard({ companyName }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % cardDataList.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const current = cardDataList[currentIdx];

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        width: '320px',
        padding: '24px',
        fontFamily: 'Noto Sans KR, sans-serif',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        animation: 'fadeIn 0.5s ease-in',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '6px' }}>{companyName}</div>
      <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '16px' }}>{current.title}</div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{current.subtitle}</div>
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>{current.question}</div>
      {current.options.map((opt, idx) => (
        <div
          key={idx}
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}
