import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MainPage = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    return (
        <div>
            hi
        </div>
    );
};

export default MainPage;