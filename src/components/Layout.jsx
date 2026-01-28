import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, FileText, MapPin, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/posts', icon: FileText, label: 'Posts' },
    { path: '/eco-locations', icon: MapPin, label: 'Eco Locations' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/safastep-logo.png" alt="SafaStep" className="logo-icon" />
          <div>
            <h1>SafaStep</h1>
            <p>Admin Panel</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <IconComponent size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
