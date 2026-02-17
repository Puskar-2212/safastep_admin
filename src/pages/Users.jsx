import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Mail, Phone, Award, FileText, Heart, Trash2, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isSearching) {
      fetchUsers();
    }
  }, [currentPage, isSearching]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const skip = currentPage * itemsPerPage;
      const response = await fetch(`http://localhost:8000/admin/users?skip=${skip}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setCurrentPage(0);
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const response = await fetch(`http://localhost:8000/admin/users/search?query=${encodeURIComponent(searchQuery)}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.total);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setCurrentPage(0);
    fetchUsers();
  };

  const handleUserClick = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedUser({ ...data.user, stats: data.stats });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their posts and likes.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('User deleted successfully');
        setShowModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="users-container">
      {/* Top Header */}
      <div className="users-header">
        <div className="header-left">
          <div className="header-icon">
            <UsersIcon size={32} />
          </div>
          <div className="header-text">
            <h1>Users Management</h1>
            <p>{isSearching ? `${totalUsers} search results` : `${totalUsers} total users`}</p>
          </div>
        </div>
        <div className="header-right">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="search-button">Search</button>
            {searchQuery && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Date of Birth</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} onClick={() => handleUserClick(user._id)}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.firstName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        {user.email && (
                          <div className="contact-item">
                            <Mail size={14} />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.mobile && (
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{user.mobile}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {user.dateOfBirth
                        ? `${user.dateOfBirth.day}/${user.dateOfBirth.month}/${user.dateOfBirth.year}`
                        : 'N/A'}
                    </td>
                    <td>{new Date(user.createdAt * 1000).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {!isSearching && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-avatar">
                  {selectedUser.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="modal-header-info">
                  <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p>{selectedUser.email || selectedUser.mobile}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Stats Cards */}
              <div className="modal-stats">
                <div className="modal-stat-card">
                  <div className="stat-icon posts">
                    <FileText size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{selectedUser.stats?.posts_count || 0}</div>
                    <div className="stat-label">Posts</div>
                  </div>
                </div>
                <div className="modal-stat-card">
                  <div className="stat-icon likes">
                    <Heart size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{selectedUser.stats?.likes_count || 0}</div>
                    <div className="stat-label">Likes</div>
                  </div>
                </div>
                <div className="modal-stat-card">
                  <div className="stat-icon points">
                    <Award size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{selectedUser.ecoPoints || 0}</div>
                    <div className="stat-label">Eco Points</div>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="modal-details">
                <h3>User Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>First Name</label>
                    <p>{selectedUser.firstName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Name</label>
                    <p>{selectedUser.lastName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Mobile</label>
                    <p>{selectedUser.mobile || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <p>
                      {selectedUser.dateOfBirth
                        ? `${selectedUser.dateOfBirth.day}/${selectedUser.dateOfBirth.month}/${selectedUser.dateOfBirth.year}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Joined Date</label>
                    <p>{new Date(selectedUser.createdAt * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
