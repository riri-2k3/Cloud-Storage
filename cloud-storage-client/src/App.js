// Enhanced App.js with Drag & Drop and Preview
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null); // { email, token }
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Helper to safely format dates
  const formatDate = (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d) ? '' : d.toLocaleDateString();
  };

  // Defensive error parsing from response
  const parseErrorResponse = async (response) => {
    try {
      const text = await response.text(); // Read once
      try {
        const json = JSON.parse(text);
        return json.message || json.error || 'Unknown error occurred';
      } catch {
        return text.includes('<!DOCTYPE')
          ? 'Server returned HTML instead of JSON. Check your API route or proxy configuration.'
          : text || 'Unknown error occurred';
      }
    } catch (e) {
      return 'Unknown error';
    }
  };

  // API methods with defensive error handling
  const API_BASE = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : 'http://localhost:5000';

  console.log('🚀 DEBUG INFO:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('API_BASE:', API_BASE);
  console.log('Full login URL will be:', `${API_BASE}api/users/login`);
  
  const api = {
    login: async (email, password) => {
      try {
        const res = await fetch(`${API_BASE}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const msg = await parseErrorResponse(res);
          throw new Error(msg);
        }
        return await res.json();
      } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) 
          throw new Error('Unable to connect to server. Check your connection.');
        throw e;
      }
    },
    signup: async (email, password) => {
      try {
        const res = await fetch(`${API_BASE}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const msg = await parseErrorResponse(res);
          throw new Error(msg);
        }
        return await res.json();
      } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) 
          throw new Error('Unable to connect to server. Check your connection.');
        throw e;
      }
    },
    getFiles: async (token) => {
      try {
        const res = await fetch(`${API_BASE}/api/files`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Session expired. Please log in again.');
          const msg = await parseErrorResponse(res);
          throw new Error(msg);
        }
        return await res.json();
      } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch'))
          throw new Error('Unable to connect to server. Check your connection.');
        throw e;
      }
    },
    uploadFile: async (file, token) => {
      try {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch(`${API_BASE}/api/files/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Session expired. Please log in again.');
          if (res.status === 413) throw new Error('File too large. Select a smaller file.');
          const msg = await parseErrorResponse(res);
          throw new Error(msg);
        }
        return await res.json();
      } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch'))
          throw new Error('Unable to connect to server. Check your connection.');
        throw e;
      }
    },
    deleteFile: async (id, token) => {
      try {
        const res = await fetch(`${API_BASE}/api/files/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Session expired. Please log in again.');
          if (res.status === 404) throw new Error('File not found or already deleted.');
          const msg = await parseErrorResponse(res);
          throw new Error(msg);
        }
        return await res.json();
      } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch'))
          throw new Error('Unable to connect to server. Check your connection.');
        throw e;
      }
    },
    downloadFile: async (id, token) => {
      try {
        const res = await fetch(`${API_BASE}/api/files/${id}/download`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Session expired. Please log in again.');
          if (res.status === 404) throw new Error('File not found.');
          throw new Error('Download failed. Please try again.');
        }
        return res.blob();
      } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch'))
          throw new Error('Unable to connect to server. Check your connection.');
        throw e;
      }
    },
  };

  // File type helpers (icons)
  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'spreadsheet';
    if (['pptx', 'ppt'].includes(ext)) return 'presentation';
    if (['docx', 'doc', 'txt'].includes(ext)) return 'document';
    return 'file';
  };
  
  const getFileIcon = (type) => {
    const icons = {
      image: '🖼️',
      pdf: '📄',
      spreadsheet: '📊',
      presentation: '📽️',
      document: '📝',
      file: '📁',
    };
    return icons[type] || icons.file;
  };

  // Check if file can be previewed
  const canPreview = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf', 'txt'].includes(ext);
  };

  // Handle session expiration: clear session & notify user
  const handleSessionExpiration = () => {
    setUser(null);
    localStorage.removeItem('cloudstoreUser');
    setError('Your session has expired. Please log in again.');
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('cloudstoreUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && userData.token) {
          setUser(userData);
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('cloudstoreUser');
      }
    }
  }, []);

  // Load files when user logs in or changes
  useEffect(() => {
    if (user && user.token) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [user]);

  // Auto-clear error and success messages after 5s
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Load file list from backend
  const loadFiles = async () => {
    if (!user?.token) {
      console.warn('No user token; skipping loadFiles');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.getFiles(user.token);
      // Backend returns { files: [...], pagination: {...} }
      const fileList = response.files || response || [];
      setFiles(Array.isArray(fileList) ? fileList : []);
    } catch (e) {
      console.error('Error loading files:', e);
      if (e.message.toLowerCase().includes('session expired')) {
        handleSessionExpiration();
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = await api.login(email, password);
      console.log('Logged in user:', userData);
      if (!userData.token) throw new Error('Missing token in login response');
      
      // Save to localStorage for persistence - save the complete response
      const userToSave = {
        token: userData.token,
        email: userData.user?.email || userData.email,
        id: userData.user?.id || userData.id
      };
      localStorage.setItem('cloudstoreUser', JSON.stringify(userToSave));
      setUser(userToSave);
      setEmail('');
      setPassword('');
      setSuccessMessage('Login successful');
    } catch (e) {
      console.error("Login error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = await api.signup(email, password);
      console.log('Signed up user:', userData);
      if (!userData.token) throw new Error('Missing token in signup response');
      
      // Save to localStorage for persistence - save the complete response  
      const userToSave = {
        token: userData.token,
        email: userData.user?.email || userData.email,
        id: userData.user?.id || userData.id
      };
      localStorage.setItem('cloudstoreUser', JSON.stringify(userToSave));
      setUser(userToSave);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Account created successfully');
    } catch (e) {
      console.error("Signup error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp((prev) => !prev);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  // File upload validations
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ];
    if (file.size > maxSize) throw new Error('File size cannot exceed 50MB');
    if (!allowedTypes.includes(file.type))
      throw new Error('Unsupported file type. Upload images, documents, spreadsheets, or presentations.');
  };

  // Upload file (works for both manual and drag & drop)
  const uploadFile = async (file) => {
    try {
      validateFile(file);
    } catch (e) {
      setError(e.message);
      return;
    }

    setUploading(true);
    setError('');
    try {
      const response = await api.uploadFile(file, user.token);
      // Backend returns { message: '...', file: {...} }
      const newFile = response.file || response;
      setFiles((prev) => [newFile, ...prev]);
      setSuccessMessage(`${file.name} uploaded successfully`);
    } catch (e) {
      console.error('Upload error:', e);
      if (e.message.toLowerCase().includes('session expired')) handleSessionExpiration();
      else setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  // File upload handler (manual)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await uploadFile(file);
    
    // Clear the file input
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  // Delete file
  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${filename}"? This cannot be undone.`))
      return;
    setError('');
    try {
      await api.deleteFile(id, user.token);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setSuccessMessage(`${filename} deleted successfully.`);
    } catch (e) {
      console.error('Delete error:', e);
      if (e.message.toLowerCase().includes('session expired')) handleSessionExpiration();
      else setError(e.message);
    }
  };

  // Download file
  const handleDownload = async (file) => {
    setError('');
    try {
      const blob = await api.downloadFile(file.id, user.token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage(`${file.name} downloaded successfully.`);
    } catch (e) {
      console.error('Download error:', e);
      if (e.message.toLowerCase().includes('session expired')) handleSessionExpiration();
      else setError(e.message);
    }
  };

  // Preview file
  const handlePreview = async (file) => {
    if (!canPreview(file.name)) {
      setError('Preview not available for this file type');
      return;
    }

    setError('');
    try {
      const blob = await api.downloadFile(file.id, user.token);
      const url = window.URL.createObjectURL(blob);
      setPreviewFile({ ...file, url, type: getFileType(file.name) });
    } catch (e) {
      console.error('Preview error:', e);
      if (e.message.toLowerCase().includes('session expired')) handleSessionExpiration();
      else setError(e.message);
    }
  };

  // Close preview
  const closePreview = () => {
    if (previewFile?.url) {
      window.URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cloudstoreUser');
    setFiles([]);
    setError('');
    setSuccessMessage('');
    setSearchTerm('');
    closePreview();
  };

  // Format file sizes like "1.2 MB"
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter files by search term
  const filteredFiles = files.filter((f) => 
    f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render login/signup form if no user
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">☁️</div>
            <h1 className="app-title">CloudStore</h1>
            <p className="login-subtitle">{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              ⚠️ {error}
            </div>
          )}
          {successMessage && (
            <div className="success-message" role="alert">
              ✅ {successMessage}
            </div>
          )}

          <div className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              aria-label="Email"
              onKeyPress={(e) => e.key === 'Enter' && (isSignUp ? handleSignUp() : handleLogin())}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              aria-label="Password"
              onKeyPress={(e) => e.key === 'Enter' && (isSignUp ? handleSignUp() : handleLogin())}
            />
            {isSignUp && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
                aria-label="Confirm Password"
                onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
              />
            )}

            <button
              type="button"
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={loading}
              className="login-button"
              aria-busy={loading}
            >
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="auth-toggle">
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" onClick={toggleAuthMode} className="toggle-button">
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main dashboard if logged in
  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">☁️ CloudStore</h1>
          <div className="user-section">
            <span className="user-email">{user.email}</span>
            <button
              type="button"
              className="logout-button"
              title="Logout"
              onClick={handleLogout}
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {(error || successMessage) && (
          <div className="message-container" role="region" aria-live="polite">
            {error && (
              <div className="error-message" role="alert">
                ⚠️ {error}{' '}
                <button type="button" onClick={() => setError('')} aria-label="Close error message" className="close-button">
                  ×
                </button>
              </div>
            )}
            {successMessage && (
              <div className="success-message" role="alert">
                ✅ {successMessage}{' '}
                <button type="button" onClick={() => setSuccessMessage('')} aria-label="Close success message" className="close-button">
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        <section className="controls-card">
          <div className="controls-content">
            <div className="search-container">
              <span aria-hidden="true" className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Search files"
              />
            </div>

            <div className="upload-section">
              {/* Drag & Drop Area */}
              <div
                className={`dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && document.getElementById('fileUpload').click()}
              >
                <div className="dropzone-content">
                  {uploading ? (
                    <>
                      <div className="upload-spinner"></div>
                      <p>Uploading...</p>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-icon">📁</div>
                      <p className="dropzone-text">
                        <span className="dropzone-main">Drop files here</span>
                        <span className="dropzone-sub">or click to browse</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                id="fileUpload"
                className="file-input-hidden"
                onChange={handleFileUpload}
                aria-label="Upload file"
                disabled={uploading}
              />
            </div>
          </div>
        </section>

        <section className="files-card" aria-label="Your files">
          <div className="files-content">
            <h2 className="files-title">
              Your Files ({filteredFiles.length})
              {files.length > 0 && (
                <button type="button" onClick={loadFiles} className="refresh-button" title="Refresh files" aria-label="Refresh files">
                  🔄
                </button>
              )}
            </h2>

            {loading ? (
              <div className="loading-container" role="status" aria-live="polite">
                <div className="spinner"></div>
                <p className="loading-text">Loading files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">📁</div>
                <p className="empty-text">{searchTerm ? 'No files match your search criteria' : 'No files uploaded yet'}</p>
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileUpload').click()}
                    className="upload-button"
                    style={{ marginTop: '1rem' }}
                  >
                    ⬆️ Upload Your First File
                  </button>
                )}
              </div>
            ) : (
              <div className="files-grid">
                {filteredFiles.map((file) => (
                  <div key={file.id || file._id} className="file-card">
                    <div className="file-card-header">
                      <span className="file-icon" aria-hidden="true">{getFileIcon(getFileType(file.name))}</span>
                      
                    </div>
                    <div className="file-card-body">
                      <p className="file-name" title={file.name}>{file.name}</p>
                      <p className="file-meta">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt || file.uploadDate)}
                      </p>
                    </div>
                    <div className="file-card-actions">
                      {canPreview(file.name) && (
                        <button
                          type="button"
                          className="action-button preview-button"
                          title={`Preview ${file.name}`}
                          onClick={() => handlePreview(file)}
                        >
                          👁️
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-button download-button"
                        title={`Download ${file.name}`}
                        onClick={() => handleDownload(file)}
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        className="action-button delete-button"
                        title={`Delete ${file.name}`}
                        onClick={() => handleDelete(file.id || file._id, file.name)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Preview Modal */}
      {previewFile && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3 className="preview-title">{previewFile.name}</h3>
              <button
                type="button"
                className="preview-close"
                onClick={closePreview}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <div className="preview-body">
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="preview-image"
                />
              ) : previewFile.type === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  className="preview-pdf"
                  title={previewFile.name}
                />
              ) : (
                <div className="preview-unsupported">
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>
            <div className="preview-actions">
              <button
                type="button"
                className="preview-download"
                onClick={() => handleDownload(previewFile)}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;