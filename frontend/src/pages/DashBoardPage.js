import { useEffect, useState } from "react"
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
  CalendarOutlined,
  FilterOutlined,
  MoreOutlined,
} from "@ant-design/icons"
import { Drawer, Tag, Modal } from "antd"
import "../styles/DashBoardPage.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function DashBoardPage({ user }) {
  const [bots, setBots] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedBot, setSelectedBot] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    console.log("DashBoard useEffect 실행됨. user:", user)
    if (!user?.user_id) return;
  
    const fetchBots = async () => {
      try {
        console.log("user.user_id", user.user_id)
        const response = await axios.get(`http://localhost:8000/bots/${user.user_id}`)
        console.log("response", response)
        setBots(response.data.bots)
      } catch (error) {
        console.error("봇 목록 가져오기 실패:", error)
      }
    }
  
    fetchBots()
  }, [user])

  const getStatusBadge = (status) => {
    const statusClasses = {
      활성화: "status-badge status-active",
      비활성화: "status-badge status-inactive",
      삭제: "status-badge status-deleted",
      오류: "status-badge status-error",
    }

    return <span className={statusClasses[status] || "status-badge status-inactive"}>{status}</span>
  }

  const filteredData = bots.filter((bot) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && bot.status === "활성화") ||
      (activeTab === "inactive" && bot.status === "비활성화") ||
      (activeTab === "error" && bot.status === "오류")

    const matchesSearch =
      bot.bot_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  const getTabCount = (tabKey) => {
    if (tabKey === "all") return bots.length
    if (tabKey === "active") return bots.filter((bot) => bot.status === "활성화").length
    if (tabKey === "inactive") return bots.filter((bot) => bot.status === "비활성화").length
    if (tabKey === "error") return bots.filter((bot) => bot.status === "오류").length
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
    window.location.href = `http://localhost:3001/?bot_id=${botId}`
  }

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
              { key: "active", label: "활성화" },
              { key: "inactive", label: "비활성화" },
              { key: "error", label: "생성 중 오류" },
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
              <button className="filter-button">
                <CalendarOutlined />
                Jan 6, 2022 – Jan 13, 2022
              </button>
              <button className="filter-button">
                <FilterOutlined />
                Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead className="table-header">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>챗봇 바로가기</th>
                  <th>회사명</th>
                  <th>대표 이메일</th>
                  <th>고객센터</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredData.map((bot) => (
                  <tr key={bot.bot_id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedRows.includes(bot.bot_id)}
                        onChange={(e) => handleRowSelect(bot.bot_id, e.target.checked)}
                      />
                    </td>
                    <td 
                      style={{ fontWeight: "500", color: "#1890ff", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => handleClickBotName(bot.bot_id)}
                    >
                      {bot.bot_name}
                    </td>
                    <td>{bot.company_name}</td>
                    <td>{bot.email}</td>
                    <td>{bot.cs_number}</td>
                    <td style={{ fontSize: "20px" }}>{getStatusBadge(bot.status || "비활성화")}</td>
                    <td>
                      <button className="action-button">
                        <MoreOutlined />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="pagination-button" disabled>
              ← Previous
            </button>
            <div className="pagination-numbers">
              <button className="page-number active">1</button>
              <button className="page-number">2</button>
              <button className="page-number">3</button>
              <span className="page-ellipsis">...</span>
              <button className="page-number">8</button>
              <button className="page-number">9</button>
              <button className="page-number">10</button>
            </div>
            <button className="pagination-button">Next →</button>
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
        width={380}
      >
        {selectedBot && (
          <div style={{ lineHeight: "1.8" }}>
            <p>
              <b>챗봇 바로가기:</b> {selectedBot.bot_url}
            </p>
            <p>
              <b>회사명:</b> {selectedBot.company_name}
            </p>
            <p>
              <b>봇 이름:</b> {selectedBot.bot_name}
            </p>
            <p>
              <b>상태:</b> <Tag>{selectedBot.status}</Tag>
            </p>
            <p>
              <b>대표 이메일:</b> {selectedBot.email}
            </p>
            <p>
              <b>고객센터:</b> {selectedBot.cs_number}
            </p>
            <p>
              <b>생성일:</b> {new Date(selectedBot.created_at).toLocaleString()}
            </p>
            <p>
              <b>수정일:</b> {new Date(selectedBot.updated_at).toLocaleString()}
            </p>
            {selectedBot.files && (
              <div style={{ marginTop: "24px" }}>
                <b>연결 데이터 목록</b>
                <ul style={{ marginTop: "12px", paddingLeft: "0" }}>
                  {selectedBot.files.map((item) => (
                    <li
                      key={item.data_id}
                      style={{
                        listStyle: "none",
                        marginBottom: "16px",
                        padding: "12px",
                        background: "#f9f9f9",
                        borderRadius: "6px",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        • {item.name} ({item.data_id})
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#666", marginBottom: "4px", wordBreak: "break-all" }} onClick={() => handleClickFile(item.storage_url)}>
                        {item.storage_url}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
          <h1>hi</h1>
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
