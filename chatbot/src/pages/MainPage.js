import React from 'react';
import { Button } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom'; 

import '../styles/MainPage.css';
import logo from '../icons/logo.png';
import CustomCard from './coustomer';  // ✅ CustomCard 불러오기

const runpodUrl = process.env.REACT_APP_RUNPOD_URL;
const apiUrl = process.env.REACT_APP_API_URL;

export default function MainPage() {
    const [companyName, setCompanyName] = React.useState('GenBot');
    const [botName, setBotName] = React.useState('문의');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // const sessionId = searchParams.get('session_id') || "";
    // console.log(sessionId)

    React.useEffect(() => {
        const botId = searchParams.get('bot_id');
        if (botId) {
            fetch(`${apiUrl}/bots/detail/${botId}`)
                .then(res => {
                    if (!res.ok) throw new Error('봇 정보를 가져오는 데 실패했습니다.');
                    return res.json();
                })
                .then(data => {
                    setCompanyName(data.company_name || 'GenBot');
                    setBotName(data.bot_name || '문의');
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            setBotName('문의');
        }
    }, []);

    const handleClick = async () => {
        const botId = searchParams.get("bot_id") || "a1";
        const response = await fetch(`${apiUrl}/chatbot/${botId}`, {
            method: "POST",
            body: JSON.stringify({ bot_id: botId })
        });
        const data = await response.json()
        const sessionId = data.session_id
        console.log('sessionId', sessionId)

        // const res = await fetch(`http://localhost:8000/bots/bot_id/${botId}`);
        const res = await fetch(`${apiUrl}/bots/contact/${botId}`);
        const botData = await res.json();
        const { cs_number, email, detail_id } = botData;
        console.log(cs_number, email, detail_id)

        const runpodRes = await fetch(`${runpodUrl}/load`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bot_id: botId, cs_number, email, detail_id})
        });

        // stt 로드하는 api
        await fetch(`{runpodUrl}/stt`, {
            method: "POST",
            body: JSON.stringify({})
        })
        
        
        navigate(`/chatbot?bot_id=${botId}&session_id=${sessionId}`)
    }


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

