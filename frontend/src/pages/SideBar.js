import React, { useEffect } from 'react';
import { Anchor, Link } from "antd";

import '../styles/SideBar.css';
import logo from '../icons/logo.png';

const menuItems = [
    { key: 'home',    href: '/',    title: '홈' },
    { key: 'account', href: '/myaccount', title: '내 계정' },
    { key: 'manage',  href: '/dashboard',  title: '봇 관리하기' },
    { key: 'create',  href: '/generate',  title: '봇 생성하기' },
];

export default function SideBar({ user }) {
    return (
        <div className='sidebar'>
            <div className='sidebar-logo-title'>
                <img src={logo} alt='GenBot' />
                <span>GenBot</span>
            </div>
            <Anchor
                affix={false}
                direction="vertical"
                className="sidebar-menu"
                items={menuItems}
            />
        </div>
    );
};