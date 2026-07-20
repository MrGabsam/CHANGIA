import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/app/dunda/new');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page dunda-auth-page">
      <div className="auth-card dunda-auth-card">
        <div className="eyebrow lime">Dunda by Changia</div>
        <h1>Launch your first Dunda</h1>
        <p>Create one organiser account for ticketing, gifts, squads, promotion and gate operations.</p>
        <form className="form-grid single-col" onSubmit={submit}>
          <div className="field"><label>Full name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div className="field"><label>Password</label><input type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <button className="button primary dunda-sidebar-primary" disabled={loading}>{loading ? 'Creating account...' : 'Create organiser account'}</button>
        </form>
        <div className="auth-footer">
          <span>Already registered?</span>
          <Link to="/login">Login</Link>
        </div>
        <Link className="dunda-auth-home" to="/">← Back to Dunda</Link>
      </div>
    </div>
  );
}
