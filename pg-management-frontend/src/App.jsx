import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import GuestDashboard from './components/GuestDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, dashboard
  const [init, setInit] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setView('dashboard');
      } catch (e) {
        console.error(e);
        localStorage.removeItem('user');
      }
    }
    setInit(false);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  if (init) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '15px' }}>
        <div style={{
          width: '45px',
          height: '45px',
          border: '3px solid rgba(168, 85, 247, 0.2)',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite'
        }} />
        <p style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: '0.05em' }}>BOOTSTRAPPING SYSTEM...</p>
      </div>
    );
  }

  return (
    <>
      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onToggleRegister={() => setView('register')} 
        />
      )}
      
      {view === 'register' && (
        <Register 
          onBackToLogin={() => setView('login')} 
        />
      )}

      {view === 'dashboard' && user && (
        user.role === 'ROLE_ADMIN' ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <GuestDashboard user={user} onLogout={handleLogout} />
        )
      )}
    </>
  );
}

export default App;
