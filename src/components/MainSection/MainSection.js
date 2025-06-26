import React, { useEffect, useState } from 'react';
import './MainSection.css';

const MainSection = () => {
    const [messages, setMessages] = useState([]);
    const [index, setIndex] = useState(0);
    const messageQueue = [
        { text: "안녕하세요. Genbot의 문의봇입니다. 무엇을 도와드릴까요?", sender: 'bot' },
        { text: "스터디룸 이용 가능 시간이 어떻게 돼?", sender: 'user' },
        { text: "24시간 이용 가능합니다!", sender: 'bot' },
        { text: "스터디룸 안에 에어컨 있어?", sender: 'user' },
        { text: "네. 모든 스터디룸 안에 에어컨이 설치되어 있습니다. 만약 온도 조절을 희망하시면 카운터로 문의주세요.", sender: 'bot' },
        { text: "그럼 음료 반입은 가능한가요?", sender: 'user' },
        { text: "네. 저희 Genbot 스터디룸은 음료 반입이 가능합니다. 다만, 재활용은 직접 해주셔야 합니다.", sender: 'bot' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (index === 0) {
                setMessages([messageQueue[0]]);
                setIndex(1);
            } else if (index < messageQueue.length) {
                setMessages((prev) => [...prev, messageQueue[index]]);
                setIndex(index + 1);
            } else {
                setMessages([]);
                setIndex(0);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [index]);

    return (
        <section className="main-section">
            <div className="content-wrapper">
                <div className="left-container">
                    <div className="text-wrapper">
                        <p>자동으로 만들어지는 대화<br/>
클릭 한 번으로 상담봇을 완성하세요 </p>
                    </div>
                    <div className="button-wrapper">
                        <button className="generate-button">챗봇, 보이스봇 생성하기</button>
                    </div>
                        
                </div>

                <div className="right-container">
                    <div className="chatbox">
                    {messages.length > 0 && messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            <p>{message.text}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MainSection;
