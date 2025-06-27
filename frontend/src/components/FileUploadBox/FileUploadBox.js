import React, { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorkerScript from 'pdfjs-dist/build/pdf.worker.js';
import logo from '../../icons/logo.png';

const workerBlob = new Blob([pdfWorkerScript], { type: 'application/javascript' });
const workerBlobUrl = URL.createObjectURL(workerBlob);
pdfjs.GlobalWorkerOptions.workerSrc = workerBlobUrl;


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

        // 썸네일 
        for (const file of selected) {
            if (file.type === 'application/pdf') {
                const fileReader = new FileReader();
                fileReader.onload = async () => {
                    try {
                        const typedArray = new Uint8Array(fileReader.result);
                        const pdf = await pdfjs.getDocument(typedArray).promise;
                        const page = await pdf.getPage(1);
                        const viewport = page.getViewport({ scale: 1 });

                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        await page.render({ canvasContext: context, viewport }).promise;

                        const thumbnail = canvas.toDataURL();
                        setThumbnails(prev => ({ ...prev, [file.name]: thumbnail }));
                    } catch (err) {
                        console.error('PDF 썸네일 생성 실패:', err);
                    }
                };
                fileReader.readAsArrayBuffer(file);
            } else {
                setThumbnails(prev => ({ ...prev, [file.name]: logo }));
            }
        }
    };

    return (
        <div className="file-upload-box">
            <input type="file" multiple accept=".pdf,.json" onChange={handleFileChange} />
            <div className="file-list">
                {files.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <img
                            src={thumbnails[file.name]}
                            alt="preview"
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
