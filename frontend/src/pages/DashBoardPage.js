import { useEffect, useState } from "react"
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
  CalendarOutlined,
  FilterOutlined,
  MoreOutlined,
} from "@ant-design/icons"
import { Drawer, Tag } from "antd"
import "../styles/DashBoardPage.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function DashBoardPage({ user }) {
  const [selectedRows, setSelectedRows] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedBot, setSelectedBot] = useState(null)

  const navigate = useNavigate()

  // useEffect(async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:8000/bots/${bot_id}`)
  //     console.log(response.data)

  //     if (response.ok) {
  //       const result = await response.json()
  //       console.log(result) 
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }, [])

  const data = [
    {
      bot_id: "bot_001",
      company_name: "GenBot",
      bot_name: "문의",
      status: "활성화",
      email: "user@example.com",
      cs_number: "1522-0000",
      created_at: "2025-07-14T12:00:00Z",
      updated_at: "2025-07-14T12:10:00Z",
      data: [
        {
          data_id: "data_001",
          data_name: "문의",
          url: "s3://genbot-json-s3/data/세부주제정리.pdf",
          created_at: "2025-07-14T12:00:00Z",
          updated_at: "2025-07-14T12:10:00Z",
        },
        {
          data_id: "data_002",
          data_name: "test",
          url: "s3://genbot-json-s3/data/세부주제정리.pdf",
          created_at: "2025-07-14T12:00:00Z",
          updated_at: "2025-07-14T12:10:00Z",
        },
      ],
    },
    {
      bot_id: "bot_002",
      company_name: "GenBot",
      bot_name: "상담",
      status: "비활성화",
      email: "support@genbot.com",
      cs_number: "1522-0101",
      created_at: "2025-07-14T12:00:00Z",
      updated_at: "2025-07-14T12:10:00Z",
    },
    {
      bot_id: "bot_003",
      company_name: "GenBot",
      bot_name: "문의",
      status: "삭제",
      email: "user@example.com",
      cs_number: "1522-0000",
      created_at: "2025-07-14T12:00:00Z",
      updated_at: "2025-07-14T12:10:00Z",
    },
    {
      bot_id: "bot_004",
      company_name: "GenBot",
      bot_name: "상담",
      status: "오류",
      email: "support@genbot.com",
      cs_number: "1522-0101",
      created_at: "2025-07-14T12:00:00Z",
      updated_at: "2025-07-14T12:10:00Z",
    },
  ]

  const getStatusBadge = (status) => {
    const statusClasses = {
      활성화: "status-badge status-active",
      비활성화: "status-badge status-inactive",
      삭제: "status-badge status-deleted",
      오류: "status-badge status-error",
    }

    return <span className={statusClasses[status] || "status-badge status-inactive"}>{status}</span>
  }

  const filteredData = data.filter((bot) => {
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
    if (tabKey === "all") return data.length
    if (tabKey === "active") return data.filter((bot) => bot.status === "활성화").length
    if (tabKey === "inactive") return data.filter((bot) => bot.status === "비활성화").length
    if (tabKey === "error") return data.filter((bot) => bot.status === "오류").length
    return 0
  }

  const handleRowSelect = (botId, checked) => {
    if (checked) {
      const bot = data.find((b) => b.bot_id === botId)
      setSelectedRows([botId]) // 단일 선택으로 변경
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
      // 전체 선택 시에는 drawer를 열지 않음
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

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            <h1>봇 목록</h1>
            <p className="dashboard-subtitle">{data.length}개의 상담봇</p>
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
            <button
              className={`tab-trigger ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              전체 봇<span className="tab-count">{getTabCount("all")}</span>
            </button>
            <button
              className={`tab-trigger ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              활성화
              <span className="tab-count">{getTabCount("active")}</span>
            </button>
            <button
              className={`tab-trigger ${activeTab === "inactive" ? "active" : ""}`}
              onClick={() => setActiveTab("inactive")}
            >
              비활성화
              <span className="tab-count">{getTabCount("inactive")}</span>
            </button>
            <button
              className={`tab-trigger ${activeTab === "error" ? "active" : ""}`}
              onClick={() => setActiveTab("error")}
            >
              생성 중 오류
              <span className="tab-count">{getTabCount("error")}</span>
            </button>
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
                  <th>ID</th>
                  <th>회사명</th>
                  <th>봇 이름</th>
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
                    <td style={{ fontWeight: "500" }}>{bot.bot_id}</td>
                    <td>{bot.company_name}</td>
                    <td>{bot.bot_name}</td>
                    <td>{bot.email}</td>
                    <td>{bot.cs_number}</td>
                    <td style={{ fontSize: "20px" }}>{getStatusBadge(bot.status)}</td>
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
              <b>Bot ID:</b> {selectedBot.bot_id}
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
            {selectedBot.data && (
              <div style={{ marginTop: "24px" }}>
                <b>연결 데이터 목록</b>
                <ul style={{ marginTop: "12px", paddingLeft: "0" }}>
                  {selectedBot.data.map((item) => (
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
                        • {item.data_name} ({item.data_id})
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#666", marginBottom: "4px", wordBreak: "break-all" }}>
                        {item.url}
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#999" }}>
                        생성: {new Date(item.created_at).toLocaleString()}
                        <br />
                        수정: {new Date(item.updated_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
