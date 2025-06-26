import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../icons/logo.png';
import genbot from '../icons/genbot.png';
import kakao_logo from '../icons/kakao.png';
import google_logo from '../icons/google.png';
import github_logo from '../icons/github.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const handleEmailLoginClick = () => {
        navigate('/login/email');
    };
    

    return(
        <div className="login__section">
            <div className='logo__container'>
                <img src={logo} alt="GenBot Logo" className="logo-img" />
                <p>GenBot</p>
            </div>
            <div className='login__container'>
                <button className='email-login' onClick={handleEmailLoginClick}>
                    <img src={genbot} alt="GenBot Logo" className="logo-img" />
                    <p>이메일로 로그인</p>
                </button>
                <button className='kakao-login'>
                    <img src={kakao_logo} alt="Kakao Logo" className="logo-img" />
                    <p>카카오톡으로 로그인</p>
                </button>
                <button className='google-login'>
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