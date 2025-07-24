import React, { useState } from 'react';

import Header from '../components/Header/Header';
import '../styles/ChatbotPage.css';
import send from '../icons/send.png'
import voice from '../icons/voice.png'

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

  const sendVoice = () => {
    console.log('음성 전송');
  }

  return (
    <div className="chatbot-container">
      <Header />
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
          <button onClick={sendMessage} className='send-button'>
            <img src={send} alt="send-message" />
          </button>
          <button onClick={sendVoice} className='voice-button'>
            <img src={voice} alt="send-voice" />
          </button>
        </div>
    </div>
  );
}
