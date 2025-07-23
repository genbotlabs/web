import React, { useState } from 'react';
import { Card } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';

import MainSection from './MainSection';
import '../styles/DashBoardPage.css';

// 임시
const cardData = [
    { type: '문의봇', users: 97, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '상담봇', users: 7, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '보이스봇', users: 0, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '추가봇', users: 3, desc: '새 봇 설명', date: '2025/07/12' },
];

// 임시
const columnData = [
    { day: '월', users: 100 },
    { day: '화', users: 20 },
    { day: '수', users: 160 },
    { day: '목', users: 210 },
    { day: '금', users: 180 },
    { day: '토', users: 310 },
    { day: '일', users: 120 },
];

const DashBoardPage = ({user}) => {
    const [currentCard, setCurrentCard] = useState(0);

    const nextCard = () => {
        setCurrentCard((prev) => (prev + 1) % cardData.length);
    };

    const prevCard = () => {
        setCurrentCard((prev) => (prev - 1 + cardData.length) % cardData.length);
    };

    const visibleCards = cardData.slice(currentCard, currentCard + 3).length === 3
        ? cardData.slice(currentCard, currentCard + 3)
        : [...cardData.slice(currentCard), ...cardData.slice(0, 3 - (cardData.length - currentCard))];

    
    const columnConfig = {
        data: columnData,
        xField: 'day',
        yField: 'users',
        columnWidthRatio: 0.6,
        label: {
            position: 'top',
            style: {
            fill: '#000',
            },
            layout: [
              { type: 'interval-adjust-position' },
              { type: 'interval-hide-overlap' }, 
            ],
        },
        appendPadding: [20, 0, 0, 0],
        color: '#69b1ff',
        tooltip: {
            showMarkers: false,
        },
        interactions: [{ type: 'active-region' }],
    };

    return (
        <section>
            {user ? (
                <div className="dashboard">
                    {user ? (
                        <>
                            <h1>안녕하세요, {user.name}님!</h1>
                            <div className='dashboard-top'>
                                <button className="nav-button" onClick={prevCard}><LeftOutlined /></button>
                                <div className="card-container">
                                    {visibleCards.map((card, index) => (
                                        <Card
                                            key={index}
                                            bordered={true}
                                            className="ant-card-custom"
                                            style={{ width: 300 }}
                                            title={<span className="card-title-text">{card.type}</span>}
                                        >
                                            <div className="card-body-horizontal">
                                                <div className="card-text-section">
                                                    <p>{card.desc}</p>
                                                    <p>업데이트 일시: <b>{card.date}</b></p>
                                                </div>
                                                <div className="circle-user-count">
                                                    <div className="circle-number">{card.users}명</div>
                                                    <div className="circle-label">사용중</div>
                                                </div>
                                            </div>
                                        </Card>   
                                    ))}
                                </div>
                                <button className="nav-button" onClick={nextCard}><RightOutlined /></button>
                            </div>
                            <div className='dashboard-bottom'>
                                <div className='dashboard-bottom-left'>
                                    <div className="chart-header">
                                        <span className="chart-title">일별 사용자 이용 수</span>
                                        <span className="chart-period">2025년 7월 21일 - 2025년 7월 27일</span>
                                    </div>
                                    {typeof window !== 'undefined' && columnData.length > 0 && (
                                        <Column {...columnConfig} style={{ height: 500 }} />
                                    )}
                                    <div className="avg-line">평균 200명</div>
                                </div>
                                <div className='dashboard-bottom-right'>
                                    bye
                                </div>
                            </div>
                        </>
                    ):(
                        <div>로그인이 필요합니다.</div>
                    )}
                </div>
            ) : (
                <MainSection />
            )}
        </section>
    );
};

export default DashBoardPage;
