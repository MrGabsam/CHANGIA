import React, { useState } from 'react';
import { Bell, CalendarDays, Gift, Home, LayoutDashboard, LogOut, Menu, Plus, QrCode, Search, Shield, Sparkles, Ticket } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CreateSpaceModal } from './CreateSpaceModal.jsx';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState('card');

  const navItems = [
    { to: '/app/dunda', icon: Ticket, label: 'Dunda events' },
    { to: '/app/dunda/check-in', icon: QrCode, label: 'Gate check-in' },
    { to: '/app/home', icon: Home, label: 'Celebrations' },
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Legacy dashboard' },
    ...(user?.role === 'admin' ? [{ to: '/app/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  function openCreate(mode) {
    setCreateMode(mode);
    setCreateOpen(true);
  }

  function handleCreated(space) {
    navigate(`/app/spaces/${space._id}`);
  }

  return (
    <div className="app-shell dunda-app-shell">
      <aside className={`sidebar dunda-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div>
            <div className="eyebrow lime">Dunda</div>
            <h1>by Changia</h1>
          </div>
          <div className="logo-pill"><Sparkles size={18} /></div>
        </div>
        <div className="glass-note dunda-side-note">
          <p className="note-title">Ticket. Gift. Pull up.</p>
          <p>Build events that sell through tickets, squads and shared moments.</p>
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
          <button className="button primary full dunda-sidebar-primary" onClick={() => navigate('/app/dunda/new')}><Plus size={16} /> Create Dunda</button>
          <button className="button secondary full" onClick={() => openCreate('card')}><Gift size={16} /> Celebration card</button>
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
        <div className="topbar card dunda-app-topbar">
          <div className="row gap-12 wrap">
            <button className="icon-button mobile-only" onClick={() => setMobileOpen((value) => !value)}><Menu size={18} /></button>
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search events, tickets, guests..." />
            </div>
          </div>
          <div className="row gap-12 wrap">
            <span className="badge badge-green">Dunda live</span>
            <button className="button secondary"><Bell size={16} /> Alerts</button>
            <button className="button primary dunda-top-create" onClick={() => navigate('/app/dunda/new')}><Plus size={16} /> New event</button>
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
