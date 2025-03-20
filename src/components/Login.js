// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Use this for better page navigation
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate for redirect

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });

            // Assuming the token comes as res.data.token
            const token = res.data.token;
            
            if (token) {
                // Store the token in localStorage
                localStorage.setItem('token', token);

                // Notify the user
                setSuccess('Login successful! Redirecting...');
                toast.success('Login successful!');

                // Redirect after 2 seconds to the dashboard or home
                setTimeout(() => {
                    navigate('/dashboard'); // Redirect using navigate (react-router-dom)
                }, 2000);
            } else {
                throw new Error('No token received. Something went wrong.');
            }

        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Login failed. Please check your credentials.';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <form onSubmit={handleLogin} className="form-container">
                <h1 className="text-center">Login</h1>
                
                {/* Display Error Messages */}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Email Input */}
                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>

                {/* Login Button */}
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
}

export default Login;

