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
      navigate('/app/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="eyebrow cyan">Changia</div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your cards, contributions, and paid events.</p>
        <form className="form-grid single-col" onSubmit={submit}>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="grace@changia.app" /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <button className="button primary" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <div className="auth-footer">
          <span>No account yet?</span>
          <Link to="/register">Register</Link>
        </div>
        <div className="demo-box">
          <strong>Demo organizer</strong>
          <div>grace@changia.app / Organizer123!</div>
        </div>
      </div>
    </div>
  );
}
