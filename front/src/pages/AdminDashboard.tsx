import { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface Analytics {
  summary: {
    totalUsers: number;
    totalIssues: number;
    totalOffices: number;
    openIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    avgResolutionTimeMs: number;
  };
  issuesByOffice: Array<{ _id: string; count: number }>;
  locationStats: {
    totalWithLocation: number;
    totalWithoutLocation: number;
    locations: Array<{
      id: string;
      latitude: number;
      longitude: number;
      status: string;
      priority?: string;
    }>;
  };
  recentIssues: Array<{
    id: string;
    description: string;
    status: string;
    priority?: string;
    createdBy: { name: string; email: string };
    createdAt: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  office: string;
  workstation: string;
  country: string;
  phoneNumber?: string;
}

interface Office {
  id: string;
  name: string;
  country: string;
  createdAt: string;
}

type Tab = 'dashboard' | 'users' | 'offices';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'standard-user',
    office: '',
    workstation: '',
    country: '',
    phoneNumber: '',
  });
  
  // Office form state
  const [showOfficeForm, setShowOfficeForm] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [officeForm, setOfficeForm] = useState({
    name: '',
    country: '',
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAnalytics();
    } else if (activeTab === 'users') {
      fetchUsers();
      fetchOffices(); // Load offices for dropdown
    } else if (activeTab === 'offices') {
      fetchOffices();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/admin/analytics', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setError('');
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/admin/users', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users:', data);
        setUsers(data);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('Failed to load users:', response.status, errorText);
        setError(`Failed to load users: ${response.status}`);
      }
    } catch (err) {
      console.error('Connection error fetching users:', err);
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOffices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/admin/offices', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched offices:', data);
        setOffices(data);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('Failed to load offices:', response.status, errorText);
        setError(`Failed to load offices: ${response.status}`);
      }
    } catch (err) {
      console.error('Connection error fetching offices:', err);
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setShowUserForm(false);
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'standard-user',
          office: '',
          workstation: '',
          country: '',
          phoneNumber: '',
        });
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setEditingUser(null);
        setShowUserForm(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchUsers();
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/admin/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(officeForm),
      });

      if (response.ok) {
        setShowOfficeForm(false);
        setOfficeForm({ name: '', country: '' });
        fetchOffices();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create office');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleUpdateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/offices/${editingOffice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(officeForm),
      });

      if (response.ok) {
        setEditingOffice(null);
        setShowOfficeForm(false);
        fetchOffices();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update office');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleDeleteOffice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this office?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/offices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchOffices();
      } else {
        setError('Failed to delete office');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && !analytics && !users.length && !offices.length) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">Manage users, offices, and view system analytics</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'offices' ? 'active' : ''}`}
          onClick={() => setActiveTab('offices')}
        >
          🏢 Offices
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && analytics && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{analytics.summary.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{analytics.summary.totalIssues}</div>
              <div className="stat-label">Total Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-value">{analytics.summary.totalOffices}</div>
              <div className="stat-label">Offices</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">
                {formatDuration(analytics.summary.avgResolutionTimeMs)}
              </div>
              <div className="stat-label">Avg Resolution</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Issues by Status</h3>
              <div className="chart-bars">
                <div className="chart-bar">
                  <div className="bar-label">Open</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(analytics.summary.openIssues / analytics.summary.totalIssues) * 100}%`,
                        backgroundColor: '#ef4444',
                      }}
                    />
                  </div>
                  <div className="bar-value">{analytics.summary.openIssues}</div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">In Progress</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(analytics.summary.inProgressIssues / analytics.summary.totalIssues) * 100}%`,
                        backgroundColor: '#f59e0b',
                      }}
                    />
                  </div>
                  <div className="bar-value">{analytics.summary.inProgressIssues}</div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Resolved</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(analytics.summary.resolvedIssues / analytics.summary.totalIssues) * 100}%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                  </div>
                  <div className="bar-value">{analytics.summary.resolvedIssues}</div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Issues by Priority</h3>
              <div className="chart-bars">
                <div className="chart-bar">
                  <div className="bar-label">High</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(analytics.summary.highPriority / analytics.summary.totalIssues) * 100}%`,
                        backgroundColor: '#ef4444',
                      }}
                    />
                  </div>
                  <div className="bar-value">{analytics.summary.highPriority}</div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Medium</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(analytics.summary.mediumPriority / analytics.summary.totalIssues) * 100}%`,
                        backgroundColor: '#f59e0b',
                      }}
                    />
                  </div>
                  <div className="bar-value">{analytics.summary.mediumPriority}</div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Low</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(analytics.summary.lowPriority / analytics.summary.totalIssues) * 100}%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                  </div>
                  <div className="bar-value">{analytics.summary.lowPriority}</div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Issues by Office</h3>
              <div className="chart-bars">
                {analytics.issuesByOffice.map((office) => (
                  <div key={office._id} className="chart-bar">
                    <div className="bar-label">{office._id}</div>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(office.count / analytics.summary.totalIssues) * 100}%`,
                          backgroundColor: '#3b82f6',
                        }}
                      />
                    </div>
                    <div className="bar-value">{office.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Recent Issues</h3>
              <div className="recent-issues-list">
                {analytics.recentIssues.map((issue) => (
                  <div key={issue.id} className="recent-issue-item">
                    <div className="recent-issue-header">
                      <span className={`status-badge-small ${issue.status}`} aria-label={`Status: ${issue.status}`}>
                        {issue.status === 'open' && '⭕ '}
                        {issue.status === 'in-progress' && '🔄 '}
                        {issue.status === 'resolved' && '✅ '}
                        {issue.status}
                      </span>
                      {issue.priority && (
                        <span className={`priority-badge-small ${issue.priority}`} aria-label={`Priority: ${issue.priority}`}>
                          {issue.priority === 'high' && '🔴 '}
                          {issue.priority === 'medium' && '🟡 '}
                          {issue.priority === 'low' && '🟢 '}
                          {issue.priority}
                        </span>
                      )}
                    </div>
                    <p className="recent-issue-description">{issue.description}</p>
                    <div className="recent-issue-footer">
                      <span className="recent-issue-user">{issue.createdBy.name}</span>
                      <span className="recent-issue-date">{formatDate(issue.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {analytics.locationStats && (
              <div className="chart-card">
                <h3>📍 Geographic Data</h3>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                        {analytics.locationStats.totalWithLocation}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        With Location
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {analytics.locationStats.totalWithoutLocation}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Without Location
                      </div>
                    </div>
                  </div>
                  {analytics.locationStats.totalWithLocation > 0 && (
                    <div style={{ 
                      padding: '0.75rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                    }}>
                      💡 <strong>{Math.round((analytics.locationStats.totalWithLocation / analytics.summary.totalIssues) * 100)}%</strong> of issues have location data
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-content">
          <div className="content-header">
            <h2>Users Management</h2>
            <button
              className="btn-primary"
              onClick={() => {
                setShowUserForm(true);
                setEditingUser(null);
                setUserForm({
                  name: '',
                  email: '',
                  password: '',
                  role: 'standard-user',
                  office: '',
                  workstation: '',
                  country: '',
                  phoneNumber: '',
                });
              }}
            >
              + Add User
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Office</th>
                  <th>Workstation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role || ''}`}>
                          {user.role ? user.role.replace('-', ' ') : 'N/A'}
                        </span>
                      </td>
                      <td>{user.office || 'N/A'}</td>
                      <td>{user.workstation || 'N/A'}</td>
                      <td>
                        <button
                          className="btn-icon"
                          aria-label={`Edit user ${user.name}`}
                          onClick={() => {
                            setEditingUser(user);
                            setUserForm({
                              name: user.name,
                              email: user.email,
                              password: '',
                              role: user.role,
                              office: user.office,
                              workstation: user.workstation,
                              country: user.country,
                              phoneNumber: user.phoneNumber || '',
                            });
                            setShowUserForm(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          aria-label={`Delete user ${user.name}`}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offices Tab */}
      {activeTab === 'offices' && (
        <div className="offices-content">
          <div className="content-header">
            <h2>Offices Management</h2>
            <button
              className="btn-primary"
              onClick={() => {
                setShowOfficeForm(true);
                setEditingOffice(null);
                setOfficeForm({ name: '', country: '' });
              }}
            >
              + Add Office
            </button>
          </div>

          <div className="offices-grid">
            {offices.map((office) => (
              <div key={office.id} className="office-card">
                <div className="office-card-header">
                  <div>
                    <h3>{office.name}</h3>
                    <p>{office.country}</p>
                  </div>
                  <div className="office-actions">
                    <button
                      className="btn-icon"
                      aria-label={`Edit office ${office.name}`}
                      onClick={() => {
                        setEditingOffice(office);
                        setOfficeForm({ name: office.name, country: office.country });
                        setShowOfficeForm(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      aria-label={`Delete office ${office.name}`}
                      onClick={() => handleDeleteOffice(office.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="office-created">Created: {formatDate(office.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUserForm(false)} aria-label="Close user form">
              ✕
            </button>
            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  required
                >
                  <option value="standard-user">Standard User</option>
                  <option value="service-desk-user">Service Desk User</option>
                  <option value="admin-user">Admin User</option>
                </select>
              </div>
              <div className="form-group">
                <label>Office *</label>
                <select
                  value={userForm.office}
                  onChange={(e) => {
                    const selectedOffice = offices.find(o => o.name === e.target.value);
                    setUserForm({ 
                      ...userForm, 
                      office: e.target.value,
                      country: selectedOffice?.country || userForm.country
                    });
                  }}
                  required
                >
                  <option value="">Select Office</option>
                  {offices.map((office) => (
                    <option key={office.id} value={office.name}>
                      {office.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Workstation</label>
                <input
                  type="text"
                  value={userForm.workstation}
                  onChange={(e) => setUserForm({ ...userForm, workstation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={userForm.country}
                  onChange={(e) => setUserForm({ ...userForm, country: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={userForm.phoneNumber}
                  onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUserForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Office Form Modal */}
      {showOfficeForm && (
        <div className="modal-overlay" onClick={() => setShowOfficeForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOfficeForm(false)} aria-label="Close office form">
              ✕
            </button>
            <h2>{editingOffice ? 'Edit Office' : 'Create New Office'}</h2>
            <form onSubmit={editingOffice ? handleUpdateOffice : handleCreateOffice}>
              <div className="form-group">
                <label>Office Name *</label>
                <input
                  type="text"
                  value={officeForm.name}
                  onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={officeForm.country}
                  onChange={(e) => setOfficeForm({ ...officeForm, country: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowOfficeForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingOffice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
