import React, { useEffect, useState } from 'react';
import API from '../api';
import { LogOut, Home, DollarSign, Calendar, MapPin, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const GuestDashboard = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/guest/dashboard');
      setProfile(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="app-container">
      <header className="header-glass">
        <div className="logo-container">
          <Home size={22} style={{ color: '#a855f7' }} />
          <span>PG Guest Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Welcome, <strong>{user.name}</strong>
          </span>
          <button 
            onClick={fetchDashboardData}
            className="btn-secondary"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh dashboard data"
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

      <main style={{ padding: '40px max(24px, 4%)', flex: 1 }}>
        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(168, 85, 247, 0.2)',
              borderTopColor: '#a855f7',
              borderRadius: '50%',
              animation: 'spin-slow 1s linear infinite'
            }} />
            <p style={{ color: '#94a3b8' }}>Loading dashboard details...</p>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto', borderColor: '#ef4444' }}>
            <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
            <h3>Error Loading Dashboard</h3>
            <p style={{ color: '#94a3b8', margin: '8px 0 20px' }}>{error}</p>
            <button onClick={fetchDashboardData} className="btn-primary">Try Again</button>
          </div>
        ) : profile ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {profile.room ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Rent Status Banner */}
                <div 
                  className="glass-card"
                  style={{
                    background: profile.rentPaid 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(22, 19, 38, 0.65) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(22, 19, 38, 0.65) 100%)',
                    borderColor: profile.rentPaid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <div>
                    <span 
                      className={`badge ${profile.rentPaid ? 'badge-success' : 'badge-danger'}`}
                      style={{ fontSize: '0.85rem', padding: '6px 12px', marginBottom: '12px' }}
                    >
                      {profile.rentPaid ? 'RENT PAID' : 'RENT UNPAID'}
                    </span>
                    <h2>
                      {profile.rentPaid 
                        ? 'Your rent for the current month is settled.' 
                        : 'Your rent for the current month is outstanding.'}
                    </h2>
                    <p style={{ color: '#94a3b8', marginTop: '6px' }}>
                      {profile.rentPaid 
                        ? 'Thank you! The administrator has verified your payment.' 
                        : 'Please pay the due amount to the administrator to update your status.'}
                    </p>
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: profile.rentPaid ? '#10b981' : '#ef4444' }}>
                    ₹{profile.room.rent}
                  </div>
                </div>

                {/* Grid info details */}
                <div className="dashboard-grid">
                  
                  {/* PG info card */}
                  <div className="glass-card">
                    <div style={{ color: '#a855f7', marginBottom: '16px' }} className="flex-between">
                      <h3>Paying Guest (PG) Details</h3>
                      <Home size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>PG Name</span>
                        <h2 style={{ fontSize: '1.4rem', marginTop: '2px' }}>{profile.room.pg.name}</h2>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.95rem' }}>
                        <MapPin size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                        <span>{profile.room.pg.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Details Card */}
                  <div className="glass-card">
                    <div style={{ color: '#3b82f6', marginBottom: '16px' }} className="flex-between">
                      <h3>Room Assignment</h3>
                      <Calendar size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Room Number</span>
                        <h2 style={{ fontSize: '1.4rem', marginTop: '2px' }}>{profile.room.roomNumber}</h2>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Room Category</span>
                        <p style={{ color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
                          {profile.room.roomCategory.name}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Support Card */}
                <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Need Help or Noticed an Error?</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                    If you have already paid your rent but it still shows as unpaid, or if you wish to change rooms, 
                    please contact your PG Administrator at <strong>admin@pg.com</strong>.
                  </p>
                </div>

              </div>
            ) : (
              // Unassigned Guest State
              <div 
                className="glass-card" 
                style={{ 
                  textAlign: 'center', 
                  maxWidth: '600px', 
                  margin: '40px auto', 
                  padding: '40px 30px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <AlertTriangle size={32} />
                </div>
                <h2>Pending PG Allocation</h2>
                <p style={{ color: '#94a3b8', margin: '12px 0 24px', lineHeight: '1.6' }}>
                  Hello <strong>{profile.name}</strong>, your account has been registered successfully. 
                  However, the administrator has not yet assigned you to a PG or a specific Room. 
                  Once you are allocated a room, your PG location and rent details will appear here.
                </p>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--card-border)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#64748b' }}>Registered Email:</span> <strong style={{ color: '#f8fafc' }}>{profile.email}</strong>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default GuestDashboard;
