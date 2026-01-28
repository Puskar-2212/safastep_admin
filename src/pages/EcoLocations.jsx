import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './EcoLocations.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
const MapClickHandler = ({ onMapClick, isActive }) => {
  useMapEvents({
    click(e) {
      if (isActive) {
        onMapClick(e);
      }
    },
  });
  return null;
};

const EcoLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    category: 'urban-park',
    address: '',
  });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);
  const modalRef = useRef(null);
  const itemsPerPage = 10;

  // Kathmandu Valley bounds
  const kathmandiBounds = L.latLngBounds(
    [27.6, 85.2],  // Southwest
    [27.85, 85.5]  // Northeast
  );

  useEffect(() => {
    fetchLocations();
  }, [currentPage]);

  useEffect(() => {
    // Fit map to Kathmandu Valley bounds on mount
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.fitBounds(kathmandiBounds, { padding: [50, 50] });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const skip = currentPage * itemsPerPage;
      const response = await fetch(
        `http://localhost:8000/admin/eco-locations?skip=${skip}&limit=${itemsPerPage}`
      );
      const data = await response.json();

      if (data.success) {
        setLocations(data.locations);
        setTotalLocations(data.total);
      }
    } catch (error) {
      console.error('Error fetching eco-locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setCurrentPage(0);
      fetchLocations();
      return;
    }

    try {
      setLoading(true);
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch(
        `http://localhost:8000/admin/eco-locations/search?query=${encodeURIComponent(searchQuery)}&skip=0&limit=${itemsPerPage}`
      );
      const data = await response.json();

      if (data.success) {
        setLocations(data.locations);
        setTotalLocations(data.total);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error searching eco-locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/admin/eco-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          category: formData.category,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Eco-location added successfully');
        setFormData({
          name: '',
          description: '',
          latitude: '',
          longitude: '',
          category: 'urban-park',
          address: '',
        });
        setShowForm(false);
        fetchLocations();
      } else {
        alert('Failed to add eco-location');
      }
    } catch (error) {
      console.error('Error adding eco-location:', error);
      alert('Error adding eco-location');
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location._id);
    setFormData({
      name: location.name,
      description: location.description,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      category: location.category,
      address: location.address,
    });
    setShowForm(true);
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8000/admin/eco-locations/${editingLocation}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            category: formData.category,
            address: formData.address,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Eco-location updated successfully');
        setFormData({
          name: '',
          description: '',
          latitude: '',
          longitude: '',
          category: 'park',
          address: '',
        });
        setEditingLocation(null);
        setShowForm(false);
        fetchLocations();
      } else {
        alert('Failed to update eco-location');
      }
    } catch (error) {
      console.error('Error updating eco-location:', error);
      alert('Error updating eco-location');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this eco-location?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/admin/eco-locations/${locationId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        alert('Eco-location deleted successfully');
        fetchLocations();
      } else {
        alert('Failed to delete eco-location');
      }
    } catch (error) {
      console.error('Error deleting eco-location:', error);
      alert('Error deleting eco-location');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      category: 'urban-park',
      address: '',
    });
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.form-header')) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && modalRef.current) {
      setModalPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const totalPages = Math.ceil(totalLocations / itemsPerPage);

  const categoryColors = {
    'urban-park': '#16a34a',
    'botanical-garden': '#059669',
    'forest-reserve': '#047857',
    'community-space': '#0891b2',
    'other': '#6b7280',
  };

  return (
    <div className="eco-locations-page">
      <div className="page-header">
        <h1>Eco-Locations Management</h1>
        <p>Manage eco-friendly locations on the map</p>
      </div>

      {/* Search and Add Button */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, category, or address..."
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
                fetchLocations();
              }}
            >
              Clear
            </button>
          )}
        </form>
        <button
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          <span>Add Location</span>
        </button>
      </div>

      <div className="content-wrapper">
        {/* Map */}
        <div className="map-section">
          <div className="map-controls">
            <button
              className={`map-type-btn ${mapType === 'standard' ? 'active' : ''}`}
              onClick={() => setMapType('standard')}
            >
              🗺️ Standard
            </button>
            <button
              className={`map-type-btn ${mapType === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapType('satellite')}
            >
              🛰️ Satellite
            </button>
            <button
              className={`map-type-btn ${mapType === 'hybrid' ? 'active' : ''}`}
              onClick={() => setMapType('hybrid')}
            >
              🛣️ Hybrid
            </button>
          </div>
          <MapContainer
            center={[27.7172, 85.3240]}
            zoom={14}
            className="map-container"
            ref={mapRef}
            maxBounds={kathmandiBounds}
            maxBoundsViscosity={1.0}
            minZoom={12}
            maxZoom={18}
          >
            <MapClickHandler onMapClick={handleMapClick} isActive={showForm} />
            {mapType === 'standard' && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
            )}
            {mapType === 'satellite' && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
              />
            )}
            {mapType === 'hybrid' && (
              <>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; Esri'
                />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                  opacity={0.4}
                />
              </>
            )}
            {locations.map((location) => (
              <Marker
                key={location._id}
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{location.name}</h4>
                    <p className="category-badge" style={{ color: categoryColors[location.category] }}>
                      {location.category}
                    </p>
                    <p>{location.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {showForm && (
            <div className="map-hint">
              Click on map to set coordinates
            </div>
          )}
        </div>

        {/* Locations List */}
        <div className="list-section">
          {loading ? (
            <div className="loading">Loading eco-locations...</div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <p>No eco-locations found</p>
            </div>
          ) : (
            <>
              <div className="locations-list">
                {locations.map((location) => (
                  <div key={location._id} className="location-card">
                    <div className="location-header">
                      <h3>{location.name}</h3>
                      <span
                        className="category-badge"
                        style={{ backgroundColor: categoryColors[location.category] }}
                      >
                        {location.category}
                      </span>
                    </div>
                    <p className="location-description">{location.description}</p>
                    <p className="location-address"> {location.address}</p>
                    <p className="location-coords">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                    <div className="location-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditLocation(location)}
                      >
                        <Edit2 size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteLocation(location._id)}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="form-modal-overlay" onClick={handleCloseForm}>
          <div
            className="form-modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            style={{
              position: 'fixed',
              left: `${modalPosition.x}px`,
              top: `${modalPosition.y}px`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            <div className="form-header">
              <h2>{editingLocation ? 'Edit Eco-Location' : 'Add New Eco-Location'}</h2>
              <button className="form-close" onClick={handleCloseForm}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation}>
              <div className="form-group">
                <label>Location Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Shivapuri National Park"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe the eco-location..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude * (or click map)</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleFormChange}
                    placeholder="27.7172"
                    step="0.0001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitude * (or click map)</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleFormChange}
                    placeholder="85.3240"
                    step="0.0001"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                >
                  <option value="urban-park">Urban Park</option>
                  <option value="botanical-garden">Botanical Garden</option>
                  <option value="forest-reserve">Forest Reserve</option>
                  <option value="community-space">Community Space</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Full address"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCloseForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoLocations;
