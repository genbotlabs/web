import React, { useState } from 'react';
import '../styles/GenerateBotPage.css';
import FileUploadBox from '../components/FileUploadBox/FileUploadBox.js';

export default function GenerateBotPage() {
    const [form, setForm] = useState({
        type: [],
        company: '',
        purpose: '',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('🧾 최종 제출 폼:', form);
        // TODO: API 호출
    };

    return (
        <form className="generate-bot-form" onSubmit={handleSubmit}>
            <div className='question-1'>
                <label>생성할 봇을 선택해 주세요. (한 가지 이상)</label>
                <div>
                    <input type="checkbox" value="챗봇" onChange={handleCheckbox} /> 챗봇
                    <input type="checkbox" value="보이스봇" onChange={handleCheckbox} style={{ marginLeft: "10px" }} /> 보이스봇
                </div>
            </div>
            <div className='question-2'>
                <label>회사명을 입력해 주세요.</label>
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
                <br/>
                <input name="greeting" value={form.greeting} onChange={handleChange} placeholder="예시: 안녕하세요. OOO의 챗봇입니다..." />
            </div>
            <div className='question-5'>
                <label>봇에 대한 설명을 입력해 주세요. <span>(선택)</span></label>
                <br/>
                <input name="description" value={form.description} onChange={handleChange} placeholder="예시: GenBot은 문의를 돕는 봇입니다." />
            </div>

            <FileUploadBox />

            <button type="submit" className="submit-btn">생성하기</button>
        </form>
    );
}
