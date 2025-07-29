import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function KakaoCallback({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (!code) {
      alert("카카오 로그인 코드가 없습니다.");
      navigate("/login");
      return;
    }

    const fetchKakaoLogin = async () => {
      try {
        const response = await axios.post("http://localhost:8000/login/kakao", {
          code: code,
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        alert("로그인 성공!");
        navigate("/dashboard");
      } catch (error) {
        console.error("카카오 로그인 실패:", error);
        alert("로그인 처리 중 오류가 발생했습니다.");
        navigate("/login");
      }
    };

    fetchKakaoLogin();
  }, []);

  return <div>로그인 처리 중입니다...</div>;
}
