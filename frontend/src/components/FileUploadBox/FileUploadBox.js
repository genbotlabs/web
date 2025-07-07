import React, { useState } from 'react';
import logo from '../../icons/logo.png';
import '../FileUploadBox/FileUploadBox.css'


export default function FileUploadBox({ onFileChange, validationResult, setValidationResult }) {
    const [files, setFiles] = useState([]);
    const [thumbnails, setThumbnails] = useState({});
    // const [validationResult, setValidationResult] = useState([]);
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

    const handleFormatCheck = async (file) => {
        const MAX_SIZE = 30 * 1024 * 1024;

        let result;

        if (file.size > MAX_SIZE) {
            result = {
            name: file.name,
            valid: false,
            reason: '파일 크기가 10MB를 초과함'
            };
        } else if (file.name.endsWith('.pdf')) {
            result = {
            name: file.name,
            valid: true,
            reason: 'PDF 형식 확인됨'
            };
        } else if (file.name.endsWith('.json')) {
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);

                const isValidArray = Array.isArray(parsed) &&
                    parsed.every(item => typeof item.Q === 'string' && typeof item.A === 'string');

                result = isValidArray
                    ? { name: file.name, valid: true, reason: 'JSON 형식 확인됨' }
                    : { name: file.name, valid: false, reason: 'JSON 형식이 올바르지 않음 (Q, A 구조 아님)' };
                } catch {
                result = {
                    name: file.name,
                    valid: false,
                    reason: 'JSON 파싱 실패'
                };
            }
        } else {
            result = {
            name: file.name,
            valid: false,
            reason: '지원되지 않는 파일 형식'
            };
        }

        console.log("파일 검사 결과:", result);
        setValidationResult(prev => {
            const others = prev.filter(item => item.name !== file.name);
            return [...others, result];
        });
    };

    const getValidationClass = (fileName) => {
        const result = validationResult.find(r => r.name === fileName);
        if (!result) return '';
        return result.valid ? 'check-success' : 'check-fail';
    };

    const handleFileDelete = (index) => {
        const updated = [...files];
        updated.splice(index, 1);
        setFiles(updated);
        onFileChange(updated);
    };

    return (
        <div className="file-upload-box">
            <input type="file" multiple accept=".pdf,.json" onChange={handleFileChange} />
            <div className="file-list">
                {files.map((file, idx) => (
                    <div className='file-name' key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div className="tooltip-container">
                            <button className="delete-btn" onClick={() => handleFileDelete(idx)}>×</button>

                            <div className='thumbnail'>
                                <img src={thumbnails[file.name]} alt="preview" style={{ width: '80px', height: '100px', marginRight: '10px' }} />
                            </div>

                            <div className='data_info'>
                                <div
                                className="file-name-wrapper"
                                onMouseEnter={() => setTooltipIndex(idx)}
                                onMouseLeave={() => setTooltipIndex(null)}
                                >
                                <p style={{ cursor: 'pointer' }}>{file.name}</p>
                                {tooltipIndex === idx && (
                                    <div className="tooltip-box">
                                    크기: {(file.size / 1024).toFixed(2)} KB
                                    </div>
                                )}
                                </div>

                                <button
                                type="button"
                                className={`check-btn ${getValidationClass(file.name)}`}
                                onClick={() => handleFormatCheck(file)}
                                >
                                형식 확인하기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
