import { useEffect, useState } from "react"
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
  CalendarOutlined,
  FilterOutlined,
  MoreOutlined,
  DeleteOutlined 
} from "@ant-design/icons"
import { Drawer, Tag, Modal, Popconfirm, message, DatePicker } from "antd"
import "../styles/DashBoardPage.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function DashBoardPage({ user }) {
  const [bots, setBots] = useState([])
  const [deletedBotId, setDeletedBotId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedBot, setSelectedBot] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate()

  useEffect(() => {
    console.log("DashBoard useEffect 실행됨. user:", user)
    if (!user?.user_id) return;
  
    const fetchBots = async () => {
      try {
        console.log("user.user_id", user.user_id)
        const response = await axios.get(`http://localhost:8000/bots/${user.user_id}`)
        console.log("response", response.data)
        setBots(response.data.bots)
      } catch (error) {
        console.error("봇 목록 가져오기 실패:", error)
      }
    }
  
    fetchBots()
  }, [user])

  const getStatusBadge = (statusCode) => {
    const statusMap = {
      "0": "제작중",
      "1": "활성화",
      "2": "비활성화",
      "3": "오류"
    };
  
    const label = statusMap[statusCode] || "미정";
    const statusClasses = {
      "제작중": "status-badge status-pending",
      "활성화": "status-badge status-active",
      "비활성화": "status-badge status-inactive",
      "오류": "status-badge status-error",
    };
  
    return (
      <span className={statusClasses[label] || "status-badge status-inactive"}>
        {label}
      </span>
    );
  };

  const filteredData = bots.filter((bot) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && bot.status === 0) ||
      (activeTab === "inactive" && bot.status === 1) ||
      (activeTab === "active" && bot.status === 2) ||
      (activeTab === "error" && bot.status === 3)
      

    const matchesSearch =
      bot.bot_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const [startDate, endDate] = dateRange || [];
    const matchesDate =
      !startDate || !endDate ||
      (dayjs(bot.created_at).isAfter(startDate, "day") &&
       dayjs(bot.created_at).isBefore(endDate, "day"));

    return matchesTab && matchesSearch && matchesDate
  })

  const getTabCount = (tabKey) => {
    if (tabKey === "all") return bots.length
    if (tabKey === "pending") return bots.filter((bot) => bot.status === 0).length
    if (tabKey === "active") return bots.filter((bot) => bot.status === 1).length
    if (tabKey === "inactive") return bots.filter((bot) => bot.status === 2).length
    if (tabKey === "error") return bots.filter((bot) => bot.status === 3).length
    return 0
  }

  const handleRowSelect = (botId, checked) => {
    if (checked) {
      const bot = bots.find((b) => b.bot_id === botId)
      setSelectedRows([botId]) // 단일 선택
      setSelectedBot(bot)
      setDrawerVisible(true)
    } else {
      setSelectedRows([])
      setSelectedBot(null)
      setDrawerVisible(false)
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredData.map((bot) => bot.bot_id))
    } else {
      setSelectedRows([])
      setSelectedBot(null)
      setDrawerVisible(false)
    }
  }

  const handleAddBot = () => {
    navigate("/generate")
  }

  const handleClickFile = async (url) => {
    const s3Key = url.split(".com/")[1]
    try {
      const response = await axios.get(`http://localhost:8000/s3?s3_key=${s3Key}`)
      
      setPreviewUrl(response.data.url)
      setPreviewVisible(true)
    } catch (err) {
      alert("파일을 미리보기할 수 없습니다.")
      console.error(err)
    }
  }

  const handleClickBotName = (botId) => {
    const chatbotUrl = process.env.REACT_APP_CHATBOT_URL
    window.location.href = `${chatbotUrl}/?bot_id=${botId}`
  }

  const handleDeleteBot = async (botId) => {
    try {
      await axios.delete(`http://localhost:8000/bots/${botId}`)
      setDeletedBotId(botId);
      message.success("봇이 삭제되었습니다.")
      setBots(prev => prev.filter(bot => bot.bot_id !== botId))

      if (selectedBot?.bot_id === botId) {
        setDrawerVisible(false);
        setSelectedBot(null);
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("삭제 실패:", error)
      message.error("삭제에 실패했습니다.")
    }
  }
  
  useEffect(() => {
    if (deletedBotId) {
      setBots((prevBots) => prevBots.filter(bot => bot.bot_id !== deletedBotId));
      setDeletedBotId(null);
    }
  }, [deletedBotId]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            <h1>봇 목록</h1>
            <p className="dashboard-subtitle">{bots.length}개의 상담봇</p>
          </div>
          <div className="dashboard-actions">
            <button className="export-button">
              <ExportOutlined />
              Export
            </button>
            <button className="add-button" onClick={handleAddBot}>
              <PlusOutlined />봇 생성
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <div className="tabs-list">
            {[
              { key: "all", label: "전체 봇" },
              { key: "pending", label: "제작중" },
              { key: "active", label: "활성화" },
              { key: "inactive", label: "비활성화" }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-trigger ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className="tab-count">{getTabCount(tab.key)}</span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="search-filter-section">
            <div className="search-container">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="검색하기"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <RangePicker
                onChange={(dates) => setDateRange(dates)}
                style={{ marginRight: "12px" }}
              />
              {/* <button className="filter-button">
                <FilterOutlined />
                Filters
              </button> */}
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead className="table-header">
                <tr>
                  
                  <th>상담봇 명</th>
                  <th>회사명</th>
                  <th>상태</th>
                  <th>대표 이메일</th>
                  <th>고객센터</th>
                  <th>생성일</th>
                  <th style={{ width: "80px" }}>상세</th>
                  <th style={{ width: "80px" }}>삭제</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {paginatedData.map((bot) => (
                  <tr key={bot.bot_id}>
                    <td 
                      style={{ fontWeight: "500", color: "#1890ff", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => handleClickBotName(bot.bot_id)}
                    >
                      {bot.bot_name}
                    </td>
                    <td>{bot.company_name}</td>
                    <td style={{ fontSize: "20px" }}>{getStatusBadge(bot.status)}</td>
                    <td>{bot.email}</td>
                    <td>{bot.cs_number}</td>
                    <td>
                      {new Date(bot.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </td>
                    <td>
                      <button
                        className="detail-button"
                        onClick={() => handleRowSelect(bot.bot_id, true)}
                        style={{ width: "60px" }}
                      >
                        보기
                      </button>
                    </td>
                    <td>
                      <Popconfirm
                        title="정말 삭제하시겠습니까?"
                        onConfirm={() => handleDeleteBot(bot.bot_id)}
                        okText="삭제"
                        cancelText="취소"
                      >
                        <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
                      </Popconfirm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              ← Previous
            </button>

            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`page-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        title={selectedBot ? `${selectedBot.bot_name} 상세정보` : ""}
        placement="right"
        onClose={() => {
          setDrawerVisible(false)
          setSelectedRows([])
          setSelectedBot(null)
        }}
        open={drawerVisible}
        width={700}
        bodyStyle={{ padding: "24px" }}
      >
        {selectedBot && (
          <div className="drawer-content">
            <div className="drawer-section">
              <h3>기본 정보</h3>
              <p><b>회사명:</b> {selectedBot.company_name}</p>
              <p><b>상태:</b> {getStatusBadge(selectedBot.status)}</p>
              <p><b>대표 이메일:</b> {selectedBot.email}</p>
              <p><b>고객센터:</b> {selectedBot.cs_number}</p>
              <p><b>생성일:</b> {new Date(selectedBot.created_at).toLocaleString()}</p>
              <p><b>수정일:</b> {new Date(selectedBot.updated_at).toLocaleString()}</p>
            </div>

            {selectedBot.files?.length > 0 && (
              <div className="drawer-section">
                <h3>연결된 데이터</h3>
                <ul className="file-list">
                  {selectedBot.files.map((item) => (
                    <li key={item.data_id} className="file-item">
                      <div className="file-title">
                        📄 {item.name} ({item.data_id})
                      </div>
                      <div
                        className="file-link"
                        onClick={() => handleClickFile(item.storage_url)}
                      >
                        미리보기
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="drawer-section">
              <button
                className="chatbot-button"
                onClick={() => handleClickBotName(selectedBot.bot_id)}
              >
                챗봇 열기
              </button>
            </div>
          </div>
        )}

        <Modal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width="80%"
          title="파일 미리보기"
          style={{ top: 20 }}
        >
          {previewUrl.includes(".pdf") ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="600px"
              style={{ border: "none" }}
            />
          ) : (
            <p>미리보기를 지원하지 않는 파일 형식입니다.</p>
          )}
        </Modal>
      </Drawer>
    </div>
  )
}
