import React, { useState } from 'react';
import { Bell, CalendarDays, Gift, Home, LayoutDashboard, LogOut, Menu, Plus, Search, Shield, Sparkles } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CreateSpaceModal } from './CreateSpaceModal.jsx';

const navItems = [
  { to: '/app/home', icon: Home, label: 'Home' },
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/admin', icon: Shield, label: 'Admin' },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState('card');

  function openCreate(mode) {
    setCreateMode(mode);
    setCreateOpen(true);
  }

  function handleCreated(space) {
    navigate(`/app/spaces/${space._id}`);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div>
            <div className="eyebrow cyan">Changia</div>
            <h1>Live System</h1>
          </div>
          <div className="logo-pill"><Sparkles size={18} /></div>
        </div>
        <div className="glass-note">
          <p className="note-title">Kenya-first system</p>
          <p>Compact, mobile-friendly, trust-focused, and ready for publishing work.</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-actions">
          <button className="button primary full" onClick={() => openCreate('card')}><Gift size={16} /> New Card</button>
          <button className="button secondary full" onClick={() => openCreate('event')}><CalendarDays size={16} /> New Event</button>
        </div>
        <div className="sidebar-footer">
          <div>
            <div className="note-title">Signed in</div>
            <p>{user?.fullName}</p>
            <small>{user?.role}</small>
          </div>
          <button className="icon-button" onClick={() => { logout(); navigate('/login'); }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <div className="topbar card">
          <div className="row gap-12 wrap">
            <button className="icon-button mobile-only" onClick={() => setMobileOpen((v) => !v)}><Menu size={18} /></button>
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search spaces, themes, contributors..." />
            </div>
          </div>
          <div className="row gap-12 wrap">
            <span className="badge badge-green">Live Build</span>
            <span className="badge">Publishable</span>
            <button className="button secondary"><Bell size={16} /> Alerts</button>
            <button className="button primary" onClick={() => openCreate('card')}><Plus size={16} /> New</button>
          </div>
        </div>
        <div className="page-frame">
          <Outlet />
        </div>
      </main>

      <CreateSpaceModal open={createOpen} mode={createMode} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
