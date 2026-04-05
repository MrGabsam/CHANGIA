import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, CreditCard, Eye, EyeOff, FileImage, MessageSquare, Plus, QrCode, Share2, Users, Wallet } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../api/client.js';
import { UniversePanel } from '../components/UniversePanel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { kes, statusClass } from '../utils/format.js';

const visibilityModes = ['Names + Amounts', 'Names Only', 'Hidden Publicly'];
const paymentOptions = ['M-Pesa', 'Bank', 'PayPal', 'Airtel Money'];

export default function SpacePage() {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name: '', contact: '', amount: '', paymentMethod: 'M-Pesa', transactionCode: '', message: '', proof: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/spaces/${id}`).then((res) => {
      setSpace(res.data.space);
      setContributions(res.data.contributions);
      setForm((current) => ({ ...current, amount: res.data.space.type === 'event' ? String(res.data.space.price || '') : current.amount }));
    });
  }, [id]);

  const verified = useMemo(() => contributions.filter((item) => item.status === 'Verified'), [contributions]);
  const raised = useMemo(() => verified.reduce((sum, item) => sum + Number(item.amount || 0), 0), [verified]);
  const progress = useMemo(() => space?.type === 'card' ? Math.min(100, Math.round((raised / Math.max(space.goal || 1, 1)) * 100)) : 0, [space, raised]);

  async function submitContribution(e) {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) payload.append(key, value);
    });
    setSubmitting(true);
    try {
      const res = await api.post(`/contributions/spaces/${id}/contributions`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setContributions((current) => [res.data.contribution, ...current]);
      setForm({ name: '', contact: '', amount: space.type === 'event' ? String(space.price || '') : '', paymentMethod: 'M-Pesa', transactionCode: '', message: '', proof: null });
      setTab(space.type === 'event' ? 'passes' : 'contributors');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateVisibility(mode) {
    const res = await api.patch(`/spaces/${id}`, { visibilityMode: mode });
    setSpace(res.data.space);
  }

  if (!space) return <div className="panel"><div className="empty-state">Loading space...</div></div>;

  const isEvent = space.type === 'event';

  return (
    <div className="page-grid detail-grid">
      <div className="left-column stack gap-12">
        <div className="panel tall dark-panel no-pad">
          <UniversePanel space={space} contributions={contributions} compact={isEvent} />
        </div>
        {!isEvent ? (
          <div className="panel tall">
            <div className="panel-header"><div><h2>Supporters</h2><p>Compact contributor list with privacy-aware visibility.</p></div><span className="badge">{space.visibilityMode}</span></div>
            <div className="scroll-area stack gap-8">
              {contributions.map((item) => (
                <div key={item._id} className="list-card row-between gap-12 wrap">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.objectType} · {item.paymentMethod}</p>
                  </div>
                  <div className="align-right">
                    <span className={statusClass(item.status)}>{item.status}</span>
                    <div className="strong top-gap-sm">{space.visibilityMode === 'Names + Amounts' ? kes(item.amount) : 'Hidden'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="panel tall">
            <div className="panel-header"><div><h2>Verified passes</h2><p>Only approved guests receive a QR access pass.</p></div></div>
            <div className="scroll-area grid two-col gap-12">
              {verified.map((item) => (
                <div className="list-card" key={item._id}>
                  <div className="row-between gap-12 wrap">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.contact}</p>
                    </div>
                    <span className="badge badge-green">Verified</span>
                  </div>
                  <div className="qr-box">
                    <QRCodeCanvas value={item.ticketCode || `${space._id}-${item._id}`} size={116} includeMargin />
                    <small>{item.ticketCode || 'PENDING'}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="right-column stack gap-12">
        <div className="panel tall">
          <div className="tabs sticky-tabs">
            {['overview', 'messages', 'contributors', isEvent ? 'passes' : 'submit'].map((item) => (
              <button key={item} className={`tab ${tab === item ? 'active' : ''}`} onClick={() => setTab(item)}>{item === 'passes' ? 'Passes' : item[0].toUpperCase() + item.slice(1)}</button>
            ))}
            {isEvent && <button className={`tab ${tab === 'submit' ? 'active' : ''}`} onClick={() => setTab('submit')}>Submit</button>}
          </div>

          {tab === 'overview' && (
            <div className="tab-body stack gap-12 scroll-area">
              <div className="stats-grid three">
                <StatCard icon={Wallet} title={isEvent ? 'Ticket Price' : 'Raised'} value={isEvent ? kes(space.price) : kes(raised)} hint={isEvent ? 'Per verified guest' : 'Verified only'} />
                <StatCard icon={Users} title="People" value={String(contributions.length)} hint="All submissions" />
                <StatCard icon={CalendarDays} title="Date" value={space.eventDate || 'Not set'} hint={space.location || 'Location not set'} />
              </div>
              {!isEvent ? (
                <div className="content-card">
                  <div className="row-between gap-12 wrap"><strong>Goal progress</strong><span className="badge badge-cyan">{progress}% reached</span></div>
                  <div className="progress-bar top-gap"><span style={{ width: `${progress}%` }} /></div>
                  <div className="row-between muted top-gap-sm"><span>{kes(raised)} raised</span><span>{kes(space.goal)} target</span></div>
                </div>
              ) : null}
              <div className="grid two-col gap-12">
                <div className="content-card">
                  <strong>Visibility</strong>
                  <div className="stack gap-8 top-gap">
                    {visibilityModes.map((mode) => (
                      <button key={mode} className={`select-card ${space.visibilityMode === mode ? 'selected' : ''}`} onClick={() => updateVisibility(mode)}>
                        <span>{mode}</span>
                        {space.visibilityMode === mode ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="content-card">
                  <strong>Payment instructions</strong>
                  <div className="stack gap-8 top-gap muted">
                    <div className="soft-box">{space.paymentInstructions.primary}</div>
                    <div className="soft-box">{space.paymentInstructions.backup}</div>
                    <div className="soft-box">{space.paymentInstructions.diaspora}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="tab-body grid two-col gap-12 scroll-area">
              {contributions.map((item) => (
                <div className="content-card" key={item._id}>
                  <div className="row gap-12">
                    <div className="message-icon"><MessageSquare size={16} /></div>
                    <div>
                      <strong>{item.name}</strong>
                      <p className="muted">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="top-gap">{item.message || 'No message left.'}</p>
                  <div className="row gap-8 top-gap-sm">
                    <span className={statusClass(item.status)}>{item.status}</span>
                    <small>{item.paymentMethod}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'contributors' && (
            <div className="tab-body stack gap-8 scroll-area">
              {contributions.map((item) => (
                <div className="list-card row-between gap-12 wrap" key={item._id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.paymentMethod} · Ref: {item.transactionCode}</p>
                  </div>
                  <div className="align-right">
                    <span className={statusClass(item.status)}>{item.status}</span>
                    <div className="strong top-gap-sm">{space.visibilityMode === 'Names + Amounts' ? kes(item.amount) : 'Hidden'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'passes' && isEvent && (
            <div className="tab-body grid two-col gap-12 scroll-area">
              {verified.map((item) => (
                <div className="content-card" key={item._id}>
                  <div className="row-between gap-12 wrap">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.contact}</p>
                    </div>
                    <QrCode size={18} />
                  </div>
                  <div className="qr-box">
                    <QRCodeCanvas value={item.ticketCode || `${space._id}-${item._id}`} size={116} includeMargin />
                    <small>{item.ticketCode}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'submit' && (
            <form className="tab-body grid two-col gap-12 scroll-area" onSubmit={submitContribution}>
              <div className="content-card stack gap-8 muted">
                <div className="soft-box"><strong>1. Pay externally</strong><p>Use M-Pesa first. Bank and PayPal remain available.</p></div>
                <div className="soft-box"><strong>2. Submit proof</strong><p>Paste the transaction code and add a proof screenshot.</p></div>
                <div className="soft-box"><strong>3. Dashboard review</strong><p>The organizer approves or rejects the entry from Dashboard.</p></div>
              </div>
              <div className="content-card form-grid single-col">
                <div className="field"><label>Full name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid two-col gap-12">
                  <div className="field"><label>Amount</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                  <div className="field"><label>Method</label><select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>{paymentOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
                </div>
                <div className="grid two-col gap-12">
                  <div className="field"><label>Transaction code</label><input value={form.transactionCode} onChange={(e) => setForm({ ...form, transactionCode: e.target.value.toUpperCase() })} /></div>
                  <div className="field"><label>Phone or email</label><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                </div>
                <div className="field"><label>Message</label><input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
                <div className="field"><label>Proof screenshot</label><input type="file" accept="image/*" onChange={(e) => setForm({ ...form, proof: e.target.files?.[0] || null })} /></div>
                <div className="soft-box align-center"><FileImage size={18} /> Proof upload stored by backend uploads API.</div>
                <div className="row gap-12 wrap">
                  <button className="button primary" disabled={submitting}><CheckCircle2 size={16} /> {submitting ? 'Submitting...' : 'Submit Proof'}</button>
                  <button type="button" className="button secondary"><Share2 size={16} /> Copy Link</button>
                  {!isEvent ? <button type="button" className="button secondary"><Plus size={16} /> Invite</button> : <button type="button" className="button secondary"><CreditCard size={16} /> Ticketed</button>}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
