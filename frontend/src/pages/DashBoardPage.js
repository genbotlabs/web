import React, { useEffect, useState } from 'react';
import { Table, Spin, Tag, Drawer } from "antd";
import axios from 'axios';

import MainPage from './MainPage';
import '../styles/DashBoardPage.css';


export default function DashBoardPage({user}) {
    // const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedBot, setSelectedBot] = useState(null);
    const API_URL = "http://localhost:8000/bots";
    const data = [
        {
            bot_id: "bot_001",
            company_name: "GenBot",
            bot_name: "문의",
            status: "활성화",
            first_text: "설명1.",
            email: "user@example.com",
            cs_number: "1522-0000",
            created_at: "2025-07-14T12:00:00Z",
            updated_at: "2025-07-14T12:10:00Z",
            data: [
                {
                    "data_id": "data_001",
                    "data_name": "문의",
                    "url": "s3://genbot-json-s3/data/세부주제정리.pdf",
                    "created_at": "2025-07-14T12:00:00Z",
                    "updated_at": "2025-07-14T12:10:00Z"
                },
                {
                    "data_id": "data_002",
                    "data_name": "test",
                    "url": "s3://genbot-json-s3/data/세부주제정리.pdf",
                    "created_at": "2025-07-14T12:00:00Z",
                    "updated_at": "2025-07-14T12:10:00Z"
                }
            ]
        },
        {
            bot_id: "bot_002",
            company_name: "GenBot",
            bot_name: "상담",
            status: "비활성화",
            first_text: "설명2.",
            email: "support@genbot.com",
            cs_number: "1522-0101",
            created_at: "2025-07-14T12:00:00Z",
            updated_at: "2025-07-14T12:10:00Z"
        },
        {
            bot_id: "bot_003",
            company_name: "GenBot",
            bot_name: "문의",
            status: "삭제",
            first_text: "설명3.",
            email: "user@example.com",
            cs_number: "1522-0000",
            created_at: "2025-07-14T12:00:00Z",
            updated_at: "2025-07-14T12:10:00Z"
        },
        {
            bot_id: "bot_004",
            company_name: "GenBot",
            bot_name: "상담",
            status: "오류",
            first_text: "설명4.",
            email: "support@genbot.com",
            cs_number: "1522-0101",
            created_at: "2025-07-14T12:00:00Z",
            updated_at: "2025-07-14T12:10:00Z"
        }
    ];
    const columns = [
        {
            title: 'Bot ID',
            dataIndex: 'bot_id',
            key: 'bot_id',
        },
        {
            title: '회사명',
            dataIndex: 'company_name',
            key: 'company_name',
        },
        {
            title: '봇 이름',
            dataIndex: 'bot_name',
            key: 'bot_name',
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '';
                switch (status) {
                    case '활성화':
                        color = 'green';
                        break;
                    case '비활성화':
                        color = 'default';
                        break;
                    case '삭제':
                        color = 'red';
                        break;
                    case '오류':
                        color = 'volcano';
                        break;
                    default:
                        color = 'blue';
                }
                return <Tag color={color}>{status}</Tag>
            }
        },
        {
            title: '대표 이메일',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '고객센터',
            dataIndex: 'cs_number',
            key: 'cs_number',
        }
    ];

    const rowSelection = {
        type: "radio", // 단일 선택(1개만), 여러 개 선택하려면 "checkbox"
        selectedRowKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
          setSelectedRowKeys(newSelectedRowKeys);
          if (selectedRows.length > 0) {
            setSelectedBot(selectedRows[0]);
            setDrawerVisible(true);
          } else {
            setDrawerVisible(false);
            setSelectedBot(null);
          }
        }
    };

    // useEffect(() => {
    //     async function fetchBots() {
    //         setLoading(true);
    //         try {
    //             const res = await axios.get(API_URL);
    //             setData(res.data.bots);
    //         } catch (e) {
    //             message.error("봇 목록 불러오기 실패!");
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     fetchBots();
    // }, []);
      
    return ( 
        <div style={{ display: 'flex', flexDirection: 'column'}}>
            <section className='dashboard-section'>
                <h1>봇 목록</h1>
                {loading ? (
                        <Spin />
                    ) : (
                        <Table
                            rowSelection={rowSelection}
                            dataSource={data.map(bot => ({ ...bot, key: bot.bot_id }))}
                            columns={columns}
                            pagination={{ pageSize: 8 }}
                        />
                        
                    )
                }
            </section>
            <Drawer
                title={selectedBot ? `${selectedBot.bot_name} 상세정보` : ""}
                placement="right"
                onClose={() => { setDrawerVisible(false); setSelectedRowKeys([]); }}
                open={drawerVisible}
                width={380}
            >
                {selectedBot && (
                    <div>
                        <p><b>Bot ID:</b> {selectedBot.bot_id}</p>
                        <p><b>회사명:</b> {selectedBot.company_name}</p>
                        <p><b>봇 이름:</b> {selectedBot.bot_name}</p>
                        <p><b>첫 대화:</b> {selectedBot.first_text}</p>
                        <p><b>상태:</b> <Tag>{selectedBot.status}</Tag></p>
                        <p><b>대표 이메일:</b> {selectedBot.email}</p>
                        <p><b>고객센터:</b> {selectedBot.cs_number}</p>
                        <p><b>생성일:</b> {selectedBot.created_at}</p>
                        <p><b>수정일:</b> {selectedBot.updated_at}</p>
                        {selectedBot.data && (
                            <div style={{ marginTop: '24px' }}>
                                <b>연결 데이터 목록</b>
                                <ul>
                                {selectedBot.data.map(item => (
                                    <li key={item.data_id}>
                                    <div>• <b>{item.data_name}</b> ({item.data_id})</div>
                                    <div style={{ fontSize: '0.95em', color: '#888' }}>
                                        {item.url}
                                    </div>
                                    <div style={{ fontSize: '0.92em', color: '#aaa' }}>
                                        생성: {new Date(item.created_at).toLocaleString()}, 수정: {new Date(item.updated_at).toLocaleString()}
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
    );
};