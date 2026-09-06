import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data.user))
      .catch(() => setError('Could not load this user.'));
  }, [id]);

  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!user) return <div className="page"><p>Loading…</p></div>;

  return (
    <div className="page-narrow">
      <Link to="/admin/users" className="back-link">&larr; Back to users</Link>
      <h1>{user.name}</h1>
      <div className="detail-card">
        <div className="detail-row"><span>Email</span><span>{user.email}</span></div>
        <div className="detail-row"><span>Address</span><span>{user.address}</span></div>
        <div className="detail-row"><span>Role</span><span className={`badge badge-${user.role}`}>{user.role.replace('_', ' ')}</span></div>
        {user.role === 'store_owner' && (
          <div className="detail-row"><span>Store rating</span><span>{user.rating ?? '—'}</span></div>
        )}
      </div>
    </div>
  );
}
