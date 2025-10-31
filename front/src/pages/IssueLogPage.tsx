import { useState, useEffect } from 'react';
import './IssueLogPage.css';

interface Issue {
  id: string;
  description: string;
  imageUrl?: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  createdBy: {
    userId: string;
    name: string;
    email: string;
  };
  assignedTo?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
  };
  aiMetadata?: {
    labels: Array<{ name: string; confidence: number }>;
    objects: Array<{ name: string; confidence: number }>;
    detectedText?: string;
    suggestedDescription?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function IssueLogPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, filterStatus, filterPriority]);

  const fetchIssues = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/issues', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIssues(data);
        setError('');
      } else {
        setError('Failed to load issues');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(issue => issue.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filterPriority);
    }

    setFilteredIssues(filtered);
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the selected issue immediately for instant UI feedback
        if (selectedIssue && selectedIssue.id === issueId) {
          setSelectedIssue({
            ...selectedIssue,
            status: newStatus as 'open' | 'in-progress' | 'resolved',
          });
        }
        // Fetch all issues to update the list
        await fetchIssues();
        setSelectedIssue(null);
      } else {
        setError('Failed to update issue');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const updateIssuePriority = async (issueId: string, newPriority: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        // Update the selected issue immediately for instant UI feedback
        if (selectedIssue && selectedIssue.id === issueId) {
          setSelectedIssue({
            ...selectedIssue,
            priority: newPriority as 'low' | 'medium' | 'high',
          });
        }
        // Fetch all issues to update the list
        await fetchIssues();
      } else {
        setError('Failed to update priority');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#ef4444';
      case 'in-progress':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="issue-log-container">
        <div className="loading">Loading issues...</div>
      </div>
    );
  }

  return (
    <div className="issue-log-container">
      <div className="issue-log-header">
        <div>
          <h1 className="issue-log-title">Issue Log</h1>
          <p className="issue-log-subtitle">Manage and track all reported issues</p>
        </div>
        <div className="issue-stats">
          <div className="stat">
            <span className="stat-value">{issues.filter(i => i.status === 'open').length}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat">
            <span className="stat-value">{issues.filter(i => i.status === 'in-progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat">
            <span className="stat-value">{issues.filter(i => i.status === 'resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority:</label>
          <select
            id="priority-filter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button onClick={fetchIssues} className="refresh-btn" aria-label="Refresh issues list">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="issues-grid">
        {filteredIssues.length === 0 ? (
          <div className="no-issues">
            <p>No issues found</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="issue-card" onClick={() => setSelectedIssue(issue)}>
              <div className="issue-card-header">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(issue.status) }}
                  aria-label={`Status: ${issue.status}`}
                >
                  {issue.status === 'open' && '⭕ '}
                  {issue.status === 'in-progress' && '🔄 '}
                  {issue.status === 'resolved' && '✅ '}
                  {issue.status.replace('-', ' ')}
                </span>
                {issue.priority && (
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(issue.priority) }}
                    aria-label={`Priority: ${issue.priority}`}
                  >
                    {issue.priority === 'high' && '🔴 '}
                    {issue.priority === 'medium' && '🟡 '}
                    {issue.priority === 'low' && '🟢 '}
                    {issue.priority}
                  </span>
                )}
              </div>

              <p className="issue-description">{issue.description}</p>

              {issue.imageUrl && (
                <div className="issue-image-preview">
                  <img src={`http://localhost:3000${issue.imageUrl}`} alt="Issue" />
                </div>
              )}

              <div className="issue-footer">
                <div className="issue-user">
                  <strong>{issue.createdBy.name}</strong>
                  <span className="issue-email">{issue.createdBy.email}</span>
                </div>
                <span className="issue-date">{formatDate(issue.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedIssue(null)} aria-label="Close issue details">
              ✕
            </button>

            <h2>Issue Details</h2>

            <div className="modal-section">
              <label>Status</label>
              <select
                value={selectedIssue.status}
                onChange={(e) => updateIssueStatus(selectedIssue.id, e.target.value)}
                className="modal-select"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="modal-section">
              <label>Priority</label>
              <select
                value={selectedIssue.priority || 'medium'}
                onChange={(e) => updateIssuePriority(selectedIssue.id, e.target.value)}
                className="modal-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="modal-section">
              <label>Description</label>
              <p className="modal-description">{selectedIssue.description}</p>
            </div>

            {selectedIssue.imageUrl && (
              <div className="modal-section">
                <label>Image</label>
                <img
                  src={`http://localhost:3000${selectedIssue.imageUrl}`}
                  alt="Issue"
                  className="modal-image"
                />
              </div>
            )}

            {selectedIssue.aiMetadata && (
              <div className="modal-section">
                <label>🤖 AI Analysis</label>
                {selectedIssue.aiMetadata.suggestedDescription && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}>
                    <strong>AI Suggestion:</strong> {selectedIssue.aiMetadata.suggestedDescription}
                  </div>
                )}
                {selectedIssue.aiMetadata.objects.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Detected Objects:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {selectedIssue.aiMetadata.objects.map((obj, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            color: '#10b981',
                          }}
                        >
                          {obj.name} ({Math.round(obj.confidence * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedIssue.aiMetadata.labels.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Labels:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {selectedIssue.aiMetadata.labels.slice(0, 8).map((label, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            color: '#a855f7',
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedIssue.aiMetadata.detectedText && (
                  <div>
                    <strong>Detected Text (OCR):</strong>
                    <p style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}>
                      {selectedIssue.aiMetadata.detectedText}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-section">
              <label>Reported By</label>
              <p>
                <strong>{selectedIssue.createdBy.name}</strong><br />
                {selectedIssue.createdBy.email}
              </p>
            </div>

            {selectedIssue.location && (
              <div className="modal-section">
                <label>📍 Location</label>
                <p>
                  <strong>Coordinates:</strong> {selectedIssue.location.latitude.toFixed(6)}, {selectedIssue.location.longitude.toFixed(6)}
                  {selectedIssue.location.accuracy && (
                    <><br /><strong>Accuracy:</strong> ±{Math.round(selectedIssue.location.accuracy)}m</>
                  )}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedIssue.location.latitude},${selectedIssue.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--accent)',
                    color: '#000',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  🗺️ View on Google Maps
                </a>
              </div>
            )}

            <div className="modal-section">
              <label>Created</label>
              <p>{formatDate(selectedIssue.createdAt)}</p>
            </div>

            <div className="modal-section">
              <label>Last Updated</label>
              <p>{formatDate(selectedIssue.updatedAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
