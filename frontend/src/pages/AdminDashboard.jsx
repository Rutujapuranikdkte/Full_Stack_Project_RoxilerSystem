import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';
import { 
  Users, Store, Star, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, 
  Filter, Eye, Check, X, Shield, RefreshCw 
} from 'lucide-react';

export const AdminDashboard = ({ onToast }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0, roleStats: {} });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'
  const [loading, setLoading] = useState(true);

  // Stores State
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState({ field: 'name', order: 'ASC' });
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [ownersList, setOwnersList] = useState([]);

  // Users State
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState({ field: 'name', order: 'ASC' });
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Add Store Form
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [storeFormLoading, setStoreFormLoading] = useState(false);
  const [storeFormError, setStoreFormError] = useState('');

  // Add User Form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState('');

  // Initial load
  useEffect(() => {
    loadDashboardStats();
    loadStoreOwners();
  }, []);

  // Reload when tab or filters change
  useEffect(() => {
    if (activeTab === 'stores') {
      loadStores();
    } else {
      loadUsers();
    }
  }, [activeTab, storeFilters, storeSort, userFilters, userSort]);

  const loadDashboardStats = async () => {
    try {
      const res = await api.admin.getDashboardStats();
      if (res.stats) setStats(res.stats);
    } catch (err) {
      if (onToast) onToast('Failed to load stats: ' + err.message, 'error');
    }
  };

  const loadStoreOwners = async () => {
    try {
      const res = await api.admin.getStoreOwners();
      if (res.owners) setOwnersList(res.owners);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: storeSort.field,
        sortOrder: storeSort.order
      };
      if (storeFilters.name) params.name = storeFilters.name;
      if (storeFilters.email) params.email = storeFilters.email;
      if (storeFilters.address) params.address = storeFilters.address;

      const res = await api.admin.getStores(params);
      setStores(res.stores || []);
    } catch (err) {
      if (onToast) onToast('Failed to load stores: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: userSort.field,
        sortOrder: userSort.order
      };
      if (userFilters.name) params.name = userFilters.name;
      if (userFilters.email) params.email = userFilters.email;
      if (userFilters.address) params.address = userFilters.address;
      if (userFilters.role) params.role = userFilters.role;

      const res = await api.admin.getUsers(params);
      setUsers(res.users || []);
    } catch (err) {
      if (onToast) onToast('Failed to load users: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSort = (field) => {
    setStoreSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const handleUserSort = (field) => {
    setUserSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const renderSortIcon = (currentField, activeField, order) => {
    if (currentField !== activeField) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return order === 'ASC' ? <ArrowUp size={14} style={{ color: 'var(--primary)' }} /> : <ArrowDown size={14} style={{ color: 'var(--primary)' }} />;
  };

  // Add Store Submit
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreFormError('');

    // Validations
    const nameLen = newStore.name.trim().length;
    if (nameLen < 20 || nameLen > 60) {
      setStoreFormError('Store Name must be between 20 and 60 characters.');
      return;
    }
    if (newStore.address.trim().length > 400) {
      setStoreFormError('Address cannot exceed 400 characters.');
      return;
    }

    setStoreFormLoading(true);
    try {
      await api.admin.addStore({
        name: newStore.name.trim(),
        email: newStore.email.trim(),
        address: newStore.address.trim(),
        owner_id: newStore.owner_id ? parseInt(newStore.owner_id, 10) : null
      });
      if (onToast) onToast('Store added successfully!', 'success');
      setIsAddStoreOpen(false);
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      loadStores();
      loadDashboardStats();
    } catch (err) {
      setStoreFormError(err.message || 'Failed to add store.');
    } finally {
      setStoreFormLoading(false);
    }
  };

  // Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormError('');

    const nameLen = newUser.name.trim().length;
    if (nameLen < 20 || nameLen > 60) {
      setUserFormError('User Name must be between 20 and 60 characters.');
      return;
    }

    const pass = newUser.password;
    const isPassValid = pass.length >= 8 && pass.length <= 16 && /[A-Z]/.test(pass) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    if (!isPassValid) {
      setUserFormError('Password must be 8-16 chars with at least one uppercase letter and one special character.');
      return;
    }

    if (newUser.address.trim().length > 400) {
      setUserFormError('Address cannot exceed 400 characters.');
      return;
    }

    setUserFormLoading(true);
    try {
      await api.admin.addUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        address: newUser.address.trim(),
        role: newUser.role
      });
      if (onToast) onToast(`New ${newUser.role} user created successfully!`, 'success');
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      loadUsers();
      loadDashboardStats();
      loadStoreOwners();
    } catch (err) {
      setUserFormError(err.message || 'Failed to create user.');
    } finally {
      setUserFormLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>System Administrator Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Platform metrics, stores registry, and user role management
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => { loadDashboardStats(); activeTab === 'stores' ? loadStores() : loadUsers(); }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          {activeTab === 'stores' ? (
            <button type="button" className="btn btn-primary" onClick={() => setIsAddStoreOpen(true)}>
              <Plus size={18} /> Add New Store
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
              <Plus size={18} /> Add New User
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid-stats">
        <div className="glass-panel" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.18)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Users
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.1 }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.roleStats.ADMIN || 0} Admins · {stats.roleStats.USER || 0} Normal · {stats.roleStats.OWNER || 0} Owners
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(139, 92, 246, 0.18)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc'
          }}>
            <Store size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Stores
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.1 }}>{stats.totalStores}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Registered on platform
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Star size={26} fill="#fbbf24" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Submitted Ratings
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.1 }}>{stats.totalRatings}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time user feedback (1-5★)
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '20px',
        gap: '24px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('stores')}
          style={{
            background: 'transparent',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: '700',
            color: activeTab === 'stores' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'stores' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Store size={18} /> Stores Registry ({stores.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            background: 'transparent',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: '700',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} /> Users Management ({users.length})
        </button>
      </div>

      {/* STORES TAB CONTENT */}
      {activeTab === 'stores' && (
        <div>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
              <Filter size={16} /> Filter Stores (By Name, Email, Address)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="Filter by Store Name..."
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter by Email..."
                value={storeFilters.email}
                onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter by Address..."
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
              />
              {(storeFilters.name || storeFilters.email || storeFilters.address) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStoreFilters({ name: '', email: '', address: '' })}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Stores Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleStoreSort('name')}>
                    <span className="th-content">
                      Store Name {renderSortIcon('name', storeSort.field, storeSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleStoreSort('email')}>
                    <span className="th-content">
                      Email {renderSortIcon('email', storeSort.field, storeSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleStoreSort('address')}>
                    <span className="th-content">
                      Address {renderSortIcon('address', storeSort.field, storeSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleStoreSort('rating')}>
                    <span className="th-content">
                      Overall Rating {renderSortIcon('rating', storeSort.field, storeSort.order)}
                    </span>
                  </th>
                  <th>Store Owner</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      Loading stores...
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No stores found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td style={{ maxWidth: '300px', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                        {s.address}
                      </td>
                      <td>
                        <StarRating value={s.overallRating} showNumber={true} totalRatings={s.totalRatings} />
                      </td>
                      <td>
                        {s.owner ? (
                          <div>
                            <div style={{ fontWeight: '500' }}>{s.owner.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.owner.email}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB CONTENT */}
      {activeTab === 'users' && (
        <div>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
              <Filter size={16} /> Filter Users (By Name, Email, Address, Role)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="Filter by Name..."
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter by Email..."
                value={userFilters.email}
                onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter by Address..."
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
              />
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="USER">Normal User</option>
                <option value="OWNER">Store Owner</option>
              </select>
              {(userFilters.name || userFilters.email || userFilters.address || userFilters.role) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setUserFilters({ name: '', email: '', address: '', role: '' })}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleUserSort('name')}>
                    <span className="th-content">
                      Name {renderSortIcon('name', userSort.field, userSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('email')}>
                    <span className="th-content">
                      Email {renderSortIcon('email', userSort.field, userSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('address')}>
                    <span className="th-content">
                      Address {renderSortIcon('address', userSort.field, userSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('role')}>
                    <span className="th-content">
                      Role {renderSortIcon('role', userSort.field, userSort.order)}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('rating')}>
                    <span className="th-content">
                      Store Rating {renderSortIcon('rating', userSort.field, userSort.order)}
                    </span>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600' }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ maxWidth: '260px', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                        {u.address}
                      </td>
                      <td>
                        {u.role === 'ADMIN' && <span className="badge badge-admin"><Shield size={12} /> Admin</span>}
                        {u.role === 'USER' && <span className="badge badge-user">Normal User</span>}
                        {u.role === 'OWNER' && <span className="badge badge-owner"><Store size={12} /> Store Owner</span>}
                      </td>
                      <td>
                        {u.role === 'OWNER' ? (
                          u.store ? (
                            <div>
                              <StarRating value={u.store.rating} showNumber={true} totalRatings={u.store.ratingCount} />
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {u.store.name}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No store assigned</span>
                          )
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>N/A (Non-Owner)</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedUserDetail(u)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add New Store */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Add New Store">
        <form onSubmit={handleAddStoreSubmit}>
          {storeFormError && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              marginBottom: '16px'
            }}>
              {storeFormError}
            </div>
          )}

          <div className="form-group">
            <div className="form-label">
              <span>Store Name</span>
              <span className={`char-counter ${newStore.name.length >= 20 && newStore.name.length <= 60 ? 'valid' : 'invalid'}`}>
                {newStore.name.length}/60 chars (Min 20)
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={60}
              placeholder="e.g. Heritage Artisanal Coffee House"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              required
              placeholder="contact@storename.com"
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Address</span>
              <span className={`char-counter ${newStore.address.length <= 400 ? 'valid' : 'invalid'}`}>
                {newStore.address.length}/400 chars
              </span>
            </div>
            <textarea
              required
              rows={2}
              maxLength={400}
              placeholder="Store physical location"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Store Owner (Optional)</label>
            <select
              value={newStore.owner_id}
              onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
            >
              <option value="">-- No Owner (Unassigned) --</option>
              {ownersList.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddStoreOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={storeFormLoading}>
              {storeFormLoading ? 'Adding...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Add New User */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add New User">
        <form onSubmit={handleAddUserSubmit}>
          {userFormError && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              marginBottom: '16px'
            }}>
              {userFormError}
            </div>
          )}

          <div className="form-group">
            <div className="form-label">
              <span>Full Name</span>
              <span className={`char-counter ${newUser.name.length >= 20 && newUser.name.length <= 60 ? 'valid' : 'invalid'}`}>
                {newUser.name.length}/60 chars (Min 20)
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={60}
              placeholder="e.g. Benjamin Alexander Montgomery"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">User Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Password</span>
              <span className="char-counter">8-16 chars</span>
            </div>
            <input
              type="password"
              required
              maxLength={16}
              placeholder="e.g. SecurePass@123"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Must have 8-16 chars, at least 1 uppercase letter, at least 1 special char.
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Address</span>
              <span className={`char-counter ${newUser.address.length <= 400 ? 'valid' : 'invalid'}`}>
                {newUser.address.length}/400 chars
              </span>
            </div>
            <textarea
              required
              rows={2}
              maxLength={400}
              placeholder="Residential address"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={userFormLoading}>
              {userFormLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View User Details */}
      <Modal
        isOpen={!!selectedUserDetail}
        onClose={() => setSelectedUserDetail(null)}
        title="User Account Details"
      >
        {selectedUserDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{selectedUserDetail.name}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</div>
              <div style={{ fontWeight: '500' }}>{selectedUserDetail.email}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Role</div>
              <div style={{ marginTop: '4px' }}>
                {selectedUserDetail.role === 'ADMIN' && <span className="badge badge-admin"><Shield size={12} /> System Administrator</span>}
                {selectedUserDetail.role === 'USER' && <span className="badge badge-user">Normal User</span>}
                {selectedUserDetail.role === 'OWNER' && <span className="badge badge-owner"><Store size={12} /> Store Owner</span>}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Address</div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                {selectedUserDetail.address}
              </div>
            </div>

            {selectedUserDetail.role === 'OWNER' && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '14px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fbbf24', marginBottom: '6px' }}>
                  OWNED STORE & RATING INFORMATION
                </div>
                {selectedUserDetail.store ? (
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                      {selectedUserDetail.store.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating value={selectedUserDetail.store.rating} showNumber={true} totalRatings={selectedUserDetail.store.ratingCount} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    No store assigned to this owner yet.
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer" style={{ padding: '12px 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedUserDetail(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
