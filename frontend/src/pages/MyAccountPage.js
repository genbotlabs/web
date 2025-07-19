import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../icons/logo.png';
import '../styles/MyAccountPage.css';

const MyAccountPage = ({ user }) => {
    return (
        <div>
            <div class="mypage-account">
                <div className='mypage-account-top'>
                    <div className='profile-image'>
                        <img src={logo}></img>
                    </div>
                </div>
                <div className='mypage-account-bottom'>
                    <div className='name'>name</div>
                    <div className='provider'>provider</div>
                    <div className='buttons'>
                        <button className='update-button'>수정</button>
                        <button className='delete-button'>탈퇴</button>
                    </div>
                </div>
            </div>
            <div class="mypage-bot">
                <div class='bot-title'>내 상담봇</div>
                <div class='bot-list'>
                    <div>문의봇</div>
                    <div>응답봇</div>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;