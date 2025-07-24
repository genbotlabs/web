import React from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import logo from '../../icons/logo.png';
import './Header.css';


export default function Header() {
    const navigate = useNavigate();

    return (
        <header className="header-container">
            <div className="header-left">
                <img src={logo} alt="GenBot"/>
                <span>GenBot</span>
            </div>
        </header>
    );
}
