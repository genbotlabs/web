import './Header.css';
import logo from './logo.png';

export default function Header() {
    return (
        <header className="header">
            <div className="header__logo">
                <img src={logo} alt="GenBot Logo" className="header__logo-img" />
                <span className="header__logo-text">GenBot</span>
            </div>
            <nav className="header__nav">
                <ul className="header__menu">
                    <li>홈</li>
                    <li>봇 생성</li>
                    <li>GenBot 사용법</li>
                    <li>요금제</li>
                </ul>
            </nav>
            <div className="header__login">
                로그인
            </div>
        </header>
    );
}
