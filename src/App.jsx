import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Posts from './pages/Posts';
import EcoLocations from './pages/EcoLocations';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('adminToken') !== null
  );

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/eco-locations" element={<EcoLocations />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
