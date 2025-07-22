import React, { useState } from 'react';
import { Card } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

import MainSection from './MainSection';
import '../styles/DashBoardPage.css';

// 임시
const cardData = [
    { type: '문의봇', users: 97, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '상담봇', users: 7, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '보이스봇', users: 0, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '추가봇', users: 3, desc: '새 봇 설명', date: '2025/07/12' },
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
                                    bye
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
