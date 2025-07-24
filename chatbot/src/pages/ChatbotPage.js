import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '../components/Header/Header';
import '../styles/ChatbotPage.css';
import send from '../icons/send.png'
import voice from '../icons/voice.png'

export default function ChatbotPage() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('bot_id') || 'a1';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // 첫멘트(first_text) 불러오기
  useEffect(() => {
    fetch(`http://localhost:8000/bots/${botId}`)
      .then(res => res.json())
      .then(data => {
        const first_text = data.first_text || '안녕하세요! 무엇을 도와드릴까요?';
        setMessages([{ from: 'bot', text: first_text }]);
      })
      .catch(err => {
        console.error('greeting load error:', err);
      });
  }, [botId]);

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
