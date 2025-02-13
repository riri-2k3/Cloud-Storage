import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard'; // Assuming you have a Dashboard component
import Navbar from './components/Navbar'; // If you have a Navbar component
import ProtectedRoute from './components/ProtectedRoute'; // Ensure this is correctly implemented
import './index.css'; // Import your CSS styles

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar /> {/* Display Navbar on all pages */}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Route */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
