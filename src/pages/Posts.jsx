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
    // Show custom dialog for deletion reason
    const reason = prompt(
      'Please provide a reason for deleting this post (the user will be notified):',
      'Violated community guidelines'
    );
    
    // If user cancels, return
    if (reason === null) {
      return;
    }
    
    // If reason is empty, use default
    const finalReason = reason.trim() || 'Violated community guidelines';

    try {
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: finalReason }),
      });
      const data = await response.json();

      if (data.success) {
        alert('Post deleted successfully. User has been notified.');
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
                      <span className="likes-badge"><Heart size={16} /> {post.likesCount || 0}</span>
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
          <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
            {detailsLoading ? (
              <div className="modal-loading">Loading post details...</div>
            ) : postDetails ? (
              <>
                <button className="post-modal-close" onClick={() => setSelectedPost(null)}>
                  <X size={20} />
                </button>
                
                <div className="post-modal-grid">
                  {/* Left Side - Image */}
                  <div className="post-modal-image-side">
                    {postDetails.post.imageUrl ? (
                      <img
                        src={postDetails.post.imageUrl.replace(/https:\/\/[^/]+\.ngrok-free\.dev/, 'http://localhost:8000')}
                        alt="Post"
                        className="post-modal-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x800?text=Image+Not+Available';
                        }}
                      />
                    ) : (
                      <div className="post-modal-no-image">No Image</div>
                    )}
                  </div>

                  {/* Right Side - Details */}
                  <div className="post-modal-details-side">
                    {/* User Info */}
                    <div className="post-modal-user">
                      <div className="post-modal-avatar">
                        {postDetails.post.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="post-modal-user-info">
                        <div className="post-modal-user-name">
                          {postDetails.post.firstName} {postDetails.post.lastName}
                        </div>
                        <div className="post-modal-user-contact">
                          {postDetails.post.mobile || postDetails.post.email || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    {postDetails.post.category && (
                      <div className="post-modal-section">
                        <div className="post-modal-label">Category</div>
                        <div className="post-modal-category">
                          {postDetails.post.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    )}

                    {/* Caption */}
                    <div className="post-modal-section">
                      <div className="post-modal-label">Caption</div>
                      <div className="post-modal-caption">
                        {postDetails.post.caption || 'No caption provided'}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="post-modal-section">
                      <div className="post-modal-label">Statistics</div>
                      <div className="post-modal-stats-row">
                        <div className="post-modal-stat-item">
                          <Heart size={16} />
                          <span>{postDetails.stats.likes_count}</span>
                        </div>
                        <div className="post-modal-stat-item status">
                          <span className={`post-modal-status-badge ${postDetails.post.verificationStatus === 'approved' ? 'approved' : 'pending'}`}>
                            {postDetails.post.verificationStatus === 'approved' ? 'Approved' : 
                             postDetails.post.verificationStatus === 'pending_review' ? 'Pending' : 
                             postDetails.post.verificationStatus || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Eco Points & Date Grid */}
                    <div className="post-modal-grid-info">
                      <div className="post-modal-info-card">
                        <div className="post-modal-label">Eco Points</div>
                        <div className="post-modal-info-value eco">
                          {postDetails.post.ecoPoints || 0}
                        </div>
                      </div>
                      <div className="post-modal-info-card">
                        <div className="post-modal-label">CO2 Offset</div>
                        <div className="post-modal-info-value co2">
                          {postDetails.post.co2Offset || 0} kg
                        </div>
                      </div>
                    </div>

                    {/* Posted Date */}
                    <div className="post-modal-section">
                      <div className="post-modal-label">Posted</div>
                      <div className="post-modal-date">
                        {new Date(postDetails.post.createdAt * 1000).toLocaleString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="post-modal-actions">
                      <button
                        className="post-modal-btn delete"
                        onClick={() => handleDeletePost(selectedPost)}
                      >
                        <Trash2 size={18} />
                        Delete Post
                      </button>
                    </div>
                  </div>
                </div>
              </>
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
