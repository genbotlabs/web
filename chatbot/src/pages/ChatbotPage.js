import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import '../styles/ChatbotPage.css';
import sendIcon from '../icons/send.png';
import voiceIcon from '../icons/voice.png';
import botIcon from '../icons/bot.png';
import userIcon from '../icons/user.png';

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
  const wavePanelRef = useRef(null);

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
  const addMessage = (from, text, partial = false, extra = {}) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      const newMessage = { from, text, partial, ...extra };
  
      if (partial && last?.from === from && last.partial) {
        return [...prev.slice(0, -1), newMessage];
      } else {
        return [...prev, newMessage];
      }
    });
  };

  // 텍스트 메시지 전송 (키보드 입력 시 사용)
  const sendMessage = async (textToSend = input) => {
    if (!textToSend.trim() || loading) return;
    addMessage('user', textToSend);
    setInput('');
    setLoading(true);
  
    // 1. 일단 빈 partial 메시지로 bot 영역 자리 확보
    addMessage('bot', '', true); // true = partial
  
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
  
      if (!res.ok) throw new Error('응답 실패');
  
      const data = await res.json();
      const answer = data.answer || '답변이 없습니다.';
  
      // 2. 한 글자씩 타이핑처럼 보여주기
      let currentText = '';
      for (let i = 0; i < answer.length; i++) {
        currentText += answer[i];
  
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.from === 'bot' && last.partial) {
            return [...prev.slice(0, -1), { from: 'bot', text: currentText, partial: true }];
          }
          return prev;
        });
  
        await new Promise(resolve => setTimeout(resolve, 30)); // 글자당 delay (ms)
      }
  
      // 3. partial → false 처리로 고정
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.from === 'bot' && last.partial) {
          return [...prev.slice(0, -1), { from: 'bot', text: last.text }];
        }
        return prev;
      });
  
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.from === 'bot' && last.partial) {
          return [...prev.slice(0, -1), { from: 'bot', text: '답변 중 오류가 발생했습니다.' }];
        }
        return [...prev, { from: 'bot', text: '답변 중 오류가 발생했습니다.' }];
      });
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

  const sendVoiceFile = async () => {
    try {
      if (isRecording) {
        stopRecording();
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        return alert("🎙️ 마이크 권한이 필요합니다.");
      }

      addMessage('user', '', false, {
        isVoice: true,
        waveform: true
      });

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
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
          const ttsBlob = await res.blob();
          const url = URL.createObjectURL(ttsBlob);
          new Audio(url).play();
        } catch (err) {
          alert('음성 업로드 실패: ' + err.message);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      detectSilence();
      setTimeout(() => mediaRecorder.stop(), 5000);

    } catch (err) {
      console.error('마이크 권한 오류:', err);
      alert('마이크 권한이 필요합니다.');
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecording) return;
  
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser = audioContext.createAnalyser();
    let dataArray = new Uint8Array(analyser.frequencyBinCount);
    let source;
    let animationFrameId;
  
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
  
      const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
  
        // ✅ clova-voice-panel의 파형 조작
        const waveEls = wavePanelRef.current?.querySelectorAll('.clova-wave');
        if (waveEls) {
          waveEls.forEach((el, i) => {
            const height = Math.max(8, Math.min(40, avg / (3 + i)));
            el.style.height = `${height}px`;
          });
        }
  
        // ✅ 사용자 메시지 내 파형도 조작
        const inlineWaves = document.querySelectorAll('.inline-voice-wave .clova-wave');
        inlineWaves.forEach((el, i) => {
          const height = Math.max(8, Math.min(40, avg / (3 + i)));
          el.style.height = `${height}px`;
        });
  
        animationFrameId = requestAnimationFrame(animate);
      };
  
      animationFrameId = requestAnimationFrame(animate);
    });
  
    return () => {
      cancelAnimationFrame(animationFrameId);
      analyser.disconnect();
      source?.disconnect();
      audioContext.close();
    };
  }, [isRecording]);

  return (
    <>
      <Header />
      <div className="chatbot-container">
        <div className="chat-window">
          
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.from}`}>
            
            <div className={`message ${msg.from} ${msg.partial ? 'partial' : ''}`}>
              {/* 파형 렌더링 */}
              {msg.isVoice && msg.waveform ? (
                <div className="inline-voice-wave" id="wave-target">
                  <div className="clova-wave"></div>
                  <div className="clova-wave"></div>
                  <div className="clova-wave"></div>
                  <div className="clova-wave"></div>
                </div>
              ) : msg.partial && !msg.text ? (
                <span className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              ) : (
                msg.text
              )}
            </div>

            {msg.from === 'user' && msg.isRecording && (
              <div className="inline-voice-wave">
                <div className="clova-wave"></div>
                <div className="clova-wave"></div>
                <div className="clova-wave"></div>
                <div className="clova-wave"></div>
              </div>
            )}
          </div>
        ))}
        </div>

        {isRecording && (
          <div className="clova-voice-panel" ref={wavePanelRef}>
            <div className="clova-wave" />
            <div className="clova-wave" />
            <div className="clova-wave" />
            <div className="clova-wave" />
            <div className="clova-mic-icon">🎤</div>
          </div>
          )}
        
        <div className='chat-footer'>
          <div className="chat-input">
            <input
              type="text"
              placeholder="질문을 입력해 주세요."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          {!input.trim() ? (
            <button onClick={sendVoiceFile} className={`voice-button ${isRecording ? 'recording' : ''}`} disabled={loading}>
              <img src={voiceIcon} alt="음성 보내기" />
            </button>
          ) : (
            <button onClick={() => sendMessage()} className="send-button" disabled={loading}>
              <img src={sendIcon} alt="보내기" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
