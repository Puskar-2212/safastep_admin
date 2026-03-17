import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, MapPin, Clock, Search, Bell, ChevronDown, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      console.log('Dashboard: Checking admin token:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        console.error('No admin token found');
        setStats(null);
        return;
      }
      
      console.log('Dashboard: Making API calls with token');
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:8000/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Dashboard: Stats response status:', statsResponse.status);
      
      const statsData = await statsResponse.json();
      
      // Fetch recent posts for activity
      const postsResponse = await fetch('http://localhost:8000/admin/posts?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Dashboard: Posts response status:', postsResponse.status);
      
      const postsData = await postsResponse.json();

      if (statsData.success) {
        console.log('Dashboard: Stats loaded successfully:', statsData.stats);
        setStats(statsData.stats);
      } else {
        console.error('Failed to fetch stats:', statsResponse.status, statsData);
      }
      
      if (postsData.success) {
        console.log('Dashboard: Posts loaded successfully:', postsData.posts.length, 'posts');
        setRecentPosts(postsData.posts);
      } else {
        console.error('Failed to fetch posts:', postsResponse.status, postsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="error">Failed to load dashboard data</div>
      </div>
    );
  }

  const chartData = [
    { name: 'Jan', posts: Math.floor((stats.totalPosts || 0) * 0.4), users: Math.floor((stats.totalUsers || 0) * 0.5) },
    { name: 'Feb', posts: Math.floor((stats.totalPosts || 0) * 0.5), users: Math.floor((stats.totalUsers || 0) * 0.6) },
    { name: 'Mar', posts: Math.floor((stats.totalPosts || 0) * 0.6), users: Math.floor((stats.totalUsers || 0) * 0.7) },
    { name: 'Apr', posts: Math.floor((stats.totalPosts || 0) * 0.75), users: Math.floor((stats.totalUsers || 0) * 0.8) },
    { name: 'May', posts: Math.floor((stats.totalPosts || 0) * 0.9), users: Math.floor((stats.totalUsers || 0) * 0.9) },
    { name: 'Jun', posts: stats.totalPosts || 0, users: stats.totalUsers || 0 },
  ];

  const pieData = [
    { name: 'Approved', value: stats.approvedPosts || 0 },
    { name: 'Pending', value: stats.pendingPosts || 0 },
    { name: 'Rejected', value: stats.rejectedPosts || 0 },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  const getStatusFromPost = (post) => {
    const status = post.verificationStatus;
    if (status === 'approved') return 'approved';
    if (status === 'pending_review') return 'pending';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const diff = now - (timestamp * 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const recentActivity = recentPosts.map((post, index) => ({
    id: post._id || index,
    user: `${post.firstName || ''} ${post.lastName || ''}`.trim() || post.userName || 'Unknown User',
    action: post.caption || 'Posted eco-action',
    status: getStatusFromPost(post),
    time: getTimeAgo(post.createdAt)
  }));

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="navbar-left">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="navbar-right">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search..." />
          </div>
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <div className="profile-dropdown">
            <div className="profile-avatar">A</div>
            <span className="profile-name">Admin</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon users">
              <Users size={24} />
            </div>
            <div className="card-trend positive">
              <TrendingUp size={16} />
              <span>12.5%</span>
            </div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{stats.totalUsers || 0}</h3>
            <p className="card-label">Total Users</p>
            <p className="card-comparison">Compared to last month</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon posts">
              <FileText size={24} />
            </div>
            <div className="card-trend positive">
              <TrendingUp size={16} />
              <span>8.3%</span>
            </div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{stats.totalPosts || 0}</h3>
            <p className="card-label">Total Posts</p>
            <p className="card-comparison">Compared to last month</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon pending">
              <Clock size={24} />
            </div>
            <div className="card-trend negative">
              <TrendingDown size={16} />
              <span>3.2%</span>
            </div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{stats.pendingPosts || 0}</h3>
            <p className="card-label">Pending Review</p>
            <p className="card-comparison">Compared to last month</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon locations">
              <MapPin size={24} />
            </div>
            <div className="card-trend positive">
              <TrendingUp size={16} />
              <span>15.7%</span>
            </div>
          </div>
          <div className="card-body">
            <h3 className="card-value">{stats.totalEcoPoints || 0}</h3>
            <p className="card-label">Eco Points Awarded</p>
            <p className="card-comparison">Compared to last month</p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="main-section">
        <div className="chart-container large">
          <div className="chart-header">
            <h3>Platform Growth</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot purple"></span>
                Posts
              </span>
              <span className="legend-item">
                <span className="legend-dot pink"></span>
                Users
              </span>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 20, 28, 0.95)', 
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container small">
          <div className="chart-header">
            <h3>Post Status</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 20, 28, 0.95)', 
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {pieData.map((entry, index) => (
                <div key={index} className="pie-legend-item">
                  <span className="pie-dot" style={{ backgroundColor: COLORS[index] }}></span>
                  <span className="pie-label">{entry.name}</span>
                  <span className="pie-value">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Activity</h3>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="table-wrapper">
          {recentActivity.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">{activity.user.charAt(0).toUpperCase()}</div>
                        <span>{activity.user}</span>
                      </div>
                    </td>
                    <td>{activity.action}</td>
                    <td>
                      <span className={`status-badge ${activity.status}`}>
                        {activity.status === 'approved' && <CheckCircle size={14} />}
                        {activity.status === 'pending' && <Clock size={14} />}
                        {activity.status === 'rejected' && <XCircle size={14} />}
                        {activity.status}
                      </span>
                    </td>
                    <td className="time-cell">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
