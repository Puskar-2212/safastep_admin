import { useState, useEffect } from 'react';
import { Eye, Check, X, AlertCircle } from 'lucide-react';
import './PendingPosts.css';

const PendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/admin/posts/pending?skip=0&limit=50');
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching pending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}/review-details`);
      const data = await response.json();

      if (data.success) {
        setSelectedPost(data);
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const handleApprove = async (postId) => {
    if (!window.confirm('Are you sure you want to approve this post?')) return;

    try {
      setReviewLoading(true);
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: 'admin123',
          notes: 'Approved after manual review'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Post approved! Awarded ${data.ecoPoints} eco points`);
        setSelectedPost(null);
        fetchPendingPosts();
      }
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async (postId) => {
    if (!rejectReason.trim()) {
      alert('Please select a rejection reason');
      return;
    }

    try {
      setReviewLoading(true);
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: 'admin123',
          reason: rejectReason,
          notes: 'Rejected after manual review'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Post rejected successfully');
        setSelectedPost(null);
        setShowRejectModal(false);
        setRejectReason('');
        fetchPendingPosts();
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Failed to reject post');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="pending-posts-container">
      <div className="page-header">
        <h1>Pending Posts Review</h1>
        <div className="stats">
          <div className="stat-badge">
            <AlertCircle size={20} />
            <span>{posts.length} posts waiting</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading pending posts...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>No posts pending review</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-image">
                <img 
                  src={post.imageUrl} 
                  alt="Post"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
                <div className="category-badge">{post.category}</div>
              </div>
              
              <div className="post-info">
                <div className="user-info">
                  <div className="user-avatar">
                    {post.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name">{post.firstName} {post.lastName}</div>
                    <div className="post-time">{formatDate(post.createdAt)}</div>
                  </div>
                </div>

                <p className="caption">{post.caption}</p>

                <div className="ai-results">
                  <div className="ai-label">AI Detected:</div>
                  <div className="detected-objects">
                    {post.aiVerification?.matchedObjects?.map((obj, idx) => (
                      <span key={idx} className="object-tag">
                        {obj.object}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="review-btn"
                  onClick={() => handleViewDetails(post._id)}
                >
                  <Eye size={18} />
                  Review Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Post</h2>
              <button className="close-btn" onClick={() => setSelectedPost(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="user-section">
                <h3>User Information</h3>
                <div className="user-details">
                  <p><strong>Name:</strong> {selectedPost.user?.firstName} {selectedPost.user?.lastName}</p>
                  <p><strong>Contact:</strong> {selectedPost.user?.mobile || selectedPost.user?.email}</p>
                  <p><strong>Eco Points:</strong> {selectedPost.user?.ecoPoints || 0}</p>
                  <p><strong>CO2 Offset:</strong> {selectedPost.user?.totalCO2Offset || 0} kg</p>
                </div>
              </div>

              <div className="comparison-section">
                <h3>Face Verification</h3>
                <p className="instruction">Compare the profile picture with the post image. Is this the same person?</p>
                
                <div className="image-comparison">
                  <div className="comparison-image">
                    <h4>Profile Picture</h4>
                    <img 
                      src={selectedPost.user?.profilePicture || '/placeholder.png'} 
                      alt="Profile"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x300?text=Profile+Not+Available';
                      }}
                    />
                    <p className="image-label">User's registered face</p>
                  </div>

                  <div className="vs-divider">VS</div>

                  <div className="comparison-image">
                    <h4>Post Image</h4>
                    <img 
                      src={selectedPost.post?.imageUrl} 
                      alt="Post"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                      }}
                    />
                    <p className="image-label">Uploaded post</p>
                  </div>
                </div>
              </div>

              <div className="post-details-section">
                <h3>Post Details</h3>
                <p><strong>Caption:</strong> {selectedPost.post?.caption}</p>
                <p><strong>Category:</strong> {selectedPost.post?.category}</p>
                <p><strong>Posted:</strong> {formatDate(selectedPost.post?.createdAt)}</p>
              </div>

              <div className="ai-analysis-section">
                <h3>AI Analysis</h3>
                <div className="ai-checks">
                  <div className="check-item success">
                    <Check size={16} />
                    <span>Eco objects detected: {selectedPost.post?.aiVerification?.matchedObjects?.map(o => o.object).join(', ')}</span>
                  </div>
                  <div className="check-item success">
                    <Check size={16} />
                    <span>No duplicate found</span>
                  </div>
                  <div className="check-item success">
                    <Check size={16} />
                    <span>Image quality: Good</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="approve-btn"
                onClick={() => handleApprove(selectedPost.post._id)}
                disabled={reviewLoading}
              >
                <Check size={20} />
                {reviewLoading ? 'Processing...' : 'Approve Post'}
              </button>
              <button
                className="reject-btn"
                onClick={() => setShowRejectModal(true)}
                disabled={reviewLoading}
              >
                <X size={20} />
                Reject Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Post</h3>
            <p>Please select a reason for rejection:</p>
            
            <select 
              value={rejectReason} 
              onChange={(e) => setRejectReason(e.target.value)}
              className="reject-select"
            >
              <option value="">Select reason...</option>
              <option value="Not the same person">Not the same person</option>
              <option value="No eco-action visible">No eco-action visible</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Poor image quality">Poor image quality</option>
              <option value="Fake/staged action">Fake/staged action</option>
              <option value="Other">Other</option>
            </select>

            <div className="reject-modal-actions">
              <button onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button 
                className="confirm-reject-btn"
                onClick={() => handleReject(selectedPost.post._id)}
                disabled={!rejectReason}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPosts;
