import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const roleHome = {
  admin: '/admin',
  user: '/stores',
  store_owner: '/owner',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to={user ? roleHome[user.role] : '/'} className="navbar-brand">
        Storewell
      </Link>
      {user && (
        <nav className="navbar-links">
          {user.role === 'admin' && (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/stores">Stores</Link>
            </>
          )}
          {user.role === 'user' && <Link to="/stores">Browse stores</Link>}
          {user.role === 'store_owner' && <Link to="/owner">My store</Link>}
          <Link to="/account/password">Change password</Link>
          <span className="navbar-user">
            {user.name.split(' ')[0]} &middot; {user.role.replace('_', ' ')}
          </span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
