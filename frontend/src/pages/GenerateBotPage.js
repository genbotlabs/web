import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Input, Button, message, Modal } from "antd"
import { PlusOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons"
import "../styles/GenerateBotPage.css"

const { TextArea } = Input

export default function GenerateBotPage({ user }) {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState({})
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        if (!form.getFieldsValue().consultantNumber?.trim()) {
            message.error("상담사 번호를 입력해주세요.");
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

        const totalSize = uploadedFiles.reduce((sum, fileObj) => sum + fileObj.file.size, 0);
        if (totalSize > 10 * 1024 * 1024) {
            alert("업로드된 파일의 총 크기가 10MB를 초과했습니다. 다시 확인해주세요.");
            return;
        }

        setLoading(true);

        // 2. FormData 구성
        const formData = new FormData();
        const user_id = user?.user_id ? parseInt(user.user_id) : 0;
        formData.append("user_id", user_id);
        formData.append("company_name", form.getFieldsValue().company);
        formData.append("bot_name", form.getFieldsValue().botName);
        formData.append("email", form.getFieldsValue().email);
        formData.append("status", 0);
        formData.append("cs_number", form.getFieldsValue().consultantNumber);
        formData.append("first_text", form.getFieldsValue().first_text || `안녕하세요 ${form.getFieldsValue().botName}입니다. 무엇을 도와드릴까요?`);

        uploadedFiles.forEach((fileObj) => {
            console.log(fileObj.file)
            formData.append("files", fileObj.file);
        });

        console.log('uploadedFiles',uploadedFiles)
        console.log(">>>",formData.forEach((value, key) => console.log(key, value)))

        // 3. API 호출
        try {
            fetch("http://localhost:8000/bots", {
                method: "POST",
                body: formData,
              }).then((response) => {
                if (!response.ok) {
                  console.error("봇 생성 실패");
                }
              }).catch((err) => {
                console.error("요청 중 오류:", err);
              });
            
              localStorage.setItem("lastBotRequest", JSON.stringify({
                user_id: user_id,
                company: form.getFieldsValue().company,
                botName: form.getFieldsValue().botName,
                email: form.getFieldsValue().email,
                status: 0,
                cs_number: form.getFieldsValue().consultantNumber,
                first_text: form.getFieldsValue().first_text,
                files: uploadedFiles.map((file) => ({
                  name: file.name
                }))
              }));
            
              message.success("봇 생성 요청이 전송되었습니다!");
              navigate("/generate/pending");
              setLoading(false);
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

    const handleUploadRule = () => {
        setIsModalOpen(true);
    }

    const handleOk = () => {
        setIsModalOpen(false);  
      };
    
      const handleCancel = () => {
        setIsModalOpen(false); 
      };

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

                            <Form.Item 
                                label={
                                    <span className="form-label">
                                        상담원 번호<span className="required">*</span>
                                    </span>
                                } 
                                name="consultantNumber"
                            >
                                <Input placeholder="예시: 1588-0000" className="form-input" size="large" />
                            </Form.Item>

                            <Form.Item label={<span className="form-label">인사말</span>} name="first_text">
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
                    <div className="data-section" >
                        <h2 className="section-title">사용할 데이터</h2>
                        <p className="section-subtitle">봇 학습에 사용할 데이터를 업로드하고 선택해주세요.</p>
                        <Button className="upload-rule-button" type="primary" onClick={handleUploadRule}>
                            업로드 규칙
                        </Button>

                        <Modal
                            title="업로드 규칙 안내"
                            open={isModalOpen}
                            onOk={handleOk}
                            onCancel={handleCancel}
                        >
                            <span style={{ fontSize: "18px" }}>1. PDF 파일을 업로드할 수 있습니다.</span>
                            <br />
                            <span style={{ fontSize: "18px" }}>2. 파일 크기는 모두 합쳐서 10MB 이하로 제한됩니다.</span>
                            <br />
                        </Modal>

                        <div className="upload-area">

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
                                    <span className="file-size">({(fileObj.file.size / 1024 / 1024).toFixed(2)} MB)</span>
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
                {/* {loading ? "생성 중..." : "생성하기"} */}
                생성하기
            </Button>
        </div>
    )
}
