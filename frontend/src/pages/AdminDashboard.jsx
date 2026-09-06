import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Could not load dashboard stats.'));
  }, []);

  return (
    <div className="page">
      <h1>Platform overview</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats ? stats.totalUsers : '—'}</span>
          <span className="stat-label">Registered users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats ? stats.totalStores : '—'}</span>
          <span className="stat-label">Registered stores</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats ? stats.totalRatings : '—'}</span>
          <span className="stat-label">Submitted ratings</span>
        </div>
      </div>

      <div className="quick-actions">
        <Link className="btn btn-primary" to="/admin/users/new">Add a user</Link>
        <Link className="btn btn-secondary" to="/admin/stores/new">Add a store</Link>
      </div>
    </div>
  );
}
