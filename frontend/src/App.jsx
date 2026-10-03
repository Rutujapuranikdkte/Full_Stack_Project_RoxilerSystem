import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';

export const App = () => {
  const { user, role, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Loading StoreRate Portal...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Unauthenticated view
  if (!user) {
    return (
      <div className="app-container">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        {authView === 'login' ? (
          <LoginPage
            onNavigateRegister={() => setAuthView('register')}
            onToast={addToast}
          />
        ) : (
          <RegisterPage
            onNavigateLogin={() => setAuthView('login')}
            onToast={addToast}
          />
        )}
      </div>
    );
  }

  // Authenticated view with role routing
  return (
    <div className="app-container">
      <Navbar onToast={addToast} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main style={{ flex: 1 }}>
        {role === 'ADMIN' && <AdminDashboard onToast={addToast} />}
        {role === 'OWNER' && <OwnerDashboard onToast={addToast} />}
        {role === 'USER' && <UserDashboard onToast={addToast} />}
      </main>
    </div>
  );
};

export default App;
