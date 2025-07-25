import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import { message } from 'antd';

import '../styles/MainPage.css';
import logo from '../icons/logo.png'

export default function MainPage() {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('GenBot');
    const [botName, setBotName] = useState('문의');
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const botId = searchParams.get('bot_id');
        console.log('bot-id',botId)
        if (botId) {
            fetch(`http://localhost:8000/bots/${botId}`)
                .then(res => {
                    if (!res.ok) throw new Error('봇 정보를 가져오는 데 실패했습니다.');
                    return res.json();
                })
                .then(data => {
                    setBotName(data.bot_name || '봇');
                })
                .catch(err => {
                    console.error(err);
                    setBotName('봇');
                });
        } else {
            setBotName('봇');
        }
    }, []);

    const handleClick = async () => {
        const formData = new FormData();
        formData.append("bot_id", searchParams.get('bot_id') || 'bot-001');

        try {
            const response = await fetch("http://localhost:8000/chatbot", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const { session_id } = await response.json();
                navigate(`/chatbot?bot_id=${searchParams.get('bot_id')}`, {
                    state: { session_id }
                });
            } else {
                message.error("서버 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("전송 실패:", error);
            message.error("요청 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }

        // window.location.href = `/chatbot?bot_id=${searchParams.get('bot_id') || 'a1'}`;
    }

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="logo-section">
                    <img src={logo} className="logo-icon" alt="GenBot"/>
                    <div className="text-section">
                        <h1 className="main-title">{companyName}의 {botName}봇</h1>
                        <p className="subtitle">궁금한 사항은 언제든지 문의해 주세요</p>
                    </div>
                </div>

                <div className="button-section">
                    <Button type="primary" className="link-chatbot-button" onClick={handleClick}>
                        챗봇 시작하기
                    </Button>
                </div>
            </div>
        </div>
    );
}
