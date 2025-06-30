import React, { useEffect, useState } from 'react';

export default function PendingPage() {
    const [botInfo, setBotInfo] = useState(null);

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
                        <td><button>사용한 데이터 보기</button></td>
                        <td>처리 중...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
