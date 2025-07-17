import './Header.css';
import logo from '../../icons/logo.png';
import { Link } from 'react-router-dom';

export default function Header({ user }) {
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/auth/logout");
            localStorage.removeItem("access_token");
            setUser(null);
            navigate("/");
        } catch (err) {
            alert("로그아웃에 실패했습니다.");
        }
    };

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
                    <li><Link to="/pricing">체험하기</Link></li>
                </ul>
            </nav>
            <div className="header__login">
                {user ? (
                    <ul className='header__my'>
                        <Link to="#" onClick={handleLogout}>로그아웃</Link>
                        <Link to="/mypage">
                            <img
                                src={user.profile_image}
                                alt="프로필"
                                className="header__profile-img"
                                style={{ width: "36px", height: "36px", borderRadius: "50%" }}
                            />
                        </Link>
                    </ul>
                    
                ) : (
                    <Link to="/login" id="login-button">로그인</Link>
                )}
            </div>
        </header>
    );
}
