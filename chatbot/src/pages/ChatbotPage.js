import React, { useState } from 'react';
import './ChatbotPage.css';
import logo from '../icons/logo.png'
import send from '../icons/send.png'

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Genbot의 문의봇입니다. 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
  if (!input.trim()) return;

  // 사용자 메시지 추가
  setMessages(prev => [...prev, { from: 'user', text: input }]);
  setInput("");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    // HTTP 에러가 났을 때, body 텍스트까지 읽어오기
    if (!res.ok) {
      const errText = await res.text();
      console.error("API 에러:", res.status, errText);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    setMessages(prev => [...prev, { from: "bot", text: data.answer }]);
  } catch (err) {
    // err.message, err.stack 등 자세히 찍기
    console.error("fetch 중 예외 발생:", err);
    setMessages(prev => [
      ...prev,
      // { from: "bot", text: `오류: ${err.message}` },
      { from: "bot", text: `학습된 문서에 관련 내용이 없습니다. 다시 질문해주세요!` },
    ]);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-container">
      <header className="header">
        <div className="header__logo">
            <img src={logo} alt="GenBot Logo" className="header__logo-img" />
            <span className="header__logo-text">GenBot</span>
        </div>
      </header>
      <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="질문을 입력해 주세요."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>
            <img src={send} alt="send" />
          </button>
        </div>
    </div>
    
  );
}
