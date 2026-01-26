import { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalEcoLocations: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulating API call
      setTimeout(() => {
        setStats({
          totalUsers: 150,
          totalPosts: 320,
          totalEcoLocations: 25,
          totalLikes: 1240,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6366f1' },
    { label: 'Total Posts', value: stats.totalPosts, icon: '📝', color: '#10b981' },
    { label: 'Eco Locations', value: stats.totalEcoLocations, icon: '📍', color: '#f59e0b' },
    { label: 'Total Likes', value: stats.totalLikes, icon: '❤️', color: '#ef4444' },
  ];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to SafaStep Admin Panel</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ '--card-color': stat.color }}>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>🌱 Welcome to SafaStep Admin</h2>
          <p>Manage users, posts, and eco-locations from this dashboard.</p>
          <ul>
            <li>View and manage all registered users</li>
            <li>Monitor and moderate user posts</li>
            <li>Add and update eco-friendly locations</li>
            <li>Track platform statistics and growth</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
