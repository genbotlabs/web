import React from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import logo from '../../icons/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
import { useEffect, useState } from 'react';
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
            {/* <p>{user.name}</p> */}
            <p>사용중인 plan</p>
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
                {/* <NavLink to="/">홈</NavLink> */}
                {/* <NavLink to="/myaccount">내 계정</NavLink> */}
                {/* <NavLink to="/dashboard">봇 관리</NavLink> */}
                {/* <NavLink to="/generate">봇 생성</NavLink> */}
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
