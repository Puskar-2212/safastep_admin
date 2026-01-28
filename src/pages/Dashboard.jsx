import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Heart, MapPin } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-page">
        <div className="error">Failed to load dashboard data</div>
      </div>
    );
  }

  // Sample data for charts (in real app, this would come from backend)
  const chartData = [
    { name: 'Week 1', users: stats.total_users * 0.2, posts: stats.total_posts * 0.15, likes: stats.total_likes * 0.1 },
    { name: 'Week 2', users: stats.total_users * 0.35, posts: stats.total_posts * 0.3, likes: stats.total_likes * 0.25 },
    { name: 'Week 3', users: stats.total_users * 0.6, posts: stats.total_posts * 0.55, likes: stats.total_likes * 0.5 },
    { name: 'Week 4', users: stats.total_users * 0.85, posts: stats.total_posts * 0.8, likes: stats.total_likes * 0.75 },
    { name: 'Week 5', users: stats.total_users, posts: stats.total_posts, likes: stats.total_likes },
  ];

  const pieData = [
    { name: 'Users', value: stats.total_users },
    { name: 'Posts', value: stats.total_posts },
    { name: 'Likes', value: stats.total_likes },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  const avgLikesPerPost = stats.total_posts > 0 ? (stats.total_likes / stats.total_posts).toFixed(2) : 0;
  const avgPostsPerUser = stats.total_users > 0 ? (stats.total_posts / stats.total_users).toFixed(2) : 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Platform overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Users size={32} /></div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.total_users}</p>
            <span className="stat-change">+12% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FileText size={32} /></div>
          <div className="stat-content">
            <h3>Total Posts</h3>
            <p className="stat-value">{stats.total_posts}</p>
            <span className="stat-change">+8% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Heart size={32} /></div>
          <div className="stat-content">
            <h3>Total Likes</h3>
            <p className="stat-value">{stats.total_likes}</p>
            <span className="stat-change">+15% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><MapPin size={32} /></div>
          <div className="stat-content">
            <h3>Eco-Locations</h3>
            <p className="stat-value">{stats.total_eco_locations}</p>
            <span className="stat-change">+3 new locations</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <h3>Avg Likes per Post</h3>
          <p className="metric-value">{avgLikesPerPost}</p>
        </div>
        <div className="metric-card">
          <h3>Avg Posts per User</h3>
          <p className="metric-value">{avgPostsPerUser}</p>
        </div>
        <div className="metric-card">
          <h3>Engagement Rate</h3>
          <p className="metric-value">{stats.total_posts > 0 ? ((stats.total_likes / (stats.total_posts * stats.total_users)) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {/* Line Chart */}
        <div className="chart-card">
          <h3>Growth Trend</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                <Line type="monotone" dataKey="posts" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h3>Activity Comparison</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="users" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="posts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="likes" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3>Data Distribution</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}`}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #2a3142', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
