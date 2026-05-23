import React, { useEffect, useState } from 'react';
import API from '../api';
import {
  Shield, LogOut, Home, Key, Layers, Users, Plus, Trash2,
  UserCheck, UserMinus, DollarSign, MapPin, AlertCircle, RefreshCw
} from 'lucide-react';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, pgs, categories, rooms, guests

  // Data lists
  const [pgs, setPgs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);

  // Loaders & Errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [newPg, setNewPg] = useState({ name: '', location: '' });
  const [newCategory, setNewCategory] = useState('');
  const [newRoom, setNewRoom] = useState({ roomNumber: '', pgId: '', categoryId: '', rent: '' });

  // Member Assignment Modal state
  const [assignModal, setAssignModal] = useState({ open: false, guestId: null, guestName: '' });
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const refreshData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pgsRes, catRes, roomRes, guestRes] = await Promise.all([
        API.get('/admin/pgs'),
        API.get('/admin/categories'),
        API.get('/admin/rooms'),
        API.get('/admin/guests')
      ]);
      setPgs(pgsRes.data);
      setCategories(catRes.data);
      setRooms(roomRes.data);
      setGuests(guestRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from backend. Check API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Timed success notifications
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // handlers
  const handleAddPg = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.post('/admin/pgs', newPg);
      setPgs([...pgs, response.data]);
      setNewPg({ name: '', location: '' });
      triggerSuccess('PG added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add PG');
    }
  };

  const handleDeletePg = async (id) => {
    if (!window.confirm('Are you sure? Deleting this PG will delete all its rooms and unassign all associated members.')) return;
    setError('');
    try {
      await API.delete(`/admin/pgs/${id}`);
      setPgs(pgs.filter(p => p.id !== id));
      // Refresh to reflect unassigned guests & deleted rooms
      refreshData();
      triggerSuccess('PG deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete PG');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.post('/admin/categories', { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory('');
      triggerSuccess('Room category added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Deleting this category will delete all associated rooms and unassign occupants. Continue?')) return;
    setError('');
    try {
      await API.delete(`/admin/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      refreshData();
      triggerSuccess('Category deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError('');

    // validate
    if (!newRoom.pgId || !newRoom.categoryId || !newRoom.rent || !newRoom.roomNumber) {
      setError('Please fill in all room fields');
      return;
    }

    try {
      const response = await API.post('/admin/rooms', {
        roomNumber: newRoom.roomNumber,
        pgId: parseInt(newRoom.pgId),
        categoryId: parseInt(newRoom.categoryId),
        rent: parseFloat(newRoom.rent)
      });
      setRooms([...rooms, response.data]);
      setNewRoom({ roomNumber: '', pgId: '', categoryId: '', rent: '' });
      triggerSuccess('Room created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Deletetion will unassign any occupant. Proceed?')) return;
    setError('');
    try {
      await API.delete(`/admin/rooms/${id}`);
      setRooms(rooms.filter(r => r.id !== id));
      refreshData();
      triggerSuccess('Room deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleToggleRent = async (guestId) => {
    setError('');
    try {
      const response = await API.post(`/admin/toggle-rent/${guestId}`);
      setGuests(guests.map(g => g.id === guestId ? response.data : g));
      triggerSuccess('Rent status updated!');
    } catch (err) {
      setError('Failed to update rent status');
    }
  };

  const handleRemoveMember = async (guestId) => {
    if (!window.confirm('Are you sure you want to remove this member from the PG room?')) return;
    setError('');
    try {
      await API.post(`/admin/remove-member/${guestId}`);
      triggerSuccess('Member removed from room');
      refreshData();
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  const openAssignModal = (guest) => {
    setAssignModal({ open: true, guestId: guest.id, guestName: guest.name });
    setSelectedRoomId('');
  };

  const handleAssignRoom = async () => {
    if (!selectedRoomId) return;
    setError('');
    try {
      await API.post('/admin/assign-room', {
        guestId: assignModal.guestId,
        roomId: parseInt(selectedRoomId)
      });
      setAssignModal({ open: false, guestId: null, guestName: '' });
      triggerSuccess('Room assigned successfully!');
      refreshData();
    } catch (err) {
      setError('Failed to assign room');
    }
  };

  // Stats Calculations
  const activeRooms = rooms.length;
  const totalPgs = pgs.length;
  const totalGuests = guests.length;
  const assignedGuests = guests.filter(g => g.room != null).length;
  const rentCollected = guests
    .filter(g => g.room != null && g.rentPaid)
    .reduce((sum, g) => sum + g.room.rent, 0);

  return (
    <div className="app-container">
      <header className="header-glass">
        <div className="logo-container">
          <Shield size={22} style={{ color: '#a855f7' }} />
          <span>PG Admin Console - Divyaraj Dodiya</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            System Administrator
          </span>
          <button
            onClick={refreshData}
            className="btn-secondary"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh database data"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onLogout}
            className="btn-danger"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      <main style={{ padding: '30px max(16px, 3%)', flex: 1 }}>

        {/* Success/Error banners */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}>
            {successMsg}
          </div>
        )}

        {/* Tab Controls */}
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'pgs' ? 'active' : ''}`} onClick={() => setActiveTab('pgs')}>PGs</button>
          <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Room Categories</button>
          <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms</button>
          <button className={`tab-btn ${activeTab === 'guests' ? 'active' : ''}`} onClick={() => setActiveTab('guests')}>PG Members</button>
        </div>

        {/* View Content */}

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="dashboard-grid">

              <div className="glass-card stats-card">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>PG Properties</span>
                  <div className="stats-number">{totalPgs}</div>
                </div>
                <div className="stats-icon-wrapper">
                  <Home size={24} />
                </div>
              </div>

              <div className="glass-card stats-card">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Rooms</span>
                  <div className="stats-number">{activeRooms}</div>
                </div>
                <div className="stats-icon-wrapper" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                  <Key size={24} />
                </div>
              </div>

              <div className="glass-card stats-card">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assigned Members</span>
                  <div className="stats-number">{assignedGuests} / {totalGuests}</div>
                </div>
                <div className="stats-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                  <Users size={24} />
                </div>
              </div>

              <div className="glass-card stats-card">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rent Collected (Month)</span>
                  <div className="stats-number">₹{rentCollected}</div>
                </div>
                <div className="stats-icon-wrapper" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                  <DollarSign size={24} />
                </div>
              </div>

            </div>

            <div className="glass-card" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '16px' }}>PG Administrator Actions Quickstart</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <h4 style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Home size={18} /> 1. Define PG
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Navigate to the <strong>PGs</strong> tab to register PG accommodations with name and city/area location.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <h4 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Layers size={18} /> 2. Master Types
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Define Room Categories (e.g. Single AC, Double Non-AC) in the <strong>Room Categories</strong> tab.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Key size={18} /> 3. Add Rooms
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Add room numbers under a PG, select category types, and set the rent pricing.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <h4 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={18} /> 4. Allocate Guests
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Assign guests to specific rooms, unassign them, and track/toggle their monthly rent paid status.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 2. PGS MANAGEMENT */}
        {activeTab === 'pgs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

            {/* Create PG */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Add New PG Accommodation
              </h3>
              <form onSubmit={handleAddPg} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                  <label className="form-label">PG Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Greenwood Premium PG"
                    value={newPg.name}
                    onChange={(e) => setNewPg({ ...newPg, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                  <label className="form-label">Location (City / Area)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Sector 62, Noida"
                    value={newPg.location}
                    onChange={(e) => setNewPg({ ...newPg, location: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>Add PG</button>
              </form>
            </div>

            {/* List PGs */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px' }}>PG List ({pgs.length})</h3>
              {pgs.length === 0 ? (
                <p style={{ color: '#64748b' }}>No PG properties registered. Add one above.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>PG Name</th>
                        <th>Location</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pgs.map(pg => (
                        <tr key={pg.id}>
                          <td>{pg.id}</td>
                          <td><strong>{pg.name}</strong></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                              <MapPin size={14} style={{ color: '#3b82f6' }} />
                              <span>{pg.location}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeletePg(pg.id)}
                              className="btn-danger"
                              style={{ padding: '6px 12px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

            {/* Create Category */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Room Category (Master List)
              </h3>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Single AC, Double Non-AC, Deluxe AC Suite"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>Add Category</button>
              </form>
            </div>

            {/* List Categories */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px' }}>Master Room Category List ({categories.length})</h3>
              {categories.length === 0 ? (
                <p style={{ color: '#64748b' }}>No room categories defined yet.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category Name</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id}>
                          <td>{cat.id}</td>
                          <td><strong>{cat.name}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="btn-danger"
                              style={{ padding: '6px 12px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. ROOMS MANAGEMENT */}
        {activeTab === 'rooms' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

            {/* Create Room */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Room to PG
              </h3>
              <form onSubmit={handleAddRoom} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select PG</label>
                  <select
                    className="form-select"
                    value={newRoom.pgId}
                    onChange={(e) => setNewRoom({ ...newRoom, pgId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose PG --</option>
                    {pgs.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Room Category Type</label>
                  <select
                    className="form-select"
                    value={newRoom.categoryId}
                    onChange={(e) => setNewRoom({ ...newRoom, categoryId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 101"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 6500"
                    value={newRoom.rent}
                    onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '12px 24px', height: 'fit-content' }}>Create Room</button>
              </form>
            </div>

            {/* List Rooms */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px' }}>Room Inventory ({rooms.length})</h3>
              {rooms.length === 0 ? (
                <p style={{ color: '#64748b' }}>No rooms registered in the database.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Room Number</th>
                        <th>PG Property</th>
                        <th>Category Type</th>
                        <th>Monthly Rent</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(room => (
                        <tr key={room.id}>
                          <td>{room.id}</td>
                          <td><strong style={{ fontSize: '1.1rem' }}>Room {room.roomNumber}</strong></td>
                          <td>{room.pg.name} ({room.pg.location})</td>
                          <td><span className="badge badge-warning">{room.roomCategory.name}</span></td>
                          <td><strong>₹{room.rent}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="btn-danger"
                              style={{ padding: '6px 12px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 5. GUEST MEMBERS ASSIGNMENT & RENT */}
        {activeTab === 'guests' && (
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>PG Guest Registry ({guests.length})</h3>
            {guests.length === 0 ? (
              <p style={{ color: '#64748b' }}>No guest accounts registered manually yet.</p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Member Details</th>
                      <th>Allocated Accommodation</th>
                      <th>Monthly Rent</th>
                      <th>Rent Status</th>
                      <th style={{ textAlign: 'right' }}>Management Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map(guest => {
                      const hasRoom = guest.room != null;
                      return (
                        <tr key={guest.id}>
                          <td>{guest.id}</td>
                          <td>
                            <div>
                              <strong>{guest.name}</strong>
                              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                                {guest.email} {guest.phone ? `| ${guest.phone}` : ''}
                              </div>
                            </div>
                          </td>
                          <td>
                            {hasRoom ? (
                              <div>
                                <span style={{ color: '#f8fafc', fontWeight: '500' }}>
                                  Room {guest.room.roomNumber}
                                </span>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                  {guest.room.pg.name} ({guest.room.pg.location})
                                </div>
                              </div>
                            ) : (
                              <span className="badge badge-warning">Unassigned / Pending</span>
                            )}
                          </td>
                          <td>
                            {hasRoom ? (
                              <strong>₹{guest.room.rent}</strong>
                            ) : (
                              <span style={{ color: '#64748b' }}>-</span>
                            )}
                          </td>
                          <td>
                            {hasRoom ? (
                              <button
                                onClick={() => handleToggleRent(guest.id)}
                                className={`badge ${guest.rentPaid ? 'badge-success' : 'badge-danger'}`}
                                style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                                title="Click to toggle payment status"
                              >
                                {guest.rentPaid ? 'PAID' : 'UNPAID'}
                              </button>
                            ) : (
                              <span style={{ color: '#64748b' }}>-</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              {hasRoom ? (
                                <button
                                  onClick={() => handleRemoveMember(guest.id)}
                                  className="btn-secondary"
                                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                                >
                                  <UserMinus size={14} /> Remove Member
                                </button>
                              ) : (
                                <button
                                  onClick={() => openAssignModal(guest)}
                                  className="btn-primary"
                                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', boxShadow: 'none' }}
                                >
                                  <UserCheck size={14} /> Assign Room
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Allocation Modal */}
      {assignModal.open && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '16px' }}>Assign Room to {assignModal.guestName}</h3>

            <div className="form-group">
              <label className="form-label">Choose Room</label>
              <select
                className="form-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
              >
                <option value="">-- Choose Available PG Room --</option>
                {rooms.map(room => {
                  // Find if room is already occupied (optional helper text)
                  const isOccupied = guests.some(g => g.room && g.room.id === room.id);
                  return (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.pg.name} ({room.roomCategory.name} - ₹{room.rent}) {isOccupied ? '[Occupied]' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setAssignModal({ open: false, guestId: null, guestName: '' })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRoom}
                className="btn-primary"
                disabled={!selectedRoomId}
              >
                Assign Room
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
