import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import '../styles/ChatbotPage.css';
import sendIcon from '../icons/send.png';
import voiceIcon from '../icons/voice.png';

const runpodUrl = process.env.REACT_APP_RUNPOD_URL;
const apiUrl = process.env.REACT_APP_API_URL;

export default function ChatbotPage() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('bot_id') || 'a1';
  const sessionId = searchParams.get('session_id');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const silenceAnimationRef = useRef(null);
  const chunksRef = useRef([]);

  // 초기 인삿말 불러오기
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const res = await fetch(`${apiUrl}/bots/detail/${botId}`, {
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
      const res = await fetch(`${runpodUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_id: botId,
          session_id: sessionId,
          question: textToSend
        })
      });

      const data = await res.json();
      addMessage('bot', data.answer);

    } catch (err) {
      console.error(err);
      addMessage('bot', '답변 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const sendVoiceFile = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      return alert("🎙️ 마이크 권한이 필요합니다.");
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');
      formData.append('bot_id', botId);
      formData.append('session_id', sessionId);

    try {
      const res = await fetch(`${apiUrl}/voicebot/voicebot`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('업로드 실패');
      // 오디오 스트림 받기
      const ttsBlob = await res.blob();
      const url = URL.createObjectURL(ttsBlob);
      new Audio(url).play();
    } catch (err) {
      alert('음성 업로드 실패: ' + err.message);
    }
    stream.getTracks().forEach(track => track.stop());
  };
  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 6000);
};
    //   try {
    //     const res = await fetch(`${apiUrl}/voicebot`, {
    //       method: 'POST',
    //       body: formData,
    //     });
    //     if (!res.ok) throw new Error('업로드 실패');
    //     const result = await res.json();

    //     // 결과가 음성 파일(blob)로 온다면:
    //     const audioBlob = await res.blob();
    //     const url = URL.createObjectURL(audioBlob);
    //     new Audio(url).play();

    //     // 결과가 텍스트라면:
    //     // addMessage('bot', result.text || result.answer || '음성 인식 결과를 받았습니다.');

    //   } catch (err) {
    //     alert('음성 업로드 실패: ' + err.message);
    //   }
    //   stream.getTracks().forEach(track => track.stop());
    // };

  //  // 6초 녹음
  //   mediaRecorder.start();
  //   setTimeout(() => mediaRecorder.stop(), 6000);
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
        <button onClick={sendVoiceFile} className="voice-button" disabled={loading}>
          <img src={voiceIcon} alt="음성 보내기" />
        </button>
      </div>
    </div>
  );
}
