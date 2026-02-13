import { useState, useEffect } from 'react';
import { Eye, Trash2, Search, X, Heart } from 'lucide-react';
import './Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const skip = currentPage * itemsPerPage;
      const response = await fetch(
        `http://localhost:8000/admin/posts?skip=${skip}&limit=${itemsPerPage}`
      );
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setTotalPosts(data.total);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setCurrentPage(0);
      fetchPosts();
      return;
    }

    try {
      setLoading(true);
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch(
        `http://localhost:8000/admin/posts/search?query=${encodeURIComponent(searchQuery)}&skip=0&limit=${itemsPerPage}`
      );
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setTotalPosts(data.total);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (postId) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}`);
      const data = await response.json();

      if (data.success) {
        setPostDetails(data);
        setSelectedPost(postId);
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post and all associated likes?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('Post deleted successfully');
        setSelectedPost(null);
        fetchPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  const truncateCaption = (caption, length = 50) => {
    return caption.length > length ? caption.substring(0, length) + '...' : caption;
  };

  return (
    <div className="posts-page">
      <div className="page-header">
        <h1>Posts Management</h1>
        <p>Manage all user posts</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by caption, user name, or mobile..."
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
                fetchPosts();
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="posts-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Caption</th>
                  <th>Likes</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id}>
                    <td className="user-cell">
                      <div className="user-avatar">
                        {post.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">
                          {post.firstName} {post.lastName}
                        </div>
                        <div className="user-mobile">{post.mobile || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="caption-cell">
                      {truncateCaption(post.caption || 'No caption')}
                    </td>
                    <td className="likes-cell">
                      <span className="likes-badge"><Heart size={16} /> {post.likes || 0}</span>
                    </td>
                    <td>
                      {new Date(post.createdAt * 1000).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(post._id)}
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePost(post._id)}
                        title="Delete post"
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

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post Details</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedPost(null)}
              >
                <X size={24} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="modal-loading">Loading post details...</div>
            ) : postDetails ? (
              <div className="modal-body">
                <div className="post-user-section">
                  <div className="post-user-avatar">
                    {postDetails.post.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="post-user-info">
                    <div className="post-user-name">
                      {postDetails.post.firstName} {postDetails.post.lastName}
                    </div>
                    <div className="post-user-mobile">
                      {postDetails.post.mobile || postDetails.post.email || 'N/A'}
                    </div>
                    <div className="post-date">
                      {new Date(postDetails.post.createdAt * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="post-caption-section">
                  <h3>Caption</h3>
                  <p>{postDetails.post.caption || 'No caption'}</p>
                </div>

                {postDetails.post.imageUrl && (
                  <div className="post-image-section">
                    <h3>Image</h3>
                    <img
                      src={postDetails.post.imageUrl.replace(/https:\/\/[^/]+\.ngrok-free\.dev/, 'http://localhost:8000')}
                      alt="Post"
                      className="post-image"
                      onError={(e) => {
                        console.error('Image failed to load:', postDetails.post.imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                    <p className="image-url-debug" style={{fontSize: '10px', color: '#999', marginTop: '8px'}}>
                      Original: {postDetails.post.imageUrl}
                    </p>
                  </div>
                )}

                <div className="post-stats-section">
                  <h3>Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{postDetails.stats.likes_count}</div>
                      <div className="stat-label">Likes</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{postDetails.post.verified ? '✓' : '✗'}</div>
                      <div className="stat-label">Verified</div>
                    </div>
                  </div>
                </div>

                {postDetails.post.ecoPoints && (
                  <div className="eco-points-section">
                    <h3>Eco Points</h3>
                    <p className="eco-points-value">🌱 {postDetails.post.ecoPoints}</p>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className="action-delete"
                    onClick={() => {
                      handleDeletePost(selectedPost);
                    }}
                  >
                    Delete Post
                  </button>
                  <button
                    className="action-close"
                    onClick={() => setSelectedPost(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-error">Failed to load post details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
