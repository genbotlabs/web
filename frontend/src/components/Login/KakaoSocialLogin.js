import KakaoLogin from "react-kakao-login";

const KakaoSocialLogin =()=>{
    const kakaoClientId = '9f2c7106b41e19b5f7ec765e35f71217'
    const kakaoOnSuccess = async (data)=>{
      	console.log(data)
        const idToken = data.response.access_token 
    }
    const kakaoOnFailure = (error) => {
        console.log(error);
    };
    return(
        <>
            <KakaoLogin
                token={kakaoClientId}
                onSuccess={kakaoOnSuccess}
                onFail={kakaoOnFailure}
            />
        </>
    )
}

export default KakaoSocialLogin

import KakaoLogin from 'react-kakao-login';
import kakao_logo from './kakao_logo.png';

const kakaoClientId = 'YOUR_KAKAO_REST_API_KEY';

const KakaoSocialLogin = () => {
  return (
    <KakaoLogin
      token={kakaoClientId}
      onSuccess={(res) => {
        console.log('카카오 로그인 성공:', res);
      }}
      onFail={(err) => {
        console.log('카카오 로그인 실패:', err);
      }}
      render={({ onClick }) => (
        <button className='kakao-login' onClick={onClick}>
          <img src={kakao_logo} alt="Kakao Logo" className="logo-img" />
          <p>카카오톡으로 로그인</p>
        </button>
      )}
    />
  );
};

export default KakaoSocialLogin;
