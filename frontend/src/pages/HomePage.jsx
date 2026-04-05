import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Clock3, Gift, PartyPopper, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { UniversePanel } from '../components/UniversePanel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { kes } from '../utils/format.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/spaces')
      .then((res) => setSpaces(res.data.spaces))
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(() => spaces.filter((item) => item.type === 'card'), [spaces]);
  const summary = useMemo(() => {
    return spaces.reduce((acc, item) => {
      acc.verifiedRaised += Number(item.stats?.verifiedRaised || 0);
      acc.pending += Number(item.stats?.pending || 0);
      acc.redFlags += Number(item.stats?.pending || 0);
      return acc;
    }, { verifiedRaised: 0, pending: 0, redFlags: 0 });
  }, [spaces]);

  return (
    <div className="page-grid home-grid">
      <div className="left-column stack gap-12">
        <div className="hero-card">
          <span className="badge badge-dark">Live full-stack system</span>
          <h1>Celebrate, contribute, and manage paid events from one compact dashboard.</h1>
          <p>
            Changia combines emotional celebration spaces, manual proof-based contribution verification,
            and organiser control in a Kenya-first publishable system.
          </p>
          <div className="row gap-12 wrap top-gap">
            <button className="button primary"><PartyPopper size={16} /> Start Celebration</button>
            <button className="button secondary"><CalendarDays size={16} /> Create Event</button>
          </div>
        </div>

        <div className="stats-grid four">
          <StatCard icon={Wallet} title="Verified Raised" value={kes(summary.verifiedRaised)} hint="Across published spaces" />
          <StatCard icon={Gift} title="Live Cards" value={String(cards.length)} hint="Celebrations + collections" />
          <StatCard icon={Clock3} title="Pending" value={String(summary.pending)} hint="Need organiser review" />
          <StatCard icon={AlertTriangle} title="Review Signals" value={String(summary.redFlags)} hint="Guardian flags route to Admin" />
        </div>

        <div className="panel tall">
          {cards[0] ? <UniversePanel space={cards[0]} contributions={[]} compact /> : <div className="empty-state">No card yet.</div>}
        </div>
      </div>

      <div className="right-column stack gap-12">
        <div className="panel">
          <div className="panel-header"><div><h2>How to test it</h2><p>Follow this sequence to validate the full flow.</p></div></div>
          <div className="scroll-area stack gap-8">
            {[
              '1. Login as organizer',
              '2. Create a new card or event',
              '3. Open the space and submit a proof entry',
              '4. Open Dashboard and approve it',
              '5. Re-open the space and confirm status change',
              '6. Open Admin and review duplicate-code signals',
            ].map((item) => <div key={item} className="list-card">{item}</div>)}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div><h2>Live spaces</h2><p>Published cards and events available right now.</p></div></div>
          <div className="scroll-area stack gap-8">
            {loading ? <div className="empty-state">Loading spaces...</div> : spaces.map((space) => (
              <button key={space._id} className="list-card space-card" onClick={() => navigate(`/app/spaces/${space._id}`)}>
                <div>
                  <div className="row gap-8 wrap">
                    <strong>{space.title}</strong>
                    <span className="badge">{space.type === 'card' ? 'Card' : 'Event'}</span>
                  </div>
                  <p>{space.description}</p>
                  <small>{space.theme} · {space.location}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
