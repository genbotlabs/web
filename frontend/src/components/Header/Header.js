import './Header.css';
import logo from '../../icons/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Header({ user, setUser }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log(">>>", window.location.search);
        const params = new URLSearchParams(window.location.search);
        console.log(">>>", params);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const user_id = params.get("user_id");
        const nickname = params.get("nickname");
        const profile_image = params.get("profile_image");
        console.log("token", access_token)

        if (access_token) {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("user_id", user_id);
            localStorage.setItem("nickname", nickname);
            localStorage.setItem("profile_image", profile_image);
            navigate("/", { replace: true });
        }
    }, [location, navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch(`http://localhost:8000/auth/logout`, {
                method: "POST"
            });
             if (response.ok) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user_id");
                localStorage.removeItem("nickname");
                localStorage.removeItem("profile_image");
                setUser(null);
                alert("로그아웃이 완료되었습니다.");
                navigate("/");
            } else {
                alert("로그아웃에 실패했습니다.");
            }
        } catch (err) {
            console.error("로그아웃 요청 중 오류 발생:", err);
            alert("네트워크 오류 또는 서버에 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.");
        }
    };

    const handleDeleteAccount = async () => {
        const access_token = localStorage.getItem("access_token");
        const user_id = localStorage.getItem("user_id");
        if (!access_token) {
            alert("로그인 정보가 없습니다.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/auth/delete?user_id=${user_id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${access_token}` },
            });
            console.log(response)
            if (response.ok) {
                localStorage.clear();
                setUser(null);
                alert("회원 탈퇴가 완료되었습니다.");
                navigate("/");
            } else {
                alert("회원 탈퇴에 실패했습니다.");
            }
        } catch (err) {
            alert("네트워크 오류 또는 서버에 연결할 수 없습니다.");
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
                        <Link to="#" onClick={handleDeleteAccount}>회원탈퇴</Link>
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
