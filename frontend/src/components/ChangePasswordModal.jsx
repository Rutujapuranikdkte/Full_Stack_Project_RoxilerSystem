import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import { Check, X, Lock, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const { updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password criteria
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;

  const isValid = hasLength && hasUppercase && hasSpecial && passwordsMatch && oldPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setError('');
    setLoading(true);

    try {
      await updatePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess('Password updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Password">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Current Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showOld ? 'text' : 'password'}
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                color: 'var(--text-muted)'
              }}
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>New Password</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>8-16 chars</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                color: 'var(--text-muted)'
              }}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Validation Checklist */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasLength ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasLength ? <Check size={14} /> : <X size={14} />}
              <span>8 to 16 characters in length</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasUppercase ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasUppercase ? <Check size={14} /> : <X size={14} />}
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasSpecial ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasSpecial ? <Check size={14} /> : <X size={14} />}
              <span>At least one special character (!@#$%^&*...)</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          {confirmPassword && (
            <div style={{ fontSize: '0.8rem', marginTop: '4px', color: passwordsMatch ? 'var(--success)' : 'var(--danger)' }}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
