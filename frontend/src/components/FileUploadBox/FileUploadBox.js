import React, { useState } from 'react';

export default function FileUploadBox({ onFileChange }) {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        const newFiles = [...files, ...selected];

        if (newFiles.length > 10) {
            alert("최대 10개 파일까지만 업로드할 수 있습니다.");
            return;
        }

        setFiles(newFiles);
        onFileChange(newFiles);
    };

    return (
        <div className="file-upload-box">
            <input type="file" multiple accept=".pdf,.json" onChange={handleFileChange} />
            <div className="file-list">
                {files.map((file, idx) => (
                    <div key={idx}>{file.name}</div>
                ))}
            </div>
        </div>
    );
}
