import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import UpdatePassword from './pages/UpdatePassword.jsx';

import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminStores from './pages/AdminStores.jsx';
import AdminAddUser from './pages/AdminAddUser.jsx';
import AdminAddStore from './pages/AdminAddStore.jsx';
import AdminUserDetail from './pages/AdminUserDetail.jsx';

import UserStores from './pages/UserStores.jsx';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard.jsx';

const roleHome = {
  admin: '/admin',
  user: '/stores',
  store_owner: '/owner',
};

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role]} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/account/password"
            element={
              <PrivateRoute>
                <UpdatePassword />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminAddUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminUserDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminStores />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/stores/new"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminAddStore />
              </PrivateRoute>
            }
          />

          <Route
            path="/stores"
            element={
              <PrivateRoute roles={['user']}>
                <UserStores />
              </PrivateRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <PrivateRoute roles={['store_owner']}>
                <StoreOwnerDashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
