import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PASSWORD_HINT = '8-16 characters, with at least one uppercase letter and one special character.';

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      setSuccess(`${form.role === 'admin' ? 'Admin' : 'User'} account created.`);
      setTimeout(() => navigate('/admin/users'), 800);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? apiErrors.map((x) => x.message).join(' ') : err.response?.data?.message || 'Could not create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <h1>Add a new user</h1>
      <p className="page-subtitle">Create a normal user or another administrator account.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form card">
        <label>
          Full name
          <input
            type="text"
            required
            minLength={20}
            maxLength={60}
            placeholder="20-60 characters"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Email
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
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <span className="field-hint">{PASSWORD_HINT}</span>
        </label>
        <label>
          Role
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">Normal user</option>
            <option value="admin">System administrator</option>
            <option value="store_owner">Store owner</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
