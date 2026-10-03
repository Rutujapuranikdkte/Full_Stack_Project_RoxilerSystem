import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';
import { 
  Store, Search, ArrowUpDown, ArrowUp, ArrowDown, Star, Sparkles, 
  MapPin, CheckCircle, Edit3, RefreshCw, LayoutGrid, List
} from 'lucide-react';

export const UserDashboard = ({ onToast }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Rating modal state
  const [ratingModalStore, setRatingModalStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    loadStores();
  }, [searchTerm, sortField, sortOrder]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: sortField,
        sortOrder: sortOrder
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.stores.getAll(params);
      setStores(res.stores || []);
    } catch (err) {
      if (onToast) onToast('Failed to load stores: ' + err.message, 'error');
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

  // Quick rating submission directly
  const submitRatingDirect = async (storeId, ratingValue) => {
    try {
      const res = await api.ratings.submit({ storeId, rating: ratingValue });
      if (onToast) onToast(res.message || 'Rating submitted!', 'success');
      // Update local state smoothly
      setStores(prev => prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            userRating: ratingValue,
            overallRating: res.overallRating,
            totalRatings: res.totalRatings
          };
        }
        return s;
      }));
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to submit rating.', 'error');
    }
  };

  // Handle modal submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModalStore) return;

    setSubmittingRating(true);
    try {
      const res = await api.ratings.submit({
        storeId: ratingModalStore.id,
        rating: selectedRating
      });
      if (onToast) onToast(res.message || 'Rating saved successfully!', 'success');
      
      // Update store in state
      setStores(prev => prev.map(s => {
        if (s.id === ratingModalStore.id) {
          return {
            ...s,
            userRating: selectedRating,
            overallRating: res.overallRating,
            totalRatings: res.totalRatings
          };
        }
        return s;
      }));

      setRatingModalStore(null);
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to save rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const openRatingModal = (store) => {
    setRatingModalStore(store);
    setSelectedRating(store.userRating || 5);
  };

  return (
    <div className="main-content">
      {/* Hero Welcome */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: '#a5b4fc',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            <Sparkles size={14} /> Normal User Portal
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Welcome, <span style={{ color: '#818cf8' }}>{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>
            Explore all registered stores on the platform. Review community ratings, submit your personal 1 to 5 star rating, or update your past feedback at any time.
          </p>
        </div>
      </div>

      {/* Search & View Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '480px' }}>
          <input
            type="text"
            placeholder="Search stores by Name or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem'
              }}
            >
              <List size={16} /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 10px',
                background: viewMode === 'cards' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'cards' ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem'
              }}
            >
              <LayoutGrid size={16} /> Cards
            </button>
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={loadStores}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  <span className="th-content">
                    Store Name {renderSortIcon('name')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('address')}>
                  <span className="th-content">
                    Address {renderSortIcon('address')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('rating')}>
                  <span className="th-content">
                    Overall Rating {renderSortIcon('rating')}
                  </span>
                </th>
                <th>Your Submitted Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No stores found matching your search.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: '700', fontSize: '0.98rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td style={{ maxWidth: '320px', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={15} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--text-muted)' }} />
                        <span>{s.address}</span>
                      </div>
                    </td>
                    <td>
                      <StarRating value={s.overallRating} showNumber={true} totalRatings={s.totalRatings} />
                    </td>
                    <td>
                      {s.userRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StarRating value={s.userRating} readOnly={true} size={18} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fbbf24' }}>
                            {s.userRating}★
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not rated yet</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={s.userRating ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                        onClick={() => openRatingModal(s)}
                      >
                        {s.userRating ? (
                          <>
                            <Edit3 size={14} /> Modify Rating
                          </>
                        ) : (
                          <>
                            <Star size={14} /> Rate Store
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid-cards">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading stores...
            </div>
          ) : stores.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No stores found.
            </div>
          ) : (
            stores.map((s) => (
              <div
                key={s.id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{s.name}</h3>
                    <div className="rating-badge">
                      <Star size={13} fill="#fbbf24" />
                      <span>{s.overallRating ? Number(s.overallRating).toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {s.email}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                    <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                    <span style={{ lineHeight: '1.4' }}>{s.address}</span>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Community Rating:</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({s.totalRatings} reviews)</span>
                    </div>
                    <StarRating value={s.overallRating} showNumber={true} />
                  </div>
                </div>

                {/* User's rating area */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Your Rating:
                    </div>
                    {s.userRating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating value={s.userRating} size={16} readOnly={true} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fbbf24' }}>
                          {s.userRating}★
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Not rated yet</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={s.userRating ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                    onClick={() => openRatingModal(s)}
                  >
                    {s.userRating ? <Edit3 size={14} /> : <Star size={14} />}
                    <span>{s.userRating ? 'Modify' : 'Rate'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RATING SUBMISSION / MODIFICATION MODAL */}
      <Modal
        isOpen={!!ratingModalStore}
        onClose={() => setRatingModalStore(null)}
        title={ratingModalStore?.userRating ? `Modify Rating for ${ratingModalStore?.name}` : `Submit Rating for ${ratingModalStore?.name}`}
      >
        {ratingModalStore && (
          <form onSubmit={handleModalSubmit}>
            <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '16px' }}>
                Select a rating between 1 and 5 stars for this store:
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <StarRating
                  value={selectedRating}
                  readOnly={false}
                  size={36}
                  onChange={(val) => setSelectedRating(val)}
                />
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fbbf24' }}>
                {selectedRating} of 5 Stars
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedRating === 5 && '🌟 Exceptional! Highly recommended'}
                {selectedRating === 4 && '👍 Great experience'}
                {selectedRating === 3 && '👌 Average / Satisfactory'}
                {selectedRating === 2 && '👎 Below expectations'}
                {selectedRating === 1 && '⚠️ Poor experience'}
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRatingModalStore(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingRating}
              >
                {submittingRating ? 'Saving...' : (ratingModalStore.userRating ? 'Update Rating' : 'Submit Rating')}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
