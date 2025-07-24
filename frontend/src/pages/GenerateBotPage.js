import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Input, Button, message } from "antd"
import { PlusOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons"
import "../styles/GenerateBotPage.css"

const { TextArea } = Input

export default function GenerateBotPage({ user }) {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState({})
    const [uploadedFiles, setUploadedFiles] = useState([])

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter((file) => {
        const fileType = file.type
        const fileName = file.name.toLowerCase()
        return (
            fileType === "application/pdf" || fileName.endsWith(".pdf")
        )
        })

        if (validFiles.length !== files.length) {
        message.error("PDF파일만 업로드 가능합니다.")
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

    const handleGenerateBot = async () => {
        // 1. 유효성 검사
        console.log(form.getFieldsValue())
        if (!form.getFieldsValue().company?.trim()) {
            message.error("회사명을 입력해주세요.");
            return;
        }
        if (!form.getFieldsValue().botName?.trim()) {
            message.error("봇 이름을 입력해주세요.");
            return;
        }
        if (!form.getFieldsValue().email?.trim()) {
            message.error("이메일을 입력해주세요.");
            return;
        }
        if (uploadedFiles.length === 0) {
            message.error("최소 1개의 파일을 업로드해주세요.");
            return;
        }
        // const selectedFiles = uploadedFiles.filter((file) => file.selected);
        // if (selectedFiles.length === 0) {
        //     message.error("사용할 파일을 선택해주세요.");
        //     return;
        // }

        setLoading(true)

        // 2. FormData 구성
        const formData = new FormData();
        const user_id = user?.user_id || "test_user";
        formData.append("user_id", user_id);
        formData.append("company", form.getFieldsValue().company);
        formData.append("bot_name", form.getFieldsValue().botName);
        formData.append("email", form.getFieldsValue().email);
        formData.append("consultant_number", form.getFieldsValue().consultantNumber || "");
        formData.append("greeting", form.getFieldsValue().greeting || "");

        uploadedFiles.forEach((fileObj) => {
            formData.append("files", fileObj.file);
        });

        console.log(formData)

        // 3. API 호출
        try {
            const response = await fetch("http://localhost:8000/bots", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                    localStorage.setItem(
                        "lastBotRequest",
                        JSON.stringify({
                        ...form.getFieldsValue(),
                        files: uploadedFiles.map((file) => ({ name: file.name })),
                        }),
                );
                message.success("봇이 성공적으로 생성되었습니다!");
                navigate("/generate/pending");
            } else {
                message.error("서버 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("전송 실패:", error);
            message.error("요청 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }

    const isFormValid = () => {
        const values = form.getFieldsValue()
        return (
            values.company?.trim() &&
            values.botName?.trim() &&
            values.email?.trim() &&
            uploadedFiles.length > 0
        )
    }

    return (
        <div className="generate-bot-page">
            <div className="generate-bot-container">
                <div className="generate-bot-content">
                    {/* Left Section - Bot Information */}
                    <div className="bot-info-section">
                        <h2 className="section-title">봇 정보 입력</h2>
                        <p className="section-subtitle">봇 생성에 필요한 기본 정보를 입력해주세요.</p>

                        <Form 
                            form={form} 
                            layout="vertical" 
                            autoComplete="off" 
                            requiredMark={false}
                            onValuesChange={(_, allValues) => setFormValues(allValues)}
                        >
                            <Form.Item
                                label={
                                <span className="form-label">
                                    회사명 <span className="required">*</span>
                                </span>
                                }
                                name="company"
                                rules={[
                                {
                                    required: true,
                                    message: "회사명을 입력해주세요.",
                                },
                                {
                                    whitespace: true,
                                    message: "회사명을 입력해주세요.",
                                },
                                ]}
                            >
                                <Input placeholder="예시: GenBot" className="form-input" size="large" />
                            </Form.Item>

                            <Form.Item
                                label={
                                <span className="form-label">
                                    봇 이름 <span className="required">*</span>
                                </span>
                                }
                                name="botName"
                                rules={[
                                {
                                    required: true,
                                    message: "봇 이름을 입력해주세요.",
                                },
                                {
                                    whitespace: true,
                                    message: "봇 이름을 입력해주세요.",
                                },
                                ]}
                            >
                                <Input placeholder="예시: 고객상담봇" className="form-input" size="large" />
                            </Form.Item>

                            <Form.Item
                                label={
                                <span className="form-label">
                                    이메일 <span className="required">*</span>
                                </span>
                                }
                                name="email"
                                rules={[
                                {
                                    required: true,
                                    message: "이메일을 입력해주세요.",
                                },
                                {
                                    type: "email",
                                    message: "올바른 이메일 형식을 입력해주세요.",
                                },
                                ]}
                            >
                                <Input placeholder="예시: contact@genbot.com" className="form-input" size="large" />
                            </Form.Item>

                            <Form.Item label={<span className="form-label">상담원 번호</span>} name="consultantNumber">
                                <Input placeholder="예시: 1588-0000" className="form-input" size="large" />
                            </Form.Item>

                            <Form.Item label={<span className="form-label">인사말</span>} name="greeting">
                                <TextArea
                                placeholder="예시: 안녕하세요! 무엇을 도와드릴까요?"
                                className="form-input form-textarea"
                                rows={4}
                                size="large"
                                />
                            </Form.Item>
                        </Form>
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

                        {/* <FileUploadBox
                            onFileChange={setUploadedFiles}
                            validationResult={validationResult}
                            setValidationResult={setValidationResult}
                        /> */}

                        <label htmlFor="file-upload" className="upload-button">
                            <PlusOutlined style={{ margin: "8px" }} />
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
                                {/* <button
                                    type="button"
                                    className="select-button"
                                    onClick={() => handleFileSelect(fileObj.id)}
                                    style={{
                                    background: fileObj.selected ? "#10b981" : "#3b82f6",
                                    }}
                                >
                                    {fileObj.selected ? "선택됨" : "선택"}
                                </button> */}
                                <button type="button" className="remove-button" onClick={() => handleFileRemove(fileObj.id)}>
                                    <DeleteOutlined />
                                </button>
                                </div>
                            </div>
                            ))}
                        </div>
                        )}

                        {/* <Button
                            type="primary"
                            size="large"
                            className="generate-button"
                            loading={loading}
                            disabled={!isFormValid()}
                            onClick={() => form.submit()}
                            block
                        >
                            {loading ? "생성 중..." : "생성하기"}
                        </Button> */}
                    </div>
                </div>
            </div>
            <Button
                type="primary"
                size="large"
                className="generate-button"
                loading={loading}
                disabled={!isFormValid()}
                onClick={handleGenerateBot}
                block
            >
                {loading ? "생성 중..." : "생성하기"}
            </Button>
        </div>
    )
}
