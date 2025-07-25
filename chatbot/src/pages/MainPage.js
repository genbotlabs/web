import React from 'react';
import { Button } from 'antd';
import { useSearchParams } from 'react-router-dom'; 
import '../styles/MainPage.css';
import logo from '../icons/logo.png';
import CustomCard from './coustomer';  // ✅ CustomCard 불러오기

export default function MainPage() {
    const [companyName, setCompanyName] = React.useState('GenBot');
    const [botName, setBotName] = React.useState('문의');
    const [searchParams] = useSearchParams();

    React.useEffect(() => {
        const botId = searchParams.get('bot_id');
        if (botId) {
            fetch(`http://localhost:8000/bots/${botId}`)
                .then(res => res.json())
                .then(data => {
                    setBotName(data.bot_name || '봇');
                    setCompanyName(data.company_name || 'GenBot');  // ✅ companyName도 설정
                })
                .catch(() => {
                    setBotName('봇');
                    setCompanyName('GenBot');
                });
        }
    }, []);

    const handleClick = () => {
        window.location.href = `/chatbot?bot_id=${searchParams.get('bot_id') || 'a1'}`;
    };

    return (
        <div className="main-container">
            <div className="left-section">
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

            <div className="right-section">
                <CustomCard companyName={companyName} /> {/* ✅ companyName 전달 */}
            </div>
        </div>
    );
}

