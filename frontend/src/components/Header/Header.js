import './Header.css';
import logo from '../icons/logo.png';
import { Link } from 'react-router-dom';

export default function Header({ user }) {
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
                {user ? (
                    <Link to="/mypage">
                        <img
                            src={user.profile_image}
                            alt="프로필"
                            className="header__profile-img"
                            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
                        />
                    </Link>
                ) : (
                    <Link to="/login" id="login-button">로그인</Link>
                )}
            </div>
        </header>
    );
}
