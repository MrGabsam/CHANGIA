import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, QrCode, ScanLine, ShieldCheck, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';

export default function DundaCheckInPage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(searchParams.get('event') || '');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api.get('/dunda/organiser/dashboard').then(({ data }) => {
      setEvents(data.events || []);
      if (!eventId && data.events?.length) setEventId(data.events[0]._id);
    });
  }, []);

  async function checkIn(event) {
    event.preventDefault();
    setChecking(true);
    setResult(null);
    try {
      const { data } = await api.post(`/dunda/events/${eventId}/check-in`, { code });
      setResult({ ok: true, ...data });
      setCode('');
    } catch (requestError) {
      setResult({ ok: false, message: requestError.response?.data?.message || 'Ticket could not be checked.' });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="dunda-checkin-page">
      <div className="dunda-checkin-header">
        <Link to="/app/dunda"><ArrowLeft size={17} /> Dashboard</Link>
        <span><ShieldCheck size={16} /> Secure gate mode</span>
      </div>

      <div className="dunda-checkin-shell">
        <section className="dunda-checkin-copy">
          <span className="dunda-kicker"><span /> Gate operations</span>
          <h1>Fast entry. No duplicate tickets.</h1>
          <p>Select the event, scan or type the ticket code, and receive an immediate decision.</p>
          <div className="dunda-gate-benefits">
            <div><QrCode size={20} /><span><strong>Unique code validation</strong>Every issued ticket is checked against the selected event.</span></div>
            <div><ShieldCheck size={20} /><span><strong>Duplicate protection</strong>A second scan is blocked and clearly reported.</span></div>
          </div>
        </section>

        <form className="dunda-scanner-card" onSubmit={checkIn}>
          <span className="dunda-scanner-icon"><ScanLine size={30} /></span>
          <h2>Check in guest</h2>
          <p>Use the code printed below the guest's QR ticket.</p>
          <label>Event<select value={eventId} onChange={(event) => setEventId(event.target.value)} required><option value="">Select event</option>{events.map((item) => <option value={item._id} key={item._id}>{item.title}</option>)}</select></label>
          <label>Ticket code<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="TIX-XXXXXXXX" autoFocus required /></label>
          <button className="dunda-btn primary full" disabled={checking || !eventId}>{checking ? 'Checking...' : 'Validate and admit'}</button>

          {result && (
            <div className={`dunda-scan-result ${result.ok ? 'success' : 'error'}`}>
              {result.ok ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
              <div><strong>{result.message}</strong>{result.ok && <><span>{result.guest}</span><small>{result.ticketTier} · {result.code}</small></>}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
