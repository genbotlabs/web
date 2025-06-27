import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../icons/logo.png';
import genbot from '../icons/genbot.png';
import kakao_logo from '../icons/kakao.png';
import google_logo from '../icons/google.png';
import github_logo from '../icons/github.png';

const LoginPage = () => {
    const navigate = useNavigate();

    const KAKAO_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI; 
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;
    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`;

    const handleEmailLogin = () => {
        navigate('/login/email');
    };
    const handleKaKaoLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };
    const handleGoogleLogin = () => {
        window.location.href = GOOGLE_AUTH_URL;
    };
    const handleGitHubLogink = () => {
        navigate('/login/email');
    };
    

    return(
        <div className="login__section">
            <div className='logo__container'>
                <img src={logo} alt="GenBot Logo" className="logo-img" />
                <p>GenBot</p>
            </div>
            <div className='login__container'>
                <button className='email-login' onClick={handleEmailLogin}>
                    <img src={genbot} alt="GenBot Logo" className="logo-img" />
                    <p>이메일로 로그인</p>
                </button>
                <button className='kakao-login' onClick={handleKaKaoLogin}>
                    <img src={kakao_logo} alt="Kakao Logo" className="logo-img" />
                    <p>카카오톡으로 로그인</p>
                </button>
                <button className='google-login' onClick={handleGoogleLogin}>
                    <img src={google_logo} alt="Google Logo" className="logo-img" />
                    <p>Google로 로그인</p>
                </button>
                <button className='github-login'>
                    <img src={github_logo} alt="GitHub Logo" className="logo-img" />
                    <p>GitHub로 로그인</p>
                </button>
            </div>
        </div>
    )
   
}

export default LoginPage;