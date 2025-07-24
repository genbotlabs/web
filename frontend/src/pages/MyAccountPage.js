import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/MyAccountPage.css';

const MyAccountPage = ({ user }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);
    console.log(user);

    return (
        <div className="mypage-container">
            <div className="mypage-account">
                <div className="profile-card">
                    <div className="profile-image">
                        <img src={user?.profile_image || 'https://via.placeholder.com/150'} alt="Profile" />
                    </div>
                    <div className="profile-info">
                        <h2 className="name">
                            {user?.name || '이름 미등록'}
                        </h2>
                        <p className="provider">
                            연동된 소셜 로그인 방식: {user?.provider || '정보 없음'}
                        </p>
                    </div>
                    <div className="profile-actions">
                        <button className="update-button">회원정보 수정</button>
                        <button className="delete-button">회원 탈퇴</button>
                    </div>
                </div>
            </div>
            <div className="mypage-bot">
                <div className="bot-section">
                    <h2 className="bot-title">내 상담봇</h2>
                    <div className="bot-list">
                        <div className="bot-card">
                            <div className="bot-info">
                                <h3>문의봇</h3>
                            </div>
                            <button className="bot-detail-btn">세부정보 보기</button>
                        </div>
                        <div className="bot-card">
                            <div className="bot-info">
                                <h3>상담봇</h3>
                            </div>
                            <button className="bot-detail-btn">세부정보 보기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;