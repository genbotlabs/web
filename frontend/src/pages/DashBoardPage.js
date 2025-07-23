import React, { useEffect, useState } from 'react';
import { Table, Spin, Tag } from "antd";
import axios from 'axios';

import MainPage from './MainPage';
import '../styles/DashBoardPage.css';


export default function DashBoardPage({user}) {
    // const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = "http://localhost:8000/bots";
    const data = [
        {
            bot_id: "bot_001",
            company_name: "GenBot",
            bot_name: "문의",
            status: "활성화",
            email: "user@example.com",
            cs_number: "1522-0000"
        },
        {
            bot_id: "bot_002",
            company_name: "GenBot",
            bot_name: "상담",
            status: "비활성화",
            email: "support@genbot.com",
            cs_number: "1522-0101"
        },
        {
            bot_id: "bot_003",
            company_name: "GenBot",
            bot_name: "문의",
            status: "삭제",
            email: "user@example.com",
            cs_number: "1522-0000"
        },
        {
            bot_id: "bot_004",
            company_name: "GenBot",
            bot_name: "상담",
            status: "오류",
            email: "support@genbot.com",
            cs_number: "1522-0101"
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <section className='dashboard-section'>
                {loading ? (
                        <Spin />
                    ) : (
                        <Table
                            dataSource={data.map(bot => ({ ...bot, key: bot.bot_id }))}
                            columns={columns}
                            pagination={{ pageSize: 8 }}
                        />
                    )
                }
            </section>
        </div>
    );
};