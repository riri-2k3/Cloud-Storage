// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const FileManager = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Simulated API calls - replace with your actual API
  const api = {
    login: async (email, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simple validation for demo
          if (email && password) {
            resolve({ email, token: 'fake-token' });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 1000);
      });
    },
    signup: async (email, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simple validation for demo
          if (email && password.length >= 6) {
            resolve({ email, token: 'fake-token' });
          } else {
            reject(new Error('Password must be at least 6 characters'));
          }
        }, 1000);
      });
    },
    getFiles: async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([
          { id: 1, name: 'document.pdf', size: 1024000, createdAt: new Date() },
          { id: 2, name: 'image.jpg', size: 2048000, createdAt: new Date() },
          { id: 3, name: 'spreadsheet.xlsx', size: 512000, createdAt: new Date() }
        ]), 500);
      });
    },
    uploadFile: async (file) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ 
          id: Date.now(), 
          name: file.name, 
          size: file.size, 
          createdAt: new Date() 
        }), 1000);
      });
    },
    deleteFile: async (id) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    }
  };

  useEffect(() => {
    if (user) loadFiles();
  }, [user]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await api.getFiles();
      setFiles(fileList);
    } catch (error) {
      alert('Error loading files');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const userData = await api.login(email, password);
      setUser(userData);
      // Clear form
      setEmail('');
      setPassword('');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userData = await api.signup(email, password);
      setUser(userData);
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert('Sign up failed: ' + error.message);
    }
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const newFile = await api.uploadFile(file);
      setFiles(prev => [newFile, ...prev]);
    } catch (error) {
      alert('Upload failed');
    }
    setLoading(false);
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    
    try {
      await api.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.name;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login/Signup Screen
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">👤</div>
            <h1 className="app-title">CloudStore</h1>
            <p className="login-subtitle">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>
          
          <div className="login-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            {isSignUp && (
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}
            <button
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={loading}
              className="login-button"
            >
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
            
            <div className="auth-toggle">
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={toggleAuthMode} className="toggle-button">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">CloudStore</h1>
          <div className="user-section">
            <span className="user-email">{user.email}</span>
            <button onClick={() => setUser(null)} className="logout-button">
              <span className="logout-icon">🚪</span>
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* File Management Controls */}
        <div className="controls-card">
          <div className="controls-content">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="upload-section">
              <input
                type="file"
                id="fileUpload"
                className="file-input-hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => document.getElementById('fileUpload').click()}
                disabled={loading}
                className="upload-button"
              >
                <span className="upload-icon">⬆️</span>
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="files-card">
          <div className="files-content">
            <h2 className="files-title">
              Your Files ({filteredFiles.length})
            </h2>
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p className="empty-text">
                  {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
                </p>
              </div>
            ) : (
              <div className="files-list">
                {filteredFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <p className="file-name">{file.name}</p>
                        <p className="file-meta">
                          {formatFileSize(file.size)} • {file.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="file-actions">
                      <button
                        onClick={() => handleDownload(file)}
                        className="action-button download-button"
                        title="Download"
                      >
                        <span className="action-icon">⬇️</span>
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="action-button delete-button"
                        title="Delete"
                      >
                        <span className="action-icon">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;