import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PASSWORD_HINT = '8-16 characters, with at least one uppercase letter and one special character.';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (form.name.trim().length < 20 || form.name.trim().length > 60) {
      return 'Name must be between 20 and 60 characters.';
    }
    if (form.address.trim().length === 0 || form.address.length > 400) {
      return 'Address is required and must be at most 400 characters.';
    }
    const pwd = form.password;
    if (pwd.length < 8 || pwd.length > 16 || !/[A-Z]/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)) {
      return `Password must be ${PASSWORD_HINT}`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const localError = validate();
    if (localError) {
      setError(localError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? apiErrors.map((x) => x.message).join(' ') : err.response?.data?.message || 'Could not sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtitle">Sign up to browse stores and share ratings with other shoppers.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Full name
            <input
              type="text"
              required
              minLength={20}
              maxLength={60}
              placeholder="Enter your full name (20-60 characters)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <span className="field-hint">{form.name.trim().length}/60 characters, minimum 20</span>
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
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
