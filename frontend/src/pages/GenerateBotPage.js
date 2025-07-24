import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons"
import "../styles/GenerateBotPage.css"

export default function GenerateBotPage({ user }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [form, setForm] = useState({
        company: "",
        botName: "",
        email: "",
        consultantNumber: "",
        greeting: "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter((file) => {
        const fileType = file.type
        const fileName = file.name.toLowerCase()
        return (
            fileType === "application/pdf" ||
            fileType === "application/json" ||
            fileName.endsWith(".pdf") ||
            fileName.endsWith(".json")
        )
        })

        if (validFiles.length !== files.length) {
        alert("PDF 또는 JSON 파일만 업로드 가능합니다.")
        }

        const newFiles = validFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        selected: false,
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])
    }

    const handleFileSelect = (fileId) => {
        setUploadedFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)))
    }

    const handleFileRemove = (fileId) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.company.trim()) return alert("회사명을 입력해주세요.")
        if (!form.botName.trim()) return alert("봇 이름을 입력해주세요.")
        if (!form.email.trim()) return alert("이메일을 입력해주세요.")
        if (uploadedFiles.length === 0) return alert("최소 1개의 파일을 업로드해주세요.")

        const selectedFiles = uploadedFiles.filter((file) => file.selected)
        if (selectedFiles.length === 0) return alert("사용할 파일을 선택해주세요.")

        setLoading(true)

        const formData = new FormData()
        const user_id = user?.user_id || "test_user"
        formData.append("user_id", user_id)
        formData.append("company", form.company)
        formData.append("bot_name", form.botName)
        formData.append("email", form.email)
        formData.append("consultant_number", form.consultantNumber || "")
        formData.append("greeting", form.greeting || "")

        selectedFiles.forEach((fileObj) => {
        formData.append("files", fileObj.file)
        })

        try {
        const response = await fetch("http://localhost:8000/bots", {
            method: "POST",
            body: formData,
        })

        if (response.ok) {
            const result = await response.json()
            console.log("서버 응답:", result)
            localStorage.setItem(
            "lastBotRequest",
            JSON.stringify({
                ...form,
                files: selectedFiles.map((file) => ({ name: file.name })),
            }),
            )
            navigate("/generate/pending")
        } else {
            alert("서버 오류가 발생했습니다.")
        }
        } catch (err) {
        console.error("전송 실패:", err)
        alert("요청 중 오류가 발생했습니다.")
        } finally {
        setLoading(false)
        }
    }

    const isFormValid =
        form.company.trim() &&
        form.botName.trim() &&
        form.email.trim() &&
        uploadedFiles.length > 0 &&
        uploadedFiles.some((file) => file.selected)

  return (
    <div className="generate-bot-page">
        <div className="generate-bot-container">
            <div className="generate-bot-content">
                {/* Left Section - Bot Information */}
                <div className="bot-info-section">
                    <h2 className="section-title">봇 정보 입력</h2>
                    <p className="section-subtitle">봇 생성에 필요한 기본 정보를 입력해주세요.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                            회사명 <span className="required">*</span>
                            </label>
                            <input
                            type="text"
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="예시: GenBot"
                            className="form-input"
                            required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                            봇 이름 <span className="required">*</span>
                            </label>
                            <input
                            type="text"
                            name="botName"
                            value={form.botName}
                            onChange={handleChange}
                            placeholder="예시: 고객상담봇"
                            className="form-input"
                            required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                            이메일 <span className="required">*</span>
                            </label>
                            <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="예시: contact@genbot.com"
                            className="form-input"
                            required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">상담원 번호</label>
                            <input
                            type="text"
                            name="consultantNumber"
                            value={form.consultantNumber}
                            onChange={handleChange}
                            placeholder="예시: 1588-0000"
                            className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">인사말</label>
                            <textarea
                            name="greeting"
                            value={form.greeting}
                            onChange={handleChange}
                            placeholder="예시: 안녕하세요! 무엇을 도와드릴까요?"
                            className="form-input form-textarea"
                            />
                        </div>
                    </form>
                </div>

                {/* Right Section - Data Upload */}
                <div className="data-section">
                    <h2 className="section-title">사용할 데이터</h2>
                    <p className="section-subtitle">봇 학습에 사용할 데이터를 업로드하고 선택해주세요.</p>

                    <div className="upload-area">
                        <div className="upload-instructions">
                            1. JSON, PDF 파일을 업로드할 수 있습니다.
                            <br />
                            2. 파일 개수는 최대 10개까지 가능합니다.
                            <br />
                            3. 각 파일의 크기는 최대 30MB입니다.
                            <br />
                            4. 데이터 형식 확인 후 사용할 파일을 선택해주세요.
                        </div>

                        <input
                            type="file"
                            multiple
                            accept=".pdf,.json"
                            onChange={handleFileUpload}
                            className="hidden-file-input"
                            id="file-upload"
                        />

                        <label htmlFor="file-upload" className="upload-button">
                            <PlusOutlined style={{ marginRight: "8px" }} />
                            파일 업로드
                        </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="file-list">
                            {uploadedFiles.map((fileObj) => (
                                <div key={fileObj.id} className="file-item">
                                    <div className="file-info">
                                        <div className="file-icon">
                                            <FileTextOutlined />
                                        </div>
                                        <span className="file-name">{fileObj.name}</span>
                                    </div>
                                    <div className="file-actions">
                                        <button
                                            type="button"
                                            className="select-button"
                                            onClick={() => handleFileSelect(fileObj.id)}
                                            style={{
                                                background: fileObj.selected ? "#10b981" : "#3b82f6",
                                            }}
                                        >
                                            {fileObj.selected ? "선택됨" : "선택"}
                                        </button>
                                        <button type="button" className="remove-button" onClick={() => handleFileRemove(fileObj.id)}>
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" className="generate-button" onClick={handleSubmit} disabled={!isFormValid || loading}>
                        {loading && <div className="loading-spinner"></div>}
                        {loading ? "생성 중..." : "생성하기"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}
