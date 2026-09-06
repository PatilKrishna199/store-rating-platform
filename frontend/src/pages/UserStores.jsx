import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import StarRating from '../components/StarRating.jsx';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stores', { params: { ...filters, ...sort } });
      setStores(data.stores);
    } catch (err) {
      setError('Could not load stores.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300); // debounce search typing
    return () => clearTimeout(t);
  }, [fetchStores]);

  const handleSort = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleRate = async (storeId, rating) => {
    setSavingId(storeId);
    try {
      await api.post(`/stores/${storeId}/rating`, { rating });
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, userRating: rating } : s))
      );
    } catch (err) {
      setError('Could not submit rating.');
    } finally {
      setSavingId(null);
    }
  };

  const sortIndicator = (field) =>
    sort.sortBy === field ? (sort.sortOrder === 'ASC' ? ' ▲' : ' ▼') : '';

  return (
    <div className="page">
      <h1>Browse stores</h1>
      <p className="page-subtitle">Search for a store and rate it from 1 to 5 stars.</p>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading stores…</p>
      ) : stores.length === 0 ? (
        <p className="empty-state">No stores match your search.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Store{sortIndicator('name')}</th>
              <th onClick={() => handleSort('address')}>Address{sortIndicator('address')}</th>
              <th onClick={() => handleSort('overallRating')}>Overall rating{sortIndicator('overallRating')}</th>
              <th>Your rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.address}</td>
                <td>
                  <StarRating value={Math.round(store.overallRating)} readOnly size="sm" />
                  <span className="rating-figure">
                    {store.overallRating || '—'} ({store.ratingCount})
                  </span>
                </td>
                <td>
                  <StarRating
                    value={store.userRating || 0}
                    onSelect={(n) => handleRate(store.id, n)}
                    size="sm"
                  />
                  {savingId === store.id && <span className="saving-indicator">Saving…</span>}
                  {store.userRating && <span className="rating-figure">You rated {store.userRating}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
