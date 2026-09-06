import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StarRating from '../components/StarRating.jsx';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/store-owner/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your dashboard.'));
  }, []);

  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="page"><p>Loading…</p></div>;

  return (
    <div className="page">
      <h1>{data.store.name}</h1>
      <p className="page-subtitle">{data.store.address}</p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{data.averageRating || '—'}</span>
          <span className="stat-label">Average rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.raters.length}</span>
          <span className="stat-label">Customers who rated you</span>
        </div>
      </div>

      <h2 className="section-heading">Ratings received</h2>
      {data.raters.length === 0 ? (
        <p className="empty-state">No one has rated your store yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.raters.map((r) => (
              <tr key={r.userId}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td><StarRating value={r.rating} readOnly size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
