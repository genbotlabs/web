import './Header.css';
import logo from './logo.png';
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="header">
            <div className="header__logo">
                <img src={logo} alt="GenBot Logo" className="header__logo-img" />
                <span className="header__logo-text">GenBot</span>
            </div>
            <nav className="header__nav">
                <ul className="header__menu">
                    <li><Link to="/">홈</Link></li>
                    <li><Link to="/generate">봇 생성</Link></li>
                    <li><Link to="/guide">GenBot 사용법</Link></li>
                    <li><Link to="/pricing">요금제</Link></li>
                </ul>
            </nav>
            <div className="header__login">
                <Link to="/login" id='login-button'>로그인</Link>
            </div>
        </header>
    );
}
