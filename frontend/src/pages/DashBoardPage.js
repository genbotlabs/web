import React, { useState } from 'react';
import { Table } from "antd";
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

import MainPage from './MainPage';
import '../styles/DashBoardPage.css';

// 임시
const cardData = [
    { type: '문의봇', users: 97, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '상담봇', users: 7, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '보이스봇', users: 0, desc: '문의봇에 대한 설명 설명', date: '2025/07/10' },
    { type: '추가봇', users: 3, desc: '새 봇 설명', date: '2025/07/12' },
];

// 임시
const columnData = [
    { day: '월', users: 100 },
    { day: '화', users: 20 },
    { day: '수', users: 160 },
    { day: '목', users: 210 },
    { day: '금', users: 180 },
    { day: '토', users: 310 },
    { day: '일', users: 120 },
];

const DashBoardPage = ({user}) => {
    return ( 
        <section>
           
        </section>
    );
};

export default DashBoardPage;
