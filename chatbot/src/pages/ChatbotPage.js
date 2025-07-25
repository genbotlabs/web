import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate  } from 'react-router-dom';

import Header from '../components/Header/Header';
import '../styles/ChatbotPage.css';
import send from '../icons/send.png'
import voice from '../icons/voice.png'

export default function ChatbotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('bot_id') || 'a1';
  const sessionId = location.state?.session_id;

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

  useEffect(() => {
  if (!sessionId) {
    alert('세션 정보가 없습니다. 메인 화면으로 이동합니다.');
    navigate('/');
  }
}, [sessionId, navigate]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const turn = messages.filter(msg => msg.from === 'user').length + 1;
      const response = await fetch(`http://localhost:8000/chatbot/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          turn: turn, 
          role: 'user', 
          content: input 
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

      // 스트리밍 완료되면 partial flag 제거
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.partial) {
          return [...prev.slice(0, -1), { from: 'bot', text: last.text }];
        }
        return prev;
      });

    } catch (err) {
      console.error('chat error:', err);
      setMessages(prev => [...prev, { from: 'bot', text: '답변 중 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const sendVoice = async () => {
    const botId = searchParams.get('bot_id') || 'a1';
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
  
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      sourceNode.connect(analyser);
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
  
      let silenceStart = null;
      const maxSilence = 5000;  // 최대 침묵 시간
  
      const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const normalized = dataArray[i] / 128 - 1;
          sum += normalized * normalized;
        }
        const volume = Math.sqrt(sum / bufferLength);
  
        if (volume < 0.01) {
          if (!silenceStart) silenceStart = Date.now();
          else if (Date.now() - silenceStart > maxSilence) {
            console.log('자동 종료: 음성 없음 감지');
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
            return;
          }
        } else {
          silenceStart = null; // 다시 말 시작하면 시간 초기화
        }
  
        requestAnimationFrame(detectSilence);
      };
  
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
  
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');
  
        try {
          const res = await fetch(`http://localhost:8000/bots/${botId}/stt`, {
            method: 'POST',
            body: formData,
          });
  
          const data = await res.json();
          if (data.text) {
            setInput(data.text);
            sendMessage(data.text);
          } else {
            alert('음성 인식에 실패했습니다.');
          }
        } catch (err) {
          console.error('STT 전송 실패:', err);
          alert('음성 전송 중 오류가 발생했습니다.');
        }
      };
  
      mediaRecorder.start();
      detectSilence();
  
    } catch (err) {
      console.error('마이크 권한 오류:', err);
      alert('마이크 권한이 필요합니다.');
    }
  }

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
