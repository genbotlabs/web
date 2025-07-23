import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Button, Tabs } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import logo from '../../icons/logo.png';
import useIsMobile from '../../hooks/useIsMobile';
import '../Header/Header.css';

const { Header: AntHeader } = Layout;

export default function Header({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        alert("로그아웃 완료");
        navigate('/');
    };

    const handleDeleteAccount = () => {
        localStorage.clear();
        setUser(null);
        alert("회원 탈퇴 완료");
        navigate('/');
    };

    const userMenu = (
        <div className="user-menu">
            <p onClick={handleLogout}>로그아웃</p>
            <p onClick={handleDeleteAccount} className="danger">회원 탈퇴</p>
        </div>
    );

    const tabs = [
        { key: '/', label: '홈' },
        { key: '/myaccount', label: '내 계정' },
        { key: '/generate', label: '봇 생성' },
        { key: '/dashboard', label: '봇 관리' },
    ];

    const handleTabChange = (key) => {
        navigate(key);
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <img src={logo} alt="GenBot"/>
                <span>GenBot</span>
            </div>
            <div className="header-menu">
                <Link to="/">홈</Link>
                <Link to="/myaccount">내 계정</Link>
                <Link to="/dashboard">봇 관리</Link>
                <Link to="/generate">봇 생성</Link>
            </div>
            <div className="header-right">
                {user ? (
                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <Avatar 
                            src={user.profile_image} 
                            icon={<UserOutlined />} 
                            style={{ cursor: 'pointer' }} 
                        />
                    </Dropdown>
                ) : (       
                    <Link to="/login">
                        로그인하기
                    </Link>
                )}
            </div>
        </header>
    );
}
