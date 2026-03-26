import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Eye, Edit, Trash2, ToggleLeft, ToggleRight, 
  Users, Trophy, TrendingUp, Calendar, Target, AlertCircle,
  Activity, Leaf, Heart, Globe, Recycle, 
  User, Brain, BookOpen, Dumbbell, TreePine, Zap
} from 'lucide-react';
import ChallengeModal from '../components/ChallengeModal';
import './Challenges.css';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0
  });

  // Icon mapping for challenge icons
  const iconMap = {
    target: Target,
    activity: Activity,
    leaf: Leaf,
    heart: Heart,
    globe: Globe,
    recycle: Recycle,
    user: User,
    brain: Brain,
    book: BookOpen,
    dumbbell: Dumbbell,
    tree: TreePine,
    zap: Zap
  };

  const renderChallengeIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Target;
    return <IconComponent size={20} />;
  };

  useEffect(() => {
    fetchChallenges();
    fetchAnalytics();
  }, [filters, pagination.skip]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        skip: pagination.skip.toString(),
        limit: pagination.limit.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`http://localhost:8000/admin/challenges?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setChallenges(data.challenges);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/admin/challenges/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const toggleChallengeStatus = async (challengeId, active) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/admin/challenges/${challengeId}/toggle?active=${active}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchChallenges();
      }
    } catch (error) {
      console.error('Error toggling challenge status:', error);
    }
  };

  const deleteChallenge = async (challengeId) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/admin/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchChallenges();
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const handleCreateChallenge = () => {
    setSelectedChallenge(null);
    setShowModal(true);
  };

  const handleEditChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setShowModal(true);
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setSelectedChallenge(null);
    if (shouldRefresh) {
      fetchChallenges();
      fetchAnalytics();
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="challenges-container">
        <div className="loading">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="challenges-container">
      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="card-header">
              <div className="card-icon challenges">
                <Target size={24} />
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-value">{analytics.active_challenges}</h3>
              <p className="card-label">Active Challenges</p>
              <p className="card-comparison">of {analytics.total_challenges} total</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <div className="card-icon participants">
                <Users size={24} />
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-value">{analytics.active_participants}</h3>
              <p className="card-label">Active Participants</p>
              <p className="card-comparison">of {analytics.total_participants} total</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <div className="card-icon completion">
                <Trophy size={24} />
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-value">{analytics.overall_completion_rate}%</h3>
              <p className="card-label">Completion Rate</p>
              <p className="card-comparison">{analytics.completed_challenges} completed</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <div className="card-icon points">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-value">{analytics.total_points_awarded}</h3>
              <p className="card-label">Points Awarded</p>
              <p className="card-comparison">Total eco points</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <h1>Challenge Management</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search challenges..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <button className="create-btn" onClick={handleCreateChallenge}>
            <Plus size={20} />
            Create Challenge
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        
        <select 
          value={filters.difficulty} 
          onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          <option value="fitness">Fitness</option>
          <option value="environment">Environment</option>
          <option value="mindfulness">Mindfulness</option>
          <option value="community">Community</option>
        </select>
      </div>

      {/* Challenges Table */}
      <div className="challenges-table">
        <table>
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Difficulty</th>
              <th>Duration</th>
              <th>Participants</th>
              <th>Completion Rate</th>
              <th>Points</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(challenge => (
              <tr key={challenge._id}>
                <td>
                  <div className="challenge-info">
                    <span className="challenge-icon">{renderChallengeIcon(challenge.icon)}</span>
                    <div>
                      <div className="challenge-title">{challenge.title}</div>
                      <div className="challenge-category">{challenge.category}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`difficulty-badge ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </td>
                <td>{challenge.duration_days} days</td>
                <td>{challenge.stats?.total_participants || 0}</td>
                <td>{challenge.stats?.completion_rate || 0}%</td>
                <td>{challenge.reward_points}</td>
                <td>
                  <button 
                    className={`status-toggle ${challenge.active ? 'active' : 'inactive'}`}
                    onClick={() => toggleChallengeStatus(challenge.challenge_id, !challenge.active)}
                  >
                    {challenge.active ? <ToggleRight /> : <ToggleLeft />}
                    {challenge.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view"
                      onClick={() => handleEditChallenge(challenge)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEditChallenge(challenge)}
                      title="Edit Challenge"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => deleteChallenge(challenge.challenge_id)}
                      title="Delete Challenge"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {challenges.length === 0 && !loading && (
          <div className="no-data">
            <AlertCircle size={48} />
            <h3>No challenges found</h3>
            <p>Create your first challenge to get started</p>
            <button className="create-btn" onClick={handleCreateChallenge}>
              <Plus size={20} />
              Create Challenge
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="pagination">
          <button 
            disabled={pagination.skip === 0}
            onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
          >
            Previous
          </button>
          <span>
            {Math.floor(pagination.skip / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button 
            disabled={pagination.skip + pagination.limit >= pagination.total}
            onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Challenge Modal */}
      {showModal && (
        <ChallengeModal 
          challenge={selectedChallenge}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Challenges;