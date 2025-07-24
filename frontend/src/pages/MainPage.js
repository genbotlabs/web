import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import '../styles/MainPage.css';
import MainPageNoUser from './MainPageNoUser';
import MainPageWithUser from './MainPageWithUser';

const MainPage = ({ user, setUser }) => {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const user_id = params.get("user_id");
        const name = params.get("nickname");
        const profile_image = params.get("profile_image");
        const provider = params.get("provider");
        if (name) {
            setUser({ user_id, name, profile_image, provider });
        }
    }, [location, setUser]);

    return (
        <div>
            {user ? (
                <MainPageWithUser user={user} setUser={setUser}/>
            ):(
                <MainPageNoUser/>
            )}
        </div>
    );
};

export default MainPage;