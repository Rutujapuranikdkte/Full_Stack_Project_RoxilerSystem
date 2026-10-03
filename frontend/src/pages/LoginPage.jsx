import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Store, Sparkles, Eye, EyeOff } from 'lucide-react';

export const LoginPage = ({ onNavigateRegister, onToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      if (onToast) onToast('Welcome back! Logged in successfully.', 'success');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '36px 32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '16px'
          }}>
            <Star size={28} fill="#ffffff" color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>StoreRate Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Single unified login for Admins, Users, and Store Owners
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            QUICK DEMO ACCOUNTS (1-CLICK FILL):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemo('admin@storerating.com', 'Admin@123')}
              style={{ fontSize: '0.75rem', padding: '6px 4px' }}
            >
              <ShieldCheck size={13} style={{ color: '#c084fc' }} /> Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemo('marcus.owner@storerating.com', 'Owner@123')}
              style={{ fontSize: '0.75rem', padding: '6px 4px' }}
            >
              <Store size={13} style={{ color: '#fbbf24' }} /> Owner
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemo('alexandria@storerating.com', 'User@123')}
              style={{ fontSize: '0.75rem', padding: '6px 4px' }}
            >
              <UserCheck size={13} style={{ color: '#34d399' }} /> User
            </button>
          </div>
        </div>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          New to the platform?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            style={{
              background: 'transparent',
              color: 'var(--primary)',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
