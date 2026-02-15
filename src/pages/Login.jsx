import { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user info
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);
        localStorage.setItem('adminRole', data.role);
        onLogin(data.token);
      } else {
        setError(data.detail || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Full Screen Video Background */}
      <div className="fullscreen-video-background">
        <div className="logo-section">
          <div className="logo-text">
            <h1>Welcome to SafaStep</h1>
            <p>Admin Panel</p>
          </div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="fullscreen-video"
          >
            <source src="/logo_animation.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Login Form Overlay */}
      <div className="login-overlay">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Default credentials: <strong>admin / admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
