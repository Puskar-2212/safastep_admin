import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Pin, MapPin, Calendar, Eye } from 'lucide-react';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    postType: 'news',
    imageUrl: '',
    linkedLocationId: '',
    eventDate: '',
    eventTime: '',
    externalLink: '',
    isPinned: false
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchLocations();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/admin/announcements?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:8000/eco-locations?limit=100');
      const data = await response.json();
      if (data.success) {
        console.log('Fetched locations:', data.locations); // Debug log
        setLocations(data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingAnnouncement
        ? `http://localhost:8000/admin/announcements/${editingAnnouncement._id}`
        : 'http://localhost:8000/admin/announcements';
      
      // Clean up form data - remove empty strings and convert to null
      const cleanedData = {
        title: formData.title,
        description: formData.description,
        postType: formData.postType,
        linkedLocationId: formData.linkedLocationId && formData.linkedLocationId.trim() !== '' ? formData.linkedLocationId : null,
        imageUrl: formData.imageUrl && formData.imageUrl.trim() !== '' ? formData.imageUrl : null,
        externalLink: formData.externalLink && formData.externalLink.trim() !== '' ? formData.externalLink : null,
        eventDate: formData.eventDate && formData.eventDate.trim() !== '' ? formData.eventDate : null,
        eventTime: formData.eventTime && formData.eventTime.trim() !== '' ? formData.eventTime : null,
        isPinned: formData.isPinned
      };
      
      console.log('Sending announcement data:', cleanedData);
      
      const response = await fetch(url, {
        method: editingAnnouncement ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingAnnouncement ? 'Announcement updated!' : 'Announcement created!');
        setShowModal(false);
        resetForm();
        fetchAnnouncements();
      } else {
        console.error('Server error:', data);
        alert(`Error: ${data.detail || 'Failed to save announcement'}`);
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Announcement deleted');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/admin/announcements/${id}/pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      postType: announcement.postType,
      imageUrl: announcement.imageUrl || '',
      linkedLocationId: announcement.linkedLocationId || '',
      eventDate: announcement.eventDate || '',
      eventTime: announcement.eventTime || '',
      externalLink: announcement.externalLink || '',
      isPinned: announcement.isPinned || false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      postType: 'news',
      imageUrl: '',
      linkedLocationId: '',
      eventDate: '',
      eventTime: '',
      externalLink: '',
      isPinned: false
    });
    setEditingAnnouncement(null);
  };

  const getPostTypeLabel = (type) => {
    const types = {
      news: 'News',
      event: 'Event',
      tip: 'Tip',
      alert: 'Alert'
    };
    return types[type] || type;
  };

  const getPostTypeColor = (type) => {
    const colors = {
      news: '#3b82f6',
      event: '#22c55e',
      tip: '#f59e0b',
      alert: '#ef4444'
    };
    return colors[type] || '#8b5cf6';
  };

  return (
    <div className="announcements-page">
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>Create and manage admin announcements</p>
        </div>
        <button className="create-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} />
          Create Announcement
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="empty-state">
          <p>No announcements yet</p>
          <button className="create-btn" onClick={() => { resetForm(); setShowModal(true); }}>
            Create First Announcement
          </button>
        </div>
      ) : (
        <div className="announcements-grid">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-card">
              {announcement.isPinned && (
                <div className="pinned-badge">
                  <Pin size={14} />
                  Pinned
                </div>
              )}
              
              <div className="announcement-header">
                <span 
                  className="post-type-badge"
                  style={{ backgroundColor: `${getPostTypeColor(announcement.postType)}20`, color: getPostTypeColor(announcement.postType) }}
                >
                  {getPostTypeLabel(announcement.postType)}
                </span>
                <div className="announcement-actions">
                  <button onClick={() => handleTogglePin(announcement._id)} title={announcement.isPinned ? 'Unpin' : 'Pin'}>
                    <Pin size={16} />
                  </button>
                  <button onClick={() => handleEdit(announcement)}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(announcement._id)} className="delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{announcement.title}</h3>
              <p className="description">{announcement.description}</p>

              {announcement.linkedLocation && (
                <div className="location-info">
                  <MapPin size={14} />
                  <span>{announcement.linkedLocation.name}</span>
                </div>
              )}

              {announcement.eventDate && (
                <div className="event-info">
                  <Calendar size={14} />
                  <span>{announcement.eventDate} {announcement.eventTime && `at ${announcement.eventTime}`}</span>
                </div>
              )}

              <div className="announcement-footer">
                <div className="views">
                  <Eye size={14} />
                  {announcement.views || 0} views
                </div>
                <div className="created-date">
                  {new Date(announcement.createdAt * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-scroll-area">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Enter announcement title"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Enter announcement description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Post Type *</label>
                    <select
                      value={formData.postType}
                      onChange={(e) => setFormData({...formData, postType: e.target.value})}
                    >
                      <option value="news">News</option>
                      <option value="event">Event</option>
                      <option value="tip">Tip</option>
                      <option value="alert">Alert</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Link to Location (Optional)</label>
                    <select
                      value={formData.linkedLocationId || ''}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        console.log('Raw selected value:', selectedValue);
                        console.log('All locations:', locations);
                        setFormData({...formData, linkedLocationId: selectedValue});
                      }}
                    >
                      <option value="">None</option>
                      {locations.map((loc) => {
                        console.log('Location option:', loc);
                        return (
                          <option key={loc._id || loc.id} value={loc._id || loc.id}>
                            {loc.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {formData.postType === 'event' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date</label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Event Time</label>
                      <input
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => setFormData({...formData, eventTime: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Image URL (Optional - for banner/poster)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>External Link (Optional - for registration/details)</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => setFormData({...formData, externalLink: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                    />
                    Pin to top of feed
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  {editingAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
