import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/app/dunda');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page dunda-auth-page">
      <div className="auth-card dunda-auth-card">
        <div className="eyebrow lime">Dunda by Changia</div>
        <h1>Welcome back</h1>
        <p>Sign in to publish events, monitor ticket revenue and run gate check-in.</p>
        <form className="form-grid single-col" onSubmit={submit}>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="grace@changia.app" required /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required /></div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <button className="button primary dunda-sidebar-primary" disabled={loading}>{loading ? 'Signing in...' : 'Open control centre'}</button>
        </form>
        <div className="auth-footer">
          <span>New organiser?</span>
          <Link to="/register">Create account</Link>
        </div>
        <div className="demo-box">
          <strong>Demo organiser</strong>
          <div>grace@changia.app / Organizer123!</div>
        </div>
        <Link className="dunda-auth-home" to="/">← Back to Dunda</Link>
      </div>
    </div>
  );
}
