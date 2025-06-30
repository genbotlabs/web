import React, { useEffect, useState } from 'react';

export default function PendingPage() {
    const [botInfo, setBotInfo] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('lastBotRequest');
        if (savedData) {
            setBotInfo(JSON.parse(savedData));
        }
    }, []);

    if (!botInfo) {
        return <div style={{ padding: "2rem" }}>봇 생성 정보를 불러오는 중...</div>;
    }

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>봇 생성 요청이 완료되었습니다.</h2>
            <p>PDF 또는 JSON을 분석 중입니다.<br />
                생성이 완료되면 이메일로 결과를 안내드릴게요.</p>
            <br /><br /><br />
            <table align='center' border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>봇 이름</th>
                        <th>회사명</th>
                        <th>봇 용도</th>
                        <th>봇 설명</th>
                        <th>사용한 데이터</th>
                        <th>진행 상황</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{botInfo.type.join(', ')}</td>
                        <td>{botInfo.company}</td>
                        <td>{botInfo.purpose}</td>
                        <td>{botInfo.description || '-'}</td>
                        <td><button onClick={() => setShowPopup(true)}>사용한 데이터 보기</button></td>
                        <td>처리 중...</td>
                    </tr>
                </tbody>
            </table>
            {showPopup && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000
                        }}
                        onClick={() => setShowPopup(false)}
                    >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            minWidth: '300px',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                    <h3>사용한 데이터 목록</h3>
                    <ul>
                        {Array.isArray(botInfo.files) && botInfo.files.length > 0 ? (
                            botInfo.files.map((file, idx) => <li key={idx}>{file.name}</li>)
                            ) : (
                            <li>저장된 파일 정보 없음</li>
                        )}
                    </ul>
                    <button onClick={() => setShowPopup(false)}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
}
