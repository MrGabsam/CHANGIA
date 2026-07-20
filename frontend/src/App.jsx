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
import DundaLandingPage from './pages/DundaLandingPage.jsx';
import PublicDundaEventPage from './pages/PublicDundaEventPage.jsx';
import DundaDashboardPage from './pages/DundaDashboardPage.jsx';
import CreateDundaPage from './pages/CreateDundaPage.jsx';
import DundaCheckInPage from './pages/DundaCheckInPage.jsx';
import './dunda.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-page"><div className="auth-card"><div className="empty-state">Loading...</div></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DundaLandingPage />} />
      <Route path="/e/:slug" element={<PublicDundaEventPage />} />
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
        <Route path="dunda" element={<DundaDashboardPage />} />
        <Route path="dunda/new" element={<CreateDundaPage />} />
        <Route path="dunda/check-in" element={<DundaCheckInPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="spaces/:id" element={<SpacePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route index element={<Navigate to="dunda" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
