import { useState, useEffect } from 'react';
import { 
  X, Save, Plus, Trash2, Users, BarChart3, Calendar,
  Target, Activity, Leaf, Heart, Globe, Recycle, 
  User, Brain, BookOpen, Dumbbell, TreePine, Zap, Lock, Unlock
} from 'lucide-react';
import './ChallengeModal.css';

const ChallengeModal = ({ challenge, onClose }) => {
  const [formData, setFormData] = useState({
    challenge_id: '',
    title: '',
    description: '',
    duration_days: 7,
    reward_points: 100,
    category: 'fitness',
    icon: 'target',
    difficulty: 'easy',
    tips: [''],
    allow_one_skip: false,
    featured: false,
    tags: [''],
    admin_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [challengeStats, setChallengeStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [unlockingUser, setUnlockingUser] = useState(null);
  const [unlockingAll, setUnlockingAll] = useState(false);

  const isEditing = !!challenge;

  useEffect(() => {
    if (challenge) {
      setFormData({
        challenge_id: challenge.challenge_id || '',
        title: challenge.title || '',
        description: challenge.description || '',
        duration_days: challenge.duration_days || 7,
        reward_points: challenge.reward_points || 100,
        category: challenge.category || 'fitness',
        icon: challenge.icon || 'target',
        difficulty: challenge.difficulty || 'easy',
        tips: challenge.tips?.length > 0 ? challenge.tips : [''],
        allow_one_skip: challenge.allow_one_skip || false,
        featured: challenge.featured || false,
        tags: challenge.tags?.length > 0 ? challenge.tags : [''],
        admin_notes: challenge.admin_notes || ''
      });
      
      // Fetch detailed stats and participants for editing
      fetchChallengeDetails(challenge.challenge_id);
    }
  }, [challenge]);

  const fetchChallengeDetails = async (challengeId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch detailed challenge info
      const response = await fetch(`http://localhost:8000/admin/challenges/${challengeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setChallengeStats(data.challenge.stats);
        setParticipants(data.challenge.recent_participants || []);
      }

      // Fetch participants with lock status
      const participantsResponse = await fetch(`http://localhost:8000/admin/challenges/${challengeId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const participantsData = await participantsResponse.json();
      if (participantsData.success) {
        setParticipants(participantsData.participants || []);
      }
    } catch (error) {
      console.error('Error fetching challenge details:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Clean up form data
      const submitData = {
        ...formData,
        tips: formData.tips.filter(tip => tip.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        duration_days: parseInt(formData.duration_days),
        reward_points: parseInt(formData.reward_points)
      };

      const url = isEditing 
        ? `http://localhost:8000/admin/challenges/${challenge.challenge_id}`
        : 'http://localhost:8000/admin/challenges';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      if (data.success) {
        onClose(true); // Refresh parent component
      } else {
        alert(data.detail || 'Error saving challenge');
      }
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Error saving challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId) => {
    setUnlockingUser(userId);
    try {
      const token = localStorage.getItem('adminToken');
      
      // Create form data
      const formData = new FormData();
      formData.append('user_id', userId);
      
      const response = await fetch(
        `http://localhost:8000/admin/challenges/${challenge.challenge_id}/unlock`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();
      if (data.success) {
        // Refresh participants list
        await fetchChallengeDetails(challenge.challenge_id);
        alert(`Successfully unlocked challenge for ${userId}`);
      } else {
        alert(data.detail || 'Error unlocking challenge');
      }
    } catch (error) {
      console.error('Error unlocking challenge:', error);
      alert('Error unlocking challenge');
    } finally {
      setUnlockingUser(null);
    }
  };

  const handleUnlockAll = async () => {
    if (!confirm('Are you sure you want to unlock this challenge for all users?')) {
      return;
    }

    setUnlockingAll(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:8000/admin/challenges/${challenge.challenge_id}/unlock-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        // Refresh participants list
        await fetchChallengeDetails(challenge.challenge_id);
        alert(`Successfully unlocked challenge for ${data.unlocked_count} users`);
      } else {
        alert(data.detail || 'Error unlocking challenge');
      }
    } catch (error) {
      console.error('Error unlocking all:', error);
      alert('Error unlocking challenge');
    } finally {
      setUnlockingAll(false);
    }
  };

  const iconOptions = [
    { icon: Target, name: 'target' },
    { icon: Activity, name: 'activity' },
    { icon: Leaf, name: 'leaf' },
    { icon: Heart, name: 'heart' },
    { icon: Globe, name: 'globe' },
    { icon: Recycle, name: 'recycle' },
    { icon: User, name: 'user' },
    { icon: Brain, name: 'brain' },
    { icon: BookOpen, name: 'book' },
    { icon: Dumbbell, name: 'dumbbell' },
    { icon: TreePine, name: 'tree' },
    { icon: Zap, name: 'zap' }
  ];
  const categoryOptions = ['fitness', 'environment', 'mindfulness', 'community', 'education', 'health'];
  const difficultyOptions = ['easy', 'medium', 'hard'];

  return (
    <div className="modal-overlay">
      <div className="challenge-modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Challenge' : 'Create New Challenge'}</h2>
          <button className="close-btn" onClick={() => onClose(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button 
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
          {isEditing && (
            <>
              <button 
                className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <BarChart3 size={16} />
                Statistics
              </button>
              <button 
                className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
                onClick={() => setActiveTab('participants')}
              >
                <Users size={16} />
                Participants
              </button>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Challenge ID *</label>
                  <input
                    type="text"
                    value={formData.challenge_id}
                    onChange={(e) => handleInputChange('challenge_id', e.target.value)}
                    placeholder="unique_challenge_id"
                    pattern="^[a-z0-9_]+$"
                    required
                    disabled={isEditing}
                  />
                  <small>Lowercase letters, numbers, and underscores only</small>
                </div>
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-selector">
                    {iconOptions.map(({ icon: IconComponent, name }) => (
                      <button
                        key={name}
                        type="button"
                        className={`icon-option ${formData.icon === name ? 'selected' : ''}`}
                        onClick={() => handleInputChange('icon', name)}
                      >
                        <IconComponent size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Challenge title"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what participants need to do..."
                  maxLength={500}
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  >
                    {difficultyOptions.map(diff => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (days) *</label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => handleInputChange('duration_days', e.target.value)}
                    min={1}
                    max={365}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reward Points *</label>
                  <input
                    type="number"
                    value={formData.reward_points}
                    onChange={(e) => handleInputChange('reward_points', e.target.value)}
                    min={10}
                    max={10000}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Tips for Participants</label>
                {formData.tips.map((tip, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => handleArrayChange('tips', index, e.target.value)}
                      placeholder={`Tip ${index + 1}`}
                    />
                    {formData.tips.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeArrayItem('tips', index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem('tips')}
                >
                  <Plus size={16} />
                  Add Tip
                </button>
              </div>

              <div className="form-group">
                <label>Tags</label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      placeholder={`Tag ${index + 1}`}
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeArrayItem('tags', index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem('tags')}
                >
                  <Plus size={16} />
                  Add Tag
                </button>
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                  placeholder="Internal notes for admins..."
                  rows={3}
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allow_one_skip}
                    onChange={(e) => handleInputChange('allow_one_skip', e.target.checked)}
                  />
                  Allow one skip day
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                  Featured challenge
                </label>
              </div>
            </div>
          )}

          {activeTab === 'stats' && challengeStats && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Participants</h4>
                  <div className="stat-value">{challengeStats.total_participants}</div>
                </div>
                <div className="stat-card">
                  <h4>Active Participants</h4>
                  <div className="stat-value">{challengeStats.active_participants}</div>
                </div>
                <div className="stat-card">
                  <h4>Completion Rate</h4>
                  <div className="stat-value">{challengeStats.completion_rate}%</div>
                </div>
                <div className="stat-card">
                  <h4>Average Streak</h4>
                  <div className="stat-value">{challengeStats.avg_streak} days</div>
                </div>
                <div className="stat-card">
                  <h4>Points Awarded</h4>
                  <div className="stat-value">{challengeStats.total_points_awarded}</div>
                </div>
                <div className="stat-card">
                  <h4>Avg Completion Time</h4>
                  <div className="stat-value">{challengeStats.avg_completion_time} days</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="tab-content">
              <div className="participants-header">
                <h4>Participants ({participants.length})</h4>
                {participants.some(p => p.in_cooldown) && (
                  <button 
                    className="unlock-all-btn"
                    onClick={handleUnlockAll}
                    disabled={unlockingAll}
                  >
                    <Unlock size={16} />
                    {unlockingAll ? 'Unlocking...' : 'Unlock All'}
                  </button>
                )}
              </div>
              {participants.length > 0 ? (
                <div className="participants-list">
                  {participants.map((participant, index) => (
                    <div key={index} className="participant-item">
                      <div className="participant-info">
                        <div className="participant-name">
                          <strong>{participant.user_id}</strong>
                          {participant.in_cooldown && (
                            <span className="lock-badge">
                              <Lock size={12} />
                              Locked {participant.cooldown_days_left} days
                            </span>
                          )}
                          {!participant.in_cooldown && participant.status === 'completed' && (
                            <span className="available-badge">
                              ✅ Available
                            </span>
                          )}
                        </div>
                        <div className="participant-actions">
                          <span className={`status ${participant.status}`}>
                            {participant.status}
                          </span>
                          {participant.in_cooldown && (
                            <button
                              className="unlock-btn"
                              onClick={() => handleUnlockUser(participant.user_id)}
                              disabled={unlockingUser === participant.user_id}
                            >
                              <Unlock size={14} />
                              {unlockingUser === participant.user_id ? 'Unlocking...' : 'Unlock'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="participant-stats">
                        <span>Streak: {participant.current_streak || 0}</span>
                        <span>Started: {new Date(participant.started_at).toLocaleDateString()}</span>
                        {participant.completed_at && (
                          <span>Completed: {new Date(participant.completed_at).toLocaleDateString()}</span>
                        )}
                        {participant.in_cooldown && participant.can_restart_date && (
                          <span>Can restart: {participant.can_restart_date}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-participants">
                  No participants yet
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : (isEditing ? 'Update Challenge' : 'Create Challenge')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeModal;