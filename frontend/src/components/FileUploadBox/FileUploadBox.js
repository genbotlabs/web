import React, { useState } from 'react';

export default function FileUploadBox() {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files).slice(0, 10);
        setFiles(selected);
    };

    return (
        <div className="file-upload-box">
            <div className="upload-header">
                <span>데이터 업로드하기</span>
                <a href="/example-data.pdf" target="_blank" rel="noreferrer">데이터 예시 보기</a>
            </div>
            <ul>
                <li>.json, PDF 파일만 업로드 할 수 있습니다.</li>
                <li>파일은 최대 10개까지, 각 파일은 30MB까지 가능합니다.</li>
            </ul>
            <input type="file" multiple accept=".pdf,.json" onChange={handleFileChange} />
            <div className="file-list">
                {files.map((file, idx) => (
                    <div key={idx}>{file.name}</div>
                ))}
            </div>
        </div>
    );
}
