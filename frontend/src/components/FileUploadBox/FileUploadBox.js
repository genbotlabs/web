import React, { useState } from 'react';
import logo from '../../icons/logo.png';


export default function FileUploadBox({ onFileChange }) {
    const [files, setFiles] = useState([]);
    const [thumbnails, setThumbnails] = useState({});

    const handleFileChange = async (e) => {
        const selected = Array.from(e.target.files);
        const newFiles = [...files, ...selected].slice(0, 10);

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
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <img
                            src={thumbnails[file.name]}
                            alt={file.name}
                            style={{ width: '80px', height: '100px', objectFit: 'cover', backgroundColor: '#f0f0f0', marginRight: '10px' }}
                        />
                        <div>
                            <p>{file.name}</p>
                            <button>형식 확인하기</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
