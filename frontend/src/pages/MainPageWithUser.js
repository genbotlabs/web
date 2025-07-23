import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '../styles/MainPage.css';

export default function MainPageWithUser({ user, setUser }) {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const user_id = params.get("user_id");
        const name = params.get("nickname");
        const profile_image = params.get("profile_image");
        const provider = params.get("provider");

        if (name) {
            setUser({ user_id, name, profile_image, provider });
            console.log('전체 유저 정보:', { user_id, name, profile_image, provider });
            // navigate("/");
        }
    }, [location, setUser]);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    console.log('with user', user)

    return (
        <div>
            <h1>{user.name}</h1>
        </div>
    );
}