import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import '../styles/ChatbotPage.css';
import send from '../icons/send.png';
import voice from '../icons/voice.png';
import Header from '../components/Header/Header';

export default function ChatbotPage() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('bot_id') || 'a1';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const silenceAnimationRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetch(`http://localhost:8000/bots/${botId}`)
      .then(res => res.json())
      .then(data => {
        const first_text = data.first_text || '안녕하세요! 무엇을 도와드릴까요?';
        setMessages([{ from: 'bot', text: first_text }]);
      })
      .catch(err => console.error('greeting load error:', err));
  }, [botId]);

  const sendMessage = async (overrideText) => {
    const content = overrideText || input;
    if (!content.trim() || loading) return;

    const userMessage = { from: 'user', text: content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const turn = messages.filter(msg => msg.from === 'user').length + 1;
      const response = await fetch(`http://localhost:8000/bots/${botId}/sllm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turn, role: 'user', content })
      });

      if (!response.body) throw new Error('스트림 body 없음 오류');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let botResponse = '';
      const appendPartial = (text) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.from === 'bot' && last.partial) {
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
        if (last?.partial) return [...prev.slice(0, -1), { from: 'bot', text: last.text }];
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    cancelAnimationFrame(silenceAnimationRef.current);
    setIsRecording(false);
  };

  const sendVoice = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      chunksRef.current = chunks;
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      sourceNode.connect(analyser);
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      let silenceStart = null;
      const maxSilence = 5000;
      setIsRecording(true);

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
            stopRecording();
            return;
          }
        } else {
          silenceStart = null;
        }

        silenceAnimationRef.current = requestAnimationFrame(detectSilence);
      };

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
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
      setIsRecording(false);
    }
  };

  return (
    <>
      <Header />
      <div className="chatbot-container">
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {isRecording && (
          <div className="clova-voice-ui">
            <div className="clova-voice-text">말씀 중입니다...</div>
            <div className="clova-voice-panel">
              <div className="clova-wave wave1"></div>
              <div className="clova-wave wave2"></div>
              <div className="clova-mic-icon">🎤</div>
            </div>
          </div>
        )}

        <div className="chat-input">
          <input
            type="text"
            placeholder="질문을 입력해 주세요."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {!input.trim() ? (
            <button onClick={sendVoice} className={`voice-button ${isRecording ? 'recording' : ''}`}>
              <img src={voice} alt="send-voice" />
            </button>
          ) : (
            <button onClick={() => sendMessage()} className="send-button">
              <img src={send} alt="send-message" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
