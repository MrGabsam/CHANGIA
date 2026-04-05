import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { AppShell } from './components/AppShell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SpacePage from './pages/SpacePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-page"><div className="auth-card"><div className="empty-state">Loading...</div></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<HomePage />} />
        <Route path="spaces/:id" element={<SpacePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route index element={<Navigate to="home" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  );
}
