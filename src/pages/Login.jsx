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

    // TODO: Replace with actual API call
    // For now, using hardcoded credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin('dummy-token');
    } else {
      setError('Invalid username or password');
    }
    
    setLoading(false);
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
