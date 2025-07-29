import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import '../styles/ChatbotPage.css';
import sendIcon from '../icons/send.png';
import voiceIcon from '../icons/voice.png';

export default function ChatbotPage() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('bot_id') || 'a1';
  const sessionId = searchParams.get('session_id');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 초기 인삿말 불러오기
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const res = await fetch(`http://localhost:8000/bots/bot_id/${botId}`, {
          method: 'GET'
        });
        const data = await res.json();
        console.log('first_text', data.first_text)
        const firstText = data.first_text || '안녕하세요! 무엇을 도와드릴까요?';
        setMessages([{ from: 'bot', text: firstText }]);
      } catch (err) {
        console.error('초기 인삿말 로딩 실패:', err);
      }
    };
    fetchGreeting();
  }, [botId]);

  // 메시지 추가 유틸
  const addMessage = (from, text, partial = false) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (partial && last && last.from === from && last.partial) {
        return [...prev.slice(0, -1), { from, text, partial }];
      } else {
        return [...prev, { from, text, partial }];
      }
    });
  };

  // 텍스트 메시지 전송 (키보드 입력 시 사용)
  const sendMessage = async (textToSend = input) => {
    if (!textToSend.trim() || loading) return;
    addMessage('user', textToSend);
    setInput('');
    setLoading(true);

    try {
      const turn = messages.filter(msg => msg.from === 'user').length + 1;
      const res = await fetch(`http://localhost:8000/bots/${botId}/sllm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turn, role: 'user', content: textToSend })
      });

      if (!res.body) throw new Error('스트리밍 응답 없음');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botResponse += decoder.decode(value);
        addMessage('bot', botResponse, true);
      }

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.partial) {
          return [...prev.slice(0, -1), { from: 'bot', text: last.text }];
        }
        return prev;
      });

    } catch (err) {
      console.error('LLM 응답 오류:', err);
      addMessage('bot', '답변 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // ✅ 실시간 WebSocket 기반 음성 입력 → 음성 응답
  const sendVoiceStream = async () => {
    try {
      const ws = new WebSocket(`ws://localhost:8000/voicebot/ws/voice/${sessionId}`);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      ws.binaryType = 'arraybuffer';  // 중요: 음성 응답 받을 때 바이너리로 처리

      ws.onopen = () => {
        mediaRecorder.start(250);
        console.log('🎤 음성 스트리밍 시작');

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const chunk = await e.data.arrayBuffer();
            ws.send(chunk);
          }
        };
      };

      // ws.onmessage = (event) => {
      //   const blob = new Blob([event.data], { type: 'audio/webm' });  // 또는 'audio/wav'
      //   const url = URL.createObjectURL(blob);
      //   const audio = new Audio(url);
      //   audio.play();
      // };

      ws.onmessage = (event) => {
        console.log("📦 받은 데이터 타입:", typeof event.data);
        console.log("📦 받은 데이터:", event.data);
  
        const blob = new Blob([event.data], { type: 'audio/webm' });
        console.log("🎧 Blob 타입:", blob.type, "크기:", blob.size);
        
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(err => console.error("❌ 오디오 재생 실패:", err));
      };


      ws.onerror = (e) => {
        console.error('WebSocket 에러:', e);
        alert('음성 응답 중 오류 발생');
      };

      ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        stream.getTracks().forEach(track => track.stop());
      };

      setTimeout(() => {
        mediaRecorder.stop();
        ws.close();
      }, 8000); // 최대 8초 녹음

    } catch (err) {
      alert('🎙️ 마이크 권한이 필요합니다.');
    }
  };

  // const sendVoiceStream = async () => {
  //   let stream;
  //   try {
  //     // 1) 마이크 권한 & 스트림 얻기
  //     stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //   } catch (err) {
  //     return alert("🎙️ 마이크 권한이 필요합니다.");
  //   }

  //   // 2) MediaRecorder 준비 (코덱 명시)
  //   const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

  //   // 3) WebSocket 연결 & 핸들러 등록
  //   const ws = new WebSocket(`ws://localhost:8000/voicebot/ws/voice/${sessionId}`);
  //   ws.binaryType = 'arraybuffer';

  //   ws.onopen = () => {
  //     console.log("✅ WS 연결 열림 – 녹음 시작");
  //     mediaRecorder.start(250);
  //   };
  //   ws.onerror = e => console.error("❌ WS 에러:", e);
  //   ws.onclose = () => {
  //     console.log("🔒 WS 연결 닫힘");
  //     // 스트림 정리
  //     stream.getTracks().forEach(track => track.stop());
  //   };
  //   ws.onmessage = event => {
  //     console.log("📥 onmessage 호출, data 타입:", typeof event.data, event.data);
  //     const blob = new Blob([event.data], { type: 'audio/webm' });
  //     console.log("🎧 Blob 타입:", blob.type, "크기:", blob.size);
  //     const url = URL.createObjectURL(blob);
  //     new Audio(url).play().catch(err => console.error("❌ 오디오 재생 실패:", err));
  //   };

  //   // 4) 녹음 데이터를 WebSocket으로 전송
  //   mediaRecorder.ondataavailable = e => {
  //     console.log("🎤 ondataavailable, size=", e.data.size);
  //     if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
  //       ws.send(e.data);
  //       console.log("📤 청크 전송 완료");
  //     }
  //   };

  //   // 5) 8초 뒤 녹음/WS 종료
  //   setTimeout(() => {
  //     mediaRecorder.stop();
  //     ws.close();
  //   }, 8000);
  // };

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
          disabled={loading}
        />
        <button onClick={() => sendMessage()} className="send-button" disabled={loading}>
          <img src={sendIcon} alt="보내기" />
        </button>
        <button onClick={sendVoiceStream} className="voice-button" disabled={loading}>
          <img src={voiceIcon} alt="음성 보내기" />
        </button>
      </div>
    </div>
  );
}
