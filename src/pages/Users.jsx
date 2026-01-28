import { useState, useEffect } from 'react';
import { Eye, Trash2, Search, X } from 'lucide-react';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const skip = currentPage * itemsPerPage;
      const response = await fetch(
        `http://localhost:8000/admin/users?skip=${skip}&limit=${itemsPerPage}`
      );
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
      setCurrentPage(0);
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch(
        `http://localhost:8000/admin/users/search?query=${encodeURIComponent(searchQuery)}&skip=0&limit=${itemsPerPage}`
      );
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

  const handleViewDetails = async (userId) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUserDetails(data);
        setSelectedUser(userId);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('User deleted successfully');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <p>Manage all registered users</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <Search size={18} />
            <span>Search</span>
          </button>
          {searchQuery && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(0);
                fetchUsers();
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Date of Birth</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="name-cell">
                      <div className="user-avatar">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.mobile || 'N/A'}</td>
                    <td>
                      {user.dateOfBirth
                        ? `${user.dateOfBirth.day}/${user.dateOfBirth.month}/${user.dateOfBirth.year}`
                        : 'N/A'}
                    </td>
                    <td>
                      {new Date(user.createdAt * 1000).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(user._id)}
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`pagination-number ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedUser(null)}
              >
                <X size={24} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="modal-loading">Loading user details...</div>
            ) : userDetails ? (
              <div className="modal-body">
                <div className="details-section">
                  <div className="detail-item">
                    <label>First Name</label>
                    <p>{userDetails.user.firstName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Name</label>
                    <p>{userDetails.user.lastName}</p>
                  </div>
                </div>

                <div className="details-section">
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{userDetails.user.email || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Mobile</label>
                    <p>{userDetails.user.mobile || 'N/A'}</p>
                  </div>
                </div>

                <div className="details-section">
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <p>
                      {userDetails.user.dateOfBirth
                        ? `${userDetails.user.dateOfBirth.day}/${userDetails.user.dateOfBirth.month}/${userDetails.user.dateOfBirth.year}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Joined Date</label>
                    <p>
                      {new Date(userDetails.user.createdAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="stats-section">
                  <h3>User Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{userDetails.stats.posts_count}</div>
                      <div className="stat-label">Posts</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{userDetails.stats.likes_count}</div>
                      <div className="stat-label">Likes</div>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="action-delete"
                    onClick={() => {
                      handleDeleteUser(selectedUser);
                    }}
                  >
                    Delete User
                  </button>
                  <button
                    className="action-close"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-error">Failed to load user details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
