import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/GenerateBotPage.css';
import FileUploadBox from '../components/FileUploadBox/FileUploadBox.js';


export default function GenerateBotPage() {
    const navigate = useNavigate();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [form, setForm] = useState({
        type: [],
        company: '',
        usage: '',
        greeting: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (e) => {
        const { value, checked } = e.target;
        setForm(prev => ({
            ...prev,
            type: checked
                ? [...prev.type, value]
                : prev.type.filter(t => t !== value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.type.length === 0) return alert("생성할 봇을 한 가지 이상 선택해 주세요.");
        if (!form.company.trim()) return alert("회사명을 입력해주세요.");
        if (!form.purpose.trim()) return alert("봇의 용도를 입력해주세요.");
        if (uploadedFiles.length === 0) return alert("PDF 또는 JSON 파일을 최소 1개 업로드해주세요.");

        const formData = new FormData();
        formData.append('type', form.type.join(','));
        formData.append('company', form.company);
        formData.append('purpose', form.purpose);
        formData.append('greeting', form.greeting || '');
        formData.append('description', form.description || '');

        uploadedFiles.forEach((file, index) => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8000/api/generate-bot', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log("서버 응답:", result);
                navigate('/generate/pending');
            } else {
                alert("서버 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error("전송 실패:", err);
            alert("요청 중 오류가 발생했습니다.");
        }
    };



    return (
        <form className="generate-bot-form" onSubmit={handleSubmit}>
            <div className='question-1'>
                <label>생성할 봇을 선택해 주세요.<span><strong>*</strong></span></label>
                <p>한 가지 이상 선택해 주세요.</p>
                <div>
                    <input type="checkbox" value="챗봇" onChange={handleCheckbox} /> 챗봇
                    <input type="checkbox" value="보이스봇" onChange={handleCheckbox} style={{ marginLeft: "10px" }} /> 보이스봇
                </div>
            </div>
            <div className='question-2'>
                <label>회사명을 입력해 주세요.<span><strong>*</strong></span></label>
                <br/>
                <input name="company" value={form.company} onChange={handleChange} placeholder="예시: GenBot" required />
            </div>
            <div className='question-3'>
                <label>봇의 용도를 입력해 주세요.</label>
                <br/>
                <input name="purpose" value={form.purpose} onChange={handleChange} placeholder="예시: 문의" required />
            </div>
            <div className='question-4'>
                <label>봇의 첫 멘트를 입력해 주세요. <span>(선택)</span></label>
                <p>입력하지 않으실 경우, 예시 문장이 자동으로 입력됩니다.</p>
                <br/>
                <input name="greeting" value={form.greeting} onChange={handleChange} placeholder="예시: 안녕하세요. OOO의 챗봇입니다..." />
            </div>
            <div className='question-5'>
                <label>봇에 대한 설명을 입력해 주세요. <span>(선택)</span></label>
                <p>입력하신 설명은 챗봇에 표시될 예정입니다.</p>
                <br/>
                <input name="description" value={form.description} onChange={handleChange} placeholder="예시: GenBot은 문의를 돕는 봇입니다." />
            </div>

            <div className='file-upload'>
                <label>데이터 업로드하기<span><strong>*</strong></span></label>
                <button className='show-data-ex'>데이터 예시보기</button>
                <p>
                    - json, PDF 파일을 업로드 할 수 있습니다. <br/>
                    - 파일의 개수는 최대 10개이고, 각 파일의 크기 제한은 30MB입니다. <br/>
                    - 데이터 예시 보기 버튼을 통해 데이터 형식을 확인해 주세요. <br/>
                    - 데이터 형식 확인 버튼을 통해 데이터 형식 검사를 받아주세요. <br/>
                </p>
                <FileUploadBox onFileChange={setUploadedFiles}/>
            </div>
            

            <button type="submit" className="submit-btn">생성하기</button>
        </form>
    );
}
