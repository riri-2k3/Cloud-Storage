// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser ] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Access denied. Please log in.');
            navigate('/'); // Redirect to login if not authenticated
            return;
        }

        // Decode the token to get user information (assuming JWT)
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser (decodedToken);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from local storage
        navigate('/'); // Redirect to login
    };

    return (
        <div className="container mt-5">
            {error && <div className="alert alert-danger">{error}</div>}
            {user ? (
                <div>
                    <h1>Welcome, {user.email}</h1>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default Dashboard;
