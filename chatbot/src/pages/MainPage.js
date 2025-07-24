import React from 'react';
import { Button } from 'antd';

import '../styles/MainPage.css';
import logo from '../icons/logo.png'

export default function MainPage() {

    const handleClick = () => {
        window.location.href = '/chatbot';
    }

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="logo-section">
                    <img src={logo} className="logo-icon" alt="GenBot"/>
                    <div className="text-section">
                        <h1 className="main-title">OOO의 OOO봇</h1>
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
