import React, { useState } from 'react';
import API from '../api';
import { LogIn, Mail, Lock, Shield, User } from 'lucide-react';

const Login = ({ onLoginSuccess, onToggleRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState('GUEST'); // 'GUEST' or 'ADMIN'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      const user = response.data;
      
      // Basic security check: if role doesn't match the tab we selected
      if (roleType === 'ADMIN' && user.role !== 'ROLE_ADMIN') {
        setError('Unauthorized: You do not have administrator privileges');
        setLoading(false);
        return;
      }
      if (roleType === 'GUEST' && user.role !== 'ROLE_GUEST') {
        setError('Unauthorized: Please use Admin Login tab for administrator accounts');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-container flex-center" style={{ marginBottom: '8px' }}>
            <LogIn size={28} style={{ color: '#a855f7' }} />
            <span>PG Management</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Secure portal for Paying Guests & Administrators
          </p>
        </div>

        <div className="auth-tabs">
          <div 
            className={`auth-tab ${roleType === 'GUEST' ? 'active' : ''}`}
            onClick={() => { setRoleType('GUEST'); setError(''); }}
          >
            <User size={16} style={{ marginRight: '6px', display: 'inline' }} />
            Guest Login
          </div>
          <div 
            className={`auth-tab ${roleType === 'ADMIN' ? 'active' : ''}`}
            onClick={() => { setRoleType('ADMIN'); setError(''); }}
          >
            <Shield size={16} style={{ marginRight: '6px', display: 'inline' }} />
            Admin Login
          </div>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label flex-between">
              <span>Email Address</span>
              <Mail size={14} />
            </label>
            <input
              type="email"
              className="form-input"
              placeholder={roleType === 'ADMIN' ? 'admin@pg.com' : 'your.email@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label flex-between">
              <span>Password</span>
              <Lock size={14} />
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex-center">
                <span className="loading-spinner" /> Signing in...
              </span>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        {roleType === 'GUEST' && (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: '#94a3b8' }}>Don't have a guest account? </span>
            <button 
              onClick={onToggleRegister}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#a855f7', 
                fontWeight: '600', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
