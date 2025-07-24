import React, { useState } from 'react';
import '../styles/ChatbotPage.css';
import logo from '../icons/logo.png'
import send from '../icons/send.png'

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Genbot의 문의봇입니다. 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // TODO: 실제 AI 응답 연결
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: '죄송합니다. 아직 답변 기능이 구현되지 않았어요.' }
      ]);
    }, 500);
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
