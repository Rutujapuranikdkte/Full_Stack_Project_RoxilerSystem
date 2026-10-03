import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Mail, Lock, User, MapPin, ArrowRight, Check, X, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = ({ onNavigateLogin, onToast }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validations
  const nameLength = name.trim().length;
  const isNameValid = nameLength >= 20 && nameLength <= 60;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email.trim());

  const addressLength = address.trim().length;
  const isAddressValid = addressLength > 0 && addressLength <= 400;

  const isPasswordLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = isPasswordLength && hasUppercase && hasSpecial;

  const isConfirmValid = password && password === confirmPassword;

  const canSubmit = isNameValid && isEmailValid && isAddressValid && isPasswordValid && isConfirmValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please resolve all validation requirements before submitting.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password
      });
      if (onToast) onToast('Account created successfully! Welcome to StoreRate.', 'success');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '36px 32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '14px'
          }}>
            <Star size={26} fill="#ffffff" color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', marginBottom: '6px' }}>Join StoreRate</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Register as a customer to explore stores and submit ratings
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
          {/* Full Name */}
          <div className="form-group">
            <div className="form-label">
              <span>Full Name</span>
              <span className={`char-counter ${nameLength > 0 ? (isNameValid ? 'valid' : 'invalid') : ''}`}>
                {nameLength}/60 chars (Min 20)
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Christopher David Henderson"
                style={{ paddingLeft: '38px' }}
                maxLength={60}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            {nameLength > 0 && !isNameValid && (
              <div className="validation-error">
                <X size={13} /> Name must be between 20 and 60 characters ({nameLength < 20 ? `${20 - nameLength} more characters needed` : 'Too long'})
              </div>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            {email.length > 0 && !isEmailValid && (
              <div className="validation-error">
                <X size={13} /> Must be a valid email format (e.g. user@domain.com)
              </div>
            )}
          </div>

          {/* Address */}
          <div className="form-group">
            <div className="form-label">
              <span>Address</span>
              <span className={`char-counter ${addressLength > 0 ? (isAddressValid ? 'valid' : 'invalid') : ''}`}>
                {addressLength}/400 chars (Max 400)
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete residential or mailing address"
                maxLength={400}
                style={{ resize: 'vertical' }}
              />
            </div>
            {addressLength > 400 && (
              <div className="validation-error">
                <X size={13} /> Address exceeds maximum limit of 400 characters
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="form-label">
              <span>Password</span>
              <span className="char-counter">8-16 chars</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                maxLength={16}
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

            {/* Password Validation Checklist */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isPasswordLength ? 'var(--success)' : 'var(--text-muted)' }}>
                {isPasswordLength ? <Check size={14} /> : <X size={14} />}
                <span>8 to 16 characters</span>
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

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            {confirmPassword && (
              <div style={{ fontSize: '0.8rem', marginTop: '4px', color: isConfirmValid ? 'var(--success)' : 'var(--danger)' }}>
                {isConfirmValid ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || loading}
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            style={{
              background: 'transparent',
              color: 'var(--primary)',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
