// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth(); // Use the Auth context

    const handleLogout = () => {
        logout(); // Call the logout function from context
        navigate('/'); // Redirect to the login page
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">MyApp</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* Display "Home" link for all users */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>

                        {/* Display "Signup" link for users who are not logged in */}
                        {!isAuthenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/signup">Signup</Link>
                            </li>
                        )}

                        {/* Display "Login" link for users who are not logged in */}
                        {!isAuthenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Login</Link>
                            </li>
                        )}

                        {/* Display "Logout" button for users who are logged in */}
                        {isAuthenticated && (
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
