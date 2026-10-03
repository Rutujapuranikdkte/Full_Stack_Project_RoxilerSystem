import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';
import { 
  Store, Star, Users, MapPin, Mail, ArrowUpDown, ArrowUp, ArrowDown, 
  Search, RefreshCw, AlertCircle, Calendar, Sparkles 
} from 'lucide-react';

export const OwnerDashboard = ({ onToast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    loadDashboard();
  }, [searchName, searchEmail, sortField, sortOrder]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: sortField,
        sortOrder: sortOrder
      };
      if (searchName) params.userName = searchName;
      if (searchEmail) params.userEmail = searchEmail;

      const res = await api.ratings.getOwnerDashboard(params);
      setData(res);
    } catch (err) {
      if (onToast) onToast('Failed to load store dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortOrder(prev => (sortField === field && prev === 'ASC' ? 'DESC' : 'ASC'));
    setSortField(field);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'ASC' ? <ArrowUp size={14} style={{ color: 'var(--primary)' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary)' }} />;
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: '#fbbf24',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            <Store size={14} /> Store Owner Portal
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '4px' }}>Store Performance Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Monitor customer reviews, overall store rating, and ratings feedback
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={loadDashboard}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading store dashboard...
        </div>
      ) : !data?.hasStore ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <AlertCircle size={48} style={{ color: '#fbbf24', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>No Store Assigned</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            There is currently no store linked to your owner account. Please reach out to the system administrator to assign your store.
          </p>
        </div>
      ) : (
        <>
          {/* Store Overview Card & Metric Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '28px'
          }}>
            {/* Store Information */}
            <div className="glass-panel" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8'
                }}>
                  <Store size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Registered Store
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{data.store.name}</h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} style={{ color: 'var(--text-muted)' }} />
                  <span>{data.store.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={15} style={{ color: 'var(--text-muted)', marginTop: '3px', flexShrink: 0 }} />
                  <span>{data.store.address}</span>
                </div>
              </div>
            </div>

            {/* Average Rating Highlight Card */}
            <div className="glass-panel" style={{
              padding: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Overall Average Rating
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1, color: '#fbbf24' }}>
                    {data.stats.averageRating ? Number(data.stats.averageRating).toFixed(1) : '0.0'}
                  </span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 5.0</span>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <StarRating value={data.stats.averageRating} size={22} />
                </div>
              </div>

              <div style={{
                textAlign: 'right',
                paddingLeft: '20px',
                borderLeft: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Total Reviews
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {data.stats.totalRatings}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Submitted ratings
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>
              Customer Ratings ({data.ratings.length})
            </h2>
          </div>

          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Filter by customer name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Filter by customer email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {(searchName || searchEmail) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setSearchName(''); setSearchEmail(''); }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Customer Ratings Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    <span className="th-content">
                      Customer Name {renderSortIcon('name')}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('email')}>
                    <span className="th-content">
                      Customer Email {renderSortIcon('email')}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('rating')}>
                    <span className="th-content">
                      Rating {renderSortIcon('rating')}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('date')}>
                    <span className="th-content">
                      Submission Date {renderSortIcon('date')}
                    </span>
                  </th>
                  <th>Customer Address</th>
                </tr>
              </thead>
              <tbody>
                {data.ratings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No customer ratings submitted yet for this store.
                    </td>
                  </tr>
                ) : (
                  data.ratings.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '600' }}>{r.user.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.user.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StarRating value={r.rating} size={18} />
                          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fbbf24' }}>
                            {r.rating}★
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{new Date(r.updatedAt || r.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '280px', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                        {r.user.address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
