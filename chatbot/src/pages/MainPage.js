import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom';

import '../styles/MainPage.css';
import logo from '../icons/logo.png';

export default function MainPage() {
    const [companyName, setCompanyName] = useState('GenBot');
    const [botName, setBotName] = useState('문의');
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const botId = searchParams.get('bot_id');
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
        try {
            const res = await fetch("https://327xtt0dkuz5tigxs1ah:3lt7rpj5rmktvmwwsqji@syw5l20xk95e5p-19123-327xtt0dkuz5tigxs1ah.proxy.runpod.net/", {
                method: "POST"
            });
            const data = await res.json();
            alert(data.status);

            // 성공 시 chatbot 페이지로 이동
            window.location.href = `/chatbot?bot_id=${searchParams.get('bot_id') || 'a1'}`;
        } catch (err) {
            console.error("모델 로딩 실패:", err);
            alert("❌ 모델 로딩 중 오류가 발생했습니다.");
        }
    };


    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="logo-section">
                    <img src={logo} className="logo-icon" alt="GenBot" />
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
