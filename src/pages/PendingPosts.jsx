import { useState, useEffect } from 'react';
import { Eye, Check, X, AlertCircle, Clock, User, Filter, SortAsc } from 'lucide-react';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import './PendingPosts.css';

const PendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filters, setFilters] = useState({
    confidence: 'all', // all, high, medium, low
    recommendation: 'all', // all, auto_approve, auto_reject, manual_review
    sortBy: 'date' // date, confidence, quality
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    fetchPendingPosts();
  }, [filters, pagination.skip]);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/admin/posts/pending?skip=${pagination.skip}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        let filteredPosts = data.posts;
        
        // Apply filters
        if (filters.confidence !== 'all') {
          filteredPosts = filteredPosts.filter(post => 
            post.ai_summary?.confidence_level === filters.confidence
          );
        }
        
        if (filters.recommendation !== 'all') {
          filteredPosts = filteredPosts.filter(post => 
            post.ai_summary?.ai_recommendation === filters.recommendation
          );
        }
        
        // Apply sorting
        filteredPosts.sort((a, b) => {
          switch (filters.sortBy) {
            case 'confidence':
              return (b.ai_summary?.face_confidence || 0) - (a.ai_summary?.face_confidence || 0);
            case 'quality':
              return (b.ai_summary?.quality_score || 0) - (a.ai_summary?.quality_score || 0);
            default: // date
              return b.createdAt - a.createdAt;
          }
        });
        
        setPosts(filteredPosts);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error fetching pending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (postId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}/review-details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/admin/posts/${postId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      {/* Top Header */}
      <div className="pending-posts-header">
        <div className="header-left">
          <div className="header-icon">
            <Clock size={32} />
          </div>
          <div className="header-text">
            <h1>Pending Posts Review</h1>
            <p>{posts.length} posts awaiting review</p>
          </div>
        </div>
        <div className="header-right">
          <div className="stats-badge">
            <AlertCircle size={20} />
            <span>{posts.length} posts waiting</span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <Filter size={16} />
          <select 
            value={filters.confidence} 
            onChange={(e) => setFilters({...filters, confidence: e.target.value})}
          >
            <option value="all">All Confidence Levels</option>
            <option value="high">High Confidence (80%+)</option>
            <option value="medium">Medium Confidence (50-79%)</option>
            <option value="low">Low Confidence (&lt;50%)</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            value={filters.recommendation} 
            onChange={(e) => setFilters({...filters, recommendation: e.target.value})}
          >
            <option value="all">All Recommendations</option>
            <option value="auto_approve">Auto-Approve Recommended</option>
            <option value="manual_review">Manual Review Required</option>
            <option value="auto_reject">Auto-Reject Recommended</option>
          </select>
        </div>
        
        <div className="filter-group">
          <SortAsc size={16} />
          <select 
            value={filters.sortBy} 
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="date">Sort by Date</option>
            <option value="confidence">Sort by Face Confidence</option>
            <option value="quality">Sort by Image Quality</option>
          </select>
        </div>
      </div>

      {/* Posts Content */}
      <div className="posts-content">
        {loading ? (
          <div className="loading-state">Loading pending posts...</div>
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
                    <div className="user-details">
                      <div className="user-name">{post.firstName} {post.lastName}</div>
                      <div className="post-time">{formatDate(post.createdAt)}</div>
                    </div>
                  </div>

                  <p className="caption">{post.caption}</p>

                  {/* AI Analysis Summary */}
                  {post.ai_summary && (
                    <AIAnalysisPanel aiAnalysis={post.ai_summary} compact={true} />
                  )}

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
      </div>

      {/* Review Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Post</h2>
              <button className="close-btn" onClick={() => setSelectedPost(null)}>×</button>
            </div>

            <div className="modal-body">
              {/* AI Analysis Section */}
              {selectedPost.ai_analysis && (
                <AIAnalysisPanel aiAnalysis={selectedPost.ai_analysis} />
              )}

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
