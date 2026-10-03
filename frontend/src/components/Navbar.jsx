import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Star, LogOut, KeyRound, User as UserIcon, Shield, Store, Sparkles } from 'lucide-react';

export const Navbar = ({ onToast }) => {
  const { user, role, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge badge-admin">
            <Shield size={12} /> Admin
          </span>
        );
      case 'OWNER':
        return (
          <span className="badge badge-owner">
            <Store size={12} /> Store Owner
          </span>
        );
      default:
        return (
          <span className="badge badge-user">
            <UserIcon size={12} /> User
          </span>
        );
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Brand */}
          <div className="brand-logo">
            <div className="brand-icon">
              <Star size={20} fill="#ffffff" />
            </div>
            <span>Store<span style={{ color: '#818cf8' }}>Rate</span></span>
          </div>

          {/* User actions */}
          {user ? (
            <div className="navbar-actions">
              <div className="user-profile-badge">
                <span className="user-name-text" title={user.name}>{user.name}</span>
                {getRoleBadge()}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPasswordModal(true)}
                title="Change Password"
              >
                <KeyRound size={15} />
                <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>Password</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="navbar-actions">
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Store Rating Platform</span>
            </div>
          )}
        </div>
      </header>

      {/* Change Password Modal */}
      {user && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => onToast && onToast(msg, 'success')}
        />
      )}
    </>
  );
};
