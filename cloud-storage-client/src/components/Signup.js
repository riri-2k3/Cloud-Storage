import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('http://localhost:5000/api/users/register', { email, password });

            // Assuming 'message' is returned in the response
            setSuccess(res.data.message || 'Signup successful!');
            toast.success('Signup successful!');

            // Clear form inputs after successful signup
            setEmail('');
            setPassword('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <form onSubmit={handleSignup} className="form-container">
                <h1 className="text-center">Signup</h1>
                
                {/* Error message */}
                {error && <div className="alert alert-danger">{error}</div>}
                
                {/* Success message */}
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
                        className="form-control"  // Fixed typo here
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>
                
                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100">Signup</button>
            </form>
        </div>
    );
}

export default Signup;

