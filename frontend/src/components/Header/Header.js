import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import logo from '../../icons/logo.png';
import '../Header/Header.css';


export default function Header({ user, setUser }) {
    const navigate = useNavigate();

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
