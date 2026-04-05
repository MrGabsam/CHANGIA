import React, { useEffect, useState } from 'react';
import { Clock3, ShieldCheck, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatCard } from '../components/StatCard.jsx';
import { kes, riskClass } from '../utils/format.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get('/dashboard/summary');
    setData(res.data);
  }

  async function review(contributionId, status) {
    await api.patch(`/contributions/${contributionId}/status`, { status });
    await load();
  }

  if (!data) return <div className="panel"><div className="empty-state">Loading dashboard...</div></div>;

  return (
    <div className="page-grid dashboard-grid">
      <div className="left-column stack gap-12">
        <div className="stats-grid four">
          <StatCard icon={Wallet} title="Verified Raised" value={kes(data.summary.verifiedRaised)} hint="Across your spaces" />
          <StatCard icon={Clock3} title="Pending" value={String(data.summary.pending)} hint="Awaiting review" />
          <StatCard icon={Users} title="Participants" value={String(data.summary.participants)} hint="Cards + events" />
          <StatCard icon={ShieldCheck} title="Guardian Flags" value={String(data.summary.flags)} hint="Yellow + red review states" />
        </div>

        <div className="panel tall">
          <div className="panel-header"><div><h2>Progress overview</h2><p>Compact snapshot across cards and paid events.</p></div></div>
          <div className="scroll-area stack gap-8">
            {data.spaces.map((space) => (
              <div className="list-card" key={space._id}>
                <div className="row-between gap-12 wrap">
                  <div>
                    <div className="row gap-8 wrap"><strong>{space.title}</strong><span className="badge">{space.type}</span></div>
                    <p>{space.description}</p>
                  </div>
                  <button className="button secondary" onClick={() => navigate(`/app/spaces/${space._id}`)}>Open</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="right-column stack gap-12">
        <div className="panel tall">
          <div className="panel-header"><div><h2>Approvals queue</h2><p>Approve, reject, and clear pending proof quickly.</p></div><span className="badge badge-yellow">{data.pending.length} pending</span></div>
          <div className="scroll-area stack gap-8">
            {data.pending.length === 0 ? (
              <div className="empty-state">No pending submissions right now.</div>
            ) : data.pending.map((item) => (
              <div className="list-card" key={item._id}>
                <div className="row-between gap-12 wrap">
                  <div>
                    <div className="row gap-8 wrap"><strong>{item.name}</strong><span className="badge">{item.space?.title}</span></div>
                    <p>{kes(item.amount)} · {item.paymentMethod} · Ref: {item.transactionCode}</p>
                    <small>{item.message || 'No message left.'}</small>
                  </div>
                  <span className={riskClass(item.risk)}>{item.risk} Guardian</span>
                </div>
                <div className="row gap-12 wrap top-gap">
                  <button className="button secondary" onClick={() => review(item._id, 'Rejected')}>Reject</button>
                  <button className="button primary" onClick={() => review(item._id, 'Verified')}>Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
