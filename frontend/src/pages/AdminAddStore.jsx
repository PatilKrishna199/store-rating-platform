import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminAddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/store-owners').then(({ data }) => setOwners(data.owners)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || undefined });
      setSuccess('Store created.');
      setTimeout(() => navigate('/admin/stores'), 800);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? apiErrors.map((x) => x.message).join(' ') : err.response?.data?.message || 'Could not create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <h1>Register a store</h1>
      <p className="page-subtitle">
        Optionally attach an existing store-owner account so they can see their own dashboard.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form card">
        <label>
          Store name
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Store email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Address
          <textarea
            required
            maxLength={400}
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <label>
          Store owner (optional)
          <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
            <option value="">No owner assigned yet</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name} — {o.email}</option>
            ))}
          </select>
          {owners.length === 0 && (
            <span className="field-hint">
              No store-owner accounts exist yet. Create one from “Add a user” first, then assign it here.
            </span>
          )}
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create store'}
        </button>
      </form>
    </div>
  );
}
