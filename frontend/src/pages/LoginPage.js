import { useState } from "react"
import "../styles/LoginPage.css"

import google_logo from "../icons/google.png"
import kakao_logo from "../icons/kakao.png"
import naver_logo from "../icons/naver.png"

export default function LoginPage() {
    const [loading, setLoading] = useState({
        google: false,
        kakao: false,
        naver: false,
    })

    const KAKAO_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY
    const KAKAO_REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`

    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID
    const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI
    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`

    const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
    const NAVER_REDIRECT_URI = process.env.REACT_APP_NAVER_REDIRECT_URI;
    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=random_state_string`;

    const handleGoogleLogin = () => {
        setLoading((prev) => ({ ...prev, google: true }))
        setTimeout(() => {
            window.location.href = GOOGLE_AUTH_URL
        }, 500)
    }

    const handleKakaoLogin = () => {
        setLoading((prev) => ({ ...prev, kakao: true }))
        setTimeout(() => {
            window.location.href = KAKAO_AUTH_URL
        }, 500)
    }

    const handleNaverLogin = () => {
        setLoading((prev) => ({ ...prev, naver: true }))
        setTimeout(() => {
            window.location.href = NAVER_AUTH_URL
        }, 500)
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Header */}
                <div className="login-header">
                <h1 className="login-title">로그인</h1>
                <p className="login-subtitle">반갑습니다, 로그인해 주세요!</p>
                </div>

                {/* Social Login Buttons */}
                <div className="social-login-section">
                    <button className="social-button google-button" onClick={handleGoogleLogin} disabled={loading.google}>
                        <img src={google_logo} alt="Google" />
                        <span>구글 로그인</span>
                    </button>

                    <button className="social-button kakao-button" onClick={handleKakaoLogin} disabled={loading.kakao}>
                        <img src={kakao_logo} alt="Kakao" />
                        <span>카카오 로그인</span>
                    </button>

                    <button className="social-button naver-button" onClick={handleNaverLogin} disabled={loading.naver}>
                        <img src={naver_logo} alt="Naver" />
                        <span>네이버 로그인</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
