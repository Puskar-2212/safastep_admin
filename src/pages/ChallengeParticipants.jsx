import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChallengeParticipants.css';

const ChallengeParticipants = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchChallengeDetails();
    fetchParticipants();
  }, [challengeId, statusFilter]);

  const fetchChallengeDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:8000/admin/challenges/${challengeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setChallenge(data.challenge);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await fetch(
        `http://localhost:8000/admin/challenges/${challengeId}/participants?limit=100${statusParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId) => {
    if (!window.confirm(`Unlock this challenge for user ${userId}?`)) {
      return;
    }

    try {
      setUnlocking(userId);
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await fetch(
        `http://localhost:8000/admin/challenges/${challengeId}/unlock`,
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
        alert('Challenge unlocked successfully!');
        fetchParticipants(); // Refresh the list
      } else {
        alert('Failed to unlock challenge');
      }
    } catch (error) {
      console.error('Error unlocking challenge:', error);
      alert('Error unlocking challenge');
    } finally {
      setUnlocking(null);
    }
  };

  const handleUnlockAll = async () => {
    const lockedCount = participants.filter(p => p.in_cooldown).length;
    if (lockedCount === 0) {
      alert('No locked users to unlock');
      return;
    }

    if (!window.confirm(`Unlock this challenge for all ${lockedCount} locked users?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:8000/admin/challenges/${challengeId}/unlock-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchParticipants(); // Refresh the list
      } else {
        alert('Failed to unlock challenges');
      }
    } catch (error) {
      console.error('Error unlocking all:', error);
      alert('Error unlocking challenges');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'in_progress': { label: 'In Progress', color: '#3b82f6' },
      'completed': { label: 'Completed', color: '#10b981' },
      'claimed': { label: 'Claimed', color: '#8b5cf6' },
      'failed': { label: 'Failed', color: '#ef4444' }
    };
    const badge = badges[status] || { label: status, color: '#6b7280' };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: badge.color + '20',
        color: badge.color
      }}>
        {badge.label}
      </span>
    );
  };

  const lockedCount = participants.filter(p => p.in_cooldown).length;

  return (
    <div className="challenge-participants-container">
      <div className="participants-header">
        <button className="back-button" onClick={() => navigate('/challenges')}>
          ← Back to Challenges
        </button>
        
        {challenge && (
          <div className="challenge-info">
            <h1>{challenge.title}</h1>
            <p>{challenge.description}</p>
            <div className="challenge-stats">
              <div className="stat-item">
                <span className="stat-label">Total Participants</span>
                <span className="stat-value">{participants.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Locked Users</span>
                <span className="stat-value locked">{lockedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completion Rate</span>
                <span className="stat-value">{challenge.stats?.completion_rate || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="participants-controls">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="claimed">Claimed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {lockedCount > 0 && (
          <button className="unlock-all-button" onClick={handleUnlockAll}>
            🔓 Unlock All ({lockedCount} users)
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading participants...</div>
      ) : (
        <div className="participants-table-container">
          <table className="participants-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Status</th>
                <th>Streak</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Lock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No participants found
                  </td>
                </tr>
              ) : (
                participants.map((participant) => (
                  <tr key={participant._id}>
                    <td className="user-id">{participant.user_id}</td>
                    <td>{getStatusBadge(participant.status)}</td>
                    <td>{participant.current_streak || 0} days</td>
                    <td>{participant.started_at ? new Date(participant.started_at).toLocaleDateString() : '-'}</td>
                    <td>{participant.completed_at ? new Date(participant.completed_at).toLocaleDateString() : '-'}</td>
                    <td>
                      {participant.in_cooldown ? (
                        <span className="lock-status locked">
                          🔒 Locked ({participant.cooldown_days_left} days left)
                        </span>
                      ) : participant.status === 'claimed' || participant.status === 'completed' ? (
                        <span className="lock-status unlocked">
                          ✅ Available
                        </span>
                      ) : (
                        <span className="lock-status">-</span>
                      )}
                    </td>
                    <td>
                      {participant.in_cooldown && (
                        <button
                          className="unlock-button"
                          onClick={() => handleUnlockUser(participant.user_id)}
                          disabled={unlocking === participant.user_id}
                        >
                          {unlocking === participant.user_id ? 'Unlocking...' : '🔓 Unlock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChallengeParticipants;
