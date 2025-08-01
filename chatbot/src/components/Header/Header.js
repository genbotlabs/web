import React from 'react';
import logo from '../../icons/logo.png';

import './Header.css';


export default function Header() {
    const handleClick = () => {
        window.location.href = '/';
    }

    return (
        <header className="header-container" onClick={handleClick}>
            <div className="header-left">
                <img src={logo} alt="GenBot"/>
                <span>GenBot</span>
            </div>
        </header>
    );
}
