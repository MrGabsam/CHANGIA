import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Copy, Gift, Plus, QrCode, Ticket, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

function money(value, currency = 'KES') {
  return `${currency === 'KES' ? 'KSh' : currency} ${Number(value || 0).toLocaleString()}`;
}

export default function DundaDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/dunda/organiser/dashboard');
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => events.reduce((acc, event) => ({
    revenue: acc.revenue + Number(event.metrics?.revenue || 0),
    tickets: acc.tickets + Number(event.metrics?.tickets || 0),
    gifts: acc.gifts + Number(event.metrics?.gifts || 0),
  }), { revenue: 0, tickets: 0, gifts: 0 }), [events]);

  async function copyLink(event) {
    const link = `${window.location.origin}/e/${event.slug}`;
    await navigator.clipboard.writeText(link);
    setCopied(event._id);
    setTimeout(() => setCopied(''), 1800);
  }

  if (loading) return <div className="dunda-app-loading">Loading your Dunda control centre...</div>;

  return (
    <div className="dunda-dashboard-page">
      <div className="dunda-app-heading">
        <div><span className="dunda-kicker"><span /> Organiser control centre</span><h1>Your events. Your crowd. Your revenue.</h1><p>Publish, share, monitor sales and run the gate from one place.</p></div>
        <Link className="dunda-btn primary" to="/app/dunda/new"><Plus size={18} /> Create Dunda</Link>
      </div>

      <div className="dunda-metric-grid">
        <article><span><TrendingUp size={19} /></span><div><small>Total revenue</small><strong>{money(totals.revenue)}</strong><p>Paid tickets and gifts</p></div></article>
        <article><span><Ticket size={19} /></span><div><small>Tickets sold</small><strong>{totals.tickets.toLocaleString()}</strong><p>Across {events.length} event{events.length === 1 ? '' : 's'}</p></div></article>
        <article><span><Gift size={19} /></span><div><small>Gifts received</small><strong>{totals.gifts.toLocaleString()}</strong><p>Extra event income</p></div></article>
        <article><span><Users size={19} /></span><div><small>Live experiences</small><strong>{events.filter((event) => event.status === 'published').length}</strong><p>Currently shareable</p></div></article>
      </div>

      <div className="dunda-dashboard-toolbar">
        <div><h2>Event portfolio</h2><span>{events.length} total</span></div>
        <Link to="/app/dunda/check-in"><QrCode size={17} /> Open gate scanner</Link>
      </div>

      {events.length ? (
        <div className="dunda-organiser-events">
          {events.map((event, index) => {
            const sold = Number(event.metrics?.tickets || 0);
            const capacity = Number(event.capacity || 0);
            const fill = capacity ? Math.min(Math.round((sold / capacity) * 100), 100) : 0;
            return (
              <article key={event._id}>
                <div className={`dunda-organiser-poster poster-${(index % 4) + 1}`}>
                  <span>{event.status}</span>
                  <strong>{event.title}</strong>
                  <small>{event.theme}</small>
                </div>
                <div className="dunda-organiser-body">
                  <div className="dunda-organiser-title"><div><h3>{event.title}</h3><p><CalendarDays size={14} /> {event.eventDate} · {event.location}</p></div><Link to={`/e/${event.slug}`} target="_blank"><ArrowUpRight size={18} /></Link></div>
                  <div className="dunda-event-metrics">
                    <div><small>Revenue</small><strong>{money(event.metrics?.revenue, event.currency)}</strong></div>
                    <div><small>Tickets</small><strong>{sold}</strong></div>
                    <div><small>Gifts</small><strong>{event.metrics?.gifts || 0}</strong></div>
                  </div>
                  <div className="dunda-capacity-line"><div><span>Capacity</span><strong>{fill}%</strong></div><div className="dunda-progress"><span style={{ width: `${fill}%` }} /></div></div>
                  <div className="dunda-event-actions">
                    <button onClick={() => copyLink(event)}><Copy size={15} /> {copied === event._id ? 'Copied' : 'Copy link'}</button>
                    <Link to={`/app/dunda/check-in?event=${event._id}`}><QrCode size={15} /> Check in</Link>
                    <Link className="primary-action" to={`/e/${event.slug}`} target="_blank">Open event <ArrowUpRight size={15} /></Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dunda-dashboard-empty">
          <span><Ticket size={28} /></span>
          <h2>Create your first revenue-ready event.</h2>
          <p>Add ticket tiers, gifts, a viral squad reward and publish one link.</p>
          <Link className="dunda-btn primary" to="/app/dunda/new"><Plus size={17} /> Create Dunda</Link>
        </div>
      )}
    </div>
  );
}
