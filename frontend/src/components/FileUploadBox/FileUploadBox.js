import React, { useState } from 'react';
import logo from '../../icons/logo.png';
import '../FileUploadBox/FileUploadBox.css'


export default function FileUploadBox({ onFileChange }) {
    const [files, setFiles] = useState([]);
    const [thumbnails, setThumbnails] = useState({});
    const [tooltipIndex, setTooltipIndex] = useState(null);

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
                    <div className='file-name' key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div className="tooltip-container">
                            <div className='thumbnail'>
                                <img src={thumbnails[file.name]} alt="preview" style={{ width: '80px', height: '100px', marginRight: '10px' }} />
                            </div>
                            <div className='data_info'>
                                <p style={{ cursor: 'pointer' }}>{file.name}</p>
                                <div className="tooltip-box">
                                    크기: {(file.size / 1024).toFixed(2)} KB
                                </div>
                                <button type="button">형식 확인하기</button>
                            </div>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
