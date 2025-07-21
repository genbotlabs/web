import React from 'react';
import MainSection from './MainSection';
import '../styles/DashBoardPage.css';

const DashBoardPage = ({user}) => {
    return (
        <section>
            {user ? (
                <div className="dashboard">
                    <h1>안녕하세요, {user.name}님!</h1>
                    <div className='dashboard-top'>
                        hi
                    </div>
                    <div className='dashboard-bottom'>
                        <div className='dashboard-bottom-left'>
                            bye
                        </div>
                        <div className='dashboard-bottom-right'>
                            bye
                        </div>
                    </div>
                </div>
            ) : (
                <MainSection />
            )}
        </section>
    );
};

export default DashBoardPage;
