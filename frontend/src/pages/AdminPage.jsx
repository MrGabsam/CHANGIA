import React, { useEffect, useState } from 'react';
import { CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../api/client.js';
import { StatCard } from '../components/StatCard.jsx';
import { kes, riskClass } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Admin view is only available to admin users. Log in with the seeded admin account to test it.');
      return;
    }
    api.get('/admin/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load admin data.'));
  }, [user]);

  if (error) return <div className="panel"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="panel"><div className="empty-state">Loading admin...</div></div>;

  return (
    <div className="page-grid dashboard-grid">
      <div className="left-column stack gap-12">
        <div className="stats-grid three">
          <StatCard icon={CheckCircle2} title="Green" value={String(data.stats.green)} hint="Safe submissions" />
          <StatCard icon={AlertTriangle} title="Yellow" value={String(data.stats.yellow)} hint="Needs review" />
          <StatCard icon={Shield} title="Red" value={String(data.stats.red)} hint="High risk" />
        </div>
        <div className="panel tall">
          <div className="panel-header"><div><h2>Duplicate code monitor</h2><p>Fast review of references reused across the system.</p></div><span className="badge">{data.duplicates.length} duplicates</span></div>
          <div className="scroll-area stack gap-8">
            {data.duplicates.length === 0 ? (
              <div className="empty-state">No duplicate transaction codes detected.</div>
            ) : data.duplicates.map((item) => (
              <div className="list-card row-between gap-12 wrap" key={item.code}>
                <div>
                  <strong>{item.code}</strong>
                  <p>Appears {item.count} times</p>
                </div>
                <span className="badge badge-red">Red Guardian</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="right-column stack gap-12">
        <div className="panel tall">
          <div className="panel-header"><div><h2>Flagged submissions</h2><p>Everything that needs closer human review.</p></div></div>
          <div className="scroll-area stack gap-8">
            {data.flags.length === 0 ? (
              <div className="empty-state">No flagged submissions right now.</div>
            ) : data.flags.map((item) => (
              <div className="list-card" key={item._id}>
                <div className="row-between gap-12 wrap">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{kes(item.amount)} · {item.paymentMethod} · {item.transactionCode}</p>
                    <small>{item.space?.title}</small>
                  </div>
                  <span className={riskClass(item.risk)}>{item.risk} Guardian</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
