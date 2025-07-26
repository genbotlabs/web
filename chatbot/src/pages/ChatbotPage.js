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
  const [loading, setLoading] = useState(false);

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

  // 메시지 전송(텍스트 입력, 음성 인식 공통)
  const sendMessage = async (userInput) => {
    const textToSend = userInput !== undefined ? userInput : input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { from: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const turn = messages.filter(msg => msg.from === 'user').length + 1;
      const response = await fetch(`http://localhost:8000/bots/${botId}/sllm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          turn: turn, 
          role: 'user', 
          content: textToSend
        })
      });

      if (!response.body) throw new Error('스트림 body 없음 오류');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponse = '';

      const appendPartial = (text) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.from === 'bot' && last.partial) {
            return [...prev.slice(0, -1), { from: 'bot', text, partial: true }];
          } else {
            return [...prev, { from: 'bot', text, partial: true }];
          }
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botResponse += decoder.decode(value);
        appendPartial(botResponse);
      }
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.partial) {
          return [...prev.slice(0, -1), { from: 'bot', text: last.text }];
        }
        return prev;
      });
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: '답변 중 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  };

  // 엔터키로 메시지 전송
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // 음성 인식 및 전송
  const sendVoice = async () => {
    const sessionId = searchParams.get('session_id') || 'test-session';
    try {
      // 1. 녹음 (WAV, PCM 등 Whisper 최적화)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // 백엔드에서 webm 지원시 그대로, 아니면 WAV로 변환 필요
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // (선택) webm → wav 변환 필요시 ffmpeg.wasm 등 사용 (백엔드가 webm 바로 받을 수 있으면 생략)
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');

        setLoading(true);
        try {
          // 2. Whisper Streaming API로 전송
          const res = await fetch(`http://localhost:8000/api/voicebot/${sessionId}/voice`, {
            method: 'POST',
            body: formData,
          });

          // 3. 응답: 음성 텍스트가 여러 문장일 수 있음
          let text = '';
          try {
            // Whisper 스트리밍 응답이 텍스트라면
            text = await res.text();
            if (!text) throw new Error('음성 인식 결과 없음');
          } catch (e) {
            alert('STT 응답 파싱 실패');
          }

          // 4. 입력창에 자동 입력 & 메시지에 바로 추가
          setInput(text);
          setMessages(prev => [...prev, { from: 'user', text }]);
          // 5. 바로 SLLM으로 텍스트 전송
          await sendMessage(text);

        } catch (err) {
          console.error('음성 전송 실패:', err);
          alert('음성 인식 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 6000); // 최대 6초(실사용에 맞게 조정)
    } catch (err) {
      alert('마이크 권한이 필요합니다.');
    }
  };

  return (
    <div className="chatbot-container">
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
