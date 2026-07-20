import React, { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Gift, QrCode, Share2, Sparkles, Ticket, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

function lowestPrice(event) {
  const prices = (event.ticketTiers || []).filter((tier) => tier.active !== false).map((tier) => Number(tier.price || 0));
  return prices.length ? Math.min(...prices) : 0;
}

export default function DundaLandingPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/dunda/events').then(({ data }) => setEvents(data.events || [])).catch(() => setEvents([]));
  }, []);

  return (
    <div className="dunda-site">
      <header className="dunda-nav">
        <Link className="dunda-brand" to="/">
          <span className="dunda-brand-mark"><Sparkles size={18} /></span>
          <span>Dunda <small>by Changia</small></span>
        </Link>
        <nav>
          <a href="#discover">Discover</a>
          <a href="#how">How it works</a>
          <Link to="/login">Organiser login</Link>
          <Link className="dunda-nav-cta" to="/register">Create event</Link>
        </nav>
      </header>

      <main>
        <section className="dunda-hero">
          <div className="dunda-hero-copy">
            <span className="dunda-kicker"><span /> Kenya's social event engine</span>
            <h1>Ticket it. Gift it. <em>Make it trend.</em></h1>
            <p>Create one powerful event link for tickets, squads, gifts, hype and gate check-in. Built for WhatsApp-first audiences and unforgettable nights.</p>
            <div className="dunda-hero-actions">
              <Link className="dunda-btn primary" to="/register">Launch your Dunda <ArrowRight size={18} /></Link>
              <a className="dunda-btn ghost" href="#discover">Explore events</a>
            </div>
            <div className="dunda-trust-row">
              <span><Ticket size={16} /> Instant QR tickets</span>
              <span><Users size={16} /> Viral squads</span>
              <span><Gift size={16} /> Event gifting</span>
            </div>
          </div>

          <div className="dunda-hero-card-wrap">
            <div className="dunda-glow-orb orb-one" />
            <div className="dunda-glow-orb orb-two" />
            <article className="dunda-feature-card">
              <div className="dunda-feature-cover">
                <span className="dunda-live-pill">SELLING FAST</span>
                <div>
                  <p>SAT · 10PM · NAIROBI</p>
                  <h2>AFRO<br />SUNSET</h2>
                </div>
              </div>
              <div className="dunda-feature-body">
                <div className="dunda-feature-stats">
                  <strong>742</strong><span>pulling up</span>
                  <strong>18</strong><span>squads</span>
                  <strong>74%</strong><span>reward unlocked</span>
                </div>
                <div className="dunda-progress"><span style={{ width: '74%' }} /></div>
                <button>Get ticket · KSh 1,000 <ArrowRight size={17} /></button>
              </div>
            </article>
          </div>
        </section>

        <section className="dunda-value-strip" id="how">
          <article><span>01</span><Share2 /><h3>One shareable link</h3><p>Tickets, gifts, squads and event updates live together.</p></article>
          <article><span>02</span><Users /><h3>Guests sell for you</h3><p>Squad links and rewards turn attendees into promoters.</p></article>
          <article><span>03</span><QrCode /><h3>Fast entry</h3><p>Every paid ticket receives a unique gate-ready code.</p></article>
          <article><span>04</span><Gift /><h3>Earn beyond tickets</h3><p>Sell moments, upgrades, gifts and branded experiences.</p></article>
        </section>

        <section className="dunda-discover" id="discover">
          <div className="dunda-section-heading">
            <div><span className="dunda-kicker"><span /> Happening next</span><h2>Find your next Dunda</h2></div>
            <Link to="/register">List an event <ArrowRight size={16} /></Link>
          </div>
          <div className="dunda-event-grid">
            {events.length ? events.map((event, index) => (
              <Link className={`dunda-event-card poster-${(index % 4) + 1}`} to={`/e/${event.slug}`} key={event._id}>
                <div className="dunda-event-poster">
                  <span>{event.theme || 'DUNDA'}</span>
                  <strong>{event.title}</strong>
                </div>
                <div className="dunda-event-info">
                  <div><h3>{event.title}</h3><p><CalendarDays size={14} /> {event.eventDate || 'Date coming soon'}</p><p>{event.location}</p></div>
                  <strong>From KSh {lowestPrice(event).toLocaleString()}</strong>
                </div>
              </Link>
            )) : (
              <div className="dunda-empty-events">
                <Sparkles size={28} />
                <h3>Your event could headline this page.</h3>
                <p>Create the first Dunda and start sharing your link.</p>
                <Link className="dunda-btn primary" to="/register">Create event</Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="dunda-footer">
        <div className="dunda-brand"><span className="dunda-brand-mark"><Sparkles size={18} /></span><span>Dunda <small>by Changia</small></span></div>
        <p>Ticket. Gift. Pull up.</p>
        <span>© {new Date().getFullYear()} Changia</span>
      </footer>
    </div>
  );
}
