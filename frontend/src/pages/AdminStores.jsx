import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...sort };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await api.get('/admin/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError('Could not load stores.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300);
    return () => clearTimeout(t);
  }, [fetchStores]);

  const handleSort = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const sortIndicator = (field) =>
    sort.sortBy === field ? (sort.sortOrder === 'ASC' ? ' ▲' : ' ▼') : '';

  return (
    <div className="page">
      <div className="page-header-row">
        <h1>Stores</h1>
        <Link className="btn btn-primary" to="/admin/stores/new">Add a store</Link>
      </div>

      <div className="filter-bar">
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading stores…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
              <th onClick={() => handleSort('email')}>Email{sortIndicator('email')}</th>
              <th onClick={() => handleSort('address')}>Address{sortIndicator('address')}</th>
              <th onClick={() => handleSort('overallRating')}>Rating{sortIndicator('overallRating')}</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.overallRating || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
