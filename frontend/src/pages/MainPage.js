import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import MainSection from './MainSection';

const MainPage = ({ setUser }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get("email");
        const name = params.get("name");
        const profile_image = params.get("profile_image");

        if (name) {
            setUser({ email, name, profile_image });
            console.log('전체 유저 정보:', { email, name, profile_image });
            navigate("/");
        }
    }, [location, setUser]);

    return (
        <div>
            <MainSection />
        </div>
    );
};

export default MainPage;