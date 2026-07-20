import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Copy, Gift, MapPin, QrCode, Share2, Sparkles, Ticket, Trophy, Users, X } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../api/client.js';

function money(value, currency = 'KES') {
  const label = currency === 'KES' ? 'KSh' : currency;
  return `${label} ${Number(value || 0).toLocaleString()}`;
}

export default function PublicDundaEventPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedGift, setSelectedGift] = useState('');
  const [form, setForm] = useState({ buyerName: '', phone: '', email: '', publicName: '', quantity: 1, message: '', squadCode: searchParams.get('squad') || '', customGiftAmount: '' });
  const [squadForm, setSquadForm] = useState({ name: '', leaderName: '', leaderPhone: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await api.get(`/dunda/events/${slug}`);
      setData(response.data);
      const firstTier = response.data.event.ticketTiers?.find((tier) => tier.active !== false && tier.sold < tier.quantity);
      const firstGift = response.data.event.giftOptions?.find((gift) => gift.active !== false);
      setSelectedTier(firstTier?._id || '');
      setSelectedGift(firstGift?._id || '');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'This event could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  const event = data?.event;
  const selectedTierData = useMemo(() => event?.ticketTiers?.find((tier) => tier._id === selectedTier), [event, selectedTier]);
  const selectedGiftData = useMemo(() => event?.giftOptions?.find((gift) => gift._id === selectedGift), [event, selectedGift]);

  async function share() {
    const shareData = { title: event?.title, text: `I am pulling up to ${event?.title}. Join me on Dunda!`, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setResult({ message: 'Event link copied.' });
    }
  }

  function openPanel(name) {
    setResult(null);
    setError('');
    setPanel(name);
  }

  async function checkout(kind) {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        kind,
        ...form,
        quantity: Number(form.quantity || 1),
        ticketTierId: kind === 'ticket' ? selectedTier : '',
        giftOptionId: kind === 'gift' ? selectedGift : '',
        customGiftAmount: kind === 'gift' && form.customGiftAmount ? Number(form.customGiftAmount) : undefined,
        paymentMethod: 'test',
      };
      const response = await api.post(`/dunda/events/${event._id}/checkout`, payload);
      setResult(response.data);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Checkout could not be completed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function createSquad() {
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post(`/dunda/events/${event._id}/squads`, squadForm);
      const link = `${window.location.origin}${response.data.sharePath}`;
      setResult({ squad: response.data.squad, shareLink: link, message: 'Squad created. Share the link and start climbing the leaderboard.' });
      setForm((current) => ({ ...current, squadCode: response.data.squad.code }));
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Squad could not be created.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="dunda-loading"><Sparkles className="spin-soft" /><span>Loading the Dunda...</span></div>;
  if (!event) return <div className="dunda-not-found"><h1>Event unavailable</h1><p>{error}</p><Link to="/">Back to Dunda</Link></div>;

  const ticketsRemaining = (event.ticketTiers || []).reduce((sum, tier) => sum + Math.max(Number(tier.quantity || 0) - Number(tier.sold || 0), 0), 0);

  return (
    <div className="public-dunda">
      <header className="public-dunda-nav">
        <Link to="/"><ArrowLeft size={18} /> Discover</Link>
        <div className="dunda-brand"><span className="dunda-brand-mark"><Sparkles size={17} /></span><span>Dunda <small>by Changia</small></span></div>
        <button onClick={share}><Share2 size={17} /> Share</button>
      </header>

      <main>
        <section className="public-dunda-hero">
          <div className="public-dunda-art" style={event.coverImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(8,8,14,.12), rgba(8,8,14,.92)), url(${event.coverImageUrl})` } : undefined}>
            <div className="event-art-noise" />
            <span className="dunda-live-pill">{ticketsRemaining < 50 ? 'ALMOST SOLD OUT' : 'TICKETS LIVE'}</span>
            <div>
              <p>{event.theme}</p>
              <h1>{event.title}</h1>
              <div className="event-meta-row"><span><CalendarDays size={16} /> {event.eventDate}</span><span><MapPin size={16} /> {event.location}</span></div>
            </div>
          </div>

          <div className="public-dunda-summary">
            <div className="public-dunda-organiser"><span>Hosted by</span><strong>{event.organizer?.fullName || 'Dunda Organiser'}</strong></div>
            <p>{event.description}</p>
            <div className="public-dunda-stats">
              <div><strong>{data.stats.tickets}</strong><span>pulling up</span></div>
              <div><strong>{data.stats.squads}</strong><span>squads</span></div>
              <div><strong>{money(data.stats.gifted, event.currency)}</strong><span>gifted</span></div>
            </div>
            {event.dundaTarget > 0 && (
              <div className="dunda-unlock-card">
                <div><Trophy size={19} /><span><strong>{data.stats.dundaProgress}% unlocked</strong>{event.dundaReward || 'A surprise experience is loading'}</span></div>
                <div className="dunda-progress"><span style={{ width: `${data.stats.dundaProgress}%` }} /></div>
              </div>
            )}
            <div className="public-dunda-actions">
              <button className="dunda-btn primary" onClick={() => openPanel('ticket')}><Ticket size={18} /> Get ticket</button>
              {event.allowSquads && <button className="dunda-btn ghost" onClick={() => openPanel('squad')}><Users size={18} /> Start squad</button>}
              {event.allowGifting && <button className="dunda-btn ghost" onClick={() => openPanel('gift')}><Gift size={18} /> Send gift</button>}
            </div>
          </div>
        </section>

        <section className="public-dunda-content">
          <div className="public-dunda-main-column">
            <div className="dunda-content-heading"><div><span className="dunda-kicker"><span /> Choose your access</span><h2>Tickets</h2></div><span>{ticketsRemaining} remaining</span></div>
            <div className="ticket-tier-list">
              {event.ticketTiers.map((tier) => {
                const remaining = Math.max(tier.quantity - tier.sold, 0);
                return (
                  <button key={tier._id} className={`ticket-tier ${selectedTier === tier._id ? 'selected' : ''} ${remaining === 0 ? 'sold-out' : ''}`} onClick={() => { if (remaining) { setSelectedTier(tier._id); openPanel('ticket'); } }}>
                    <div><span>{tier.name}</span><small>{tier.description || `${remaining} tickets remaining`}</small></div>
                    <strong>{remaining ? money(tier.price, event.currency) : 'Sold out'}</strong>
                  </button>
                );
              })}
            </div>

            {event.allowGifting && event.giftOptions.length > 0 && (
              <>
                <div className="dunda-content-heading gifting-heading"><div><span className="dunda-kicker"><span /> Be part of the moment</span><h2>Gift the vibe</h2></div></div>
                <div className="gift-option-grid">
                  {event.giftOptions.map((gift) => (
                    <button key={gift._id} onClick={() => { setSelectedGift(gift._id); openPanel('gift'); }}>
                      <span>{gift.emoji}</span><strong>{gift.name}</strong><small>{gift.description}</small><b>{money(gift.amount, event.currency)}</b>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="public-dunda-side-column">
            <div className="dunda-side-card">
              <div className="dunda-side-title"><Trophy size={18} /><h3>Squad leaderboard</h3></div>
              {data.leaderboard.length ? data.leaderboard.map((squad, index) => (
                <div className="leaderboard-row" key={squad.code}><span>{index + 1}</span><div><strong>{squad.name}</strong><small>{squad.members} people</small></div>{squad.rewardUnlocked && <Check size={16} />}</div>
              )) : <div className="dunda-mini-empty"><Users size={22} /><p>Start the first squad and lead the event.</p></div>}
              {event.allowSquads && <button className="dunda-btn ghost full" onClick={() => openPanel('squad')}>Create squad</button>}
            </div>

            {event.showAttendees && (
              <div className="dunda-side-card">
                <div className="dunda-side-title"><Users size={18} /><h3>Who's pulling up?</h3></div>
                <div className="attendee-cloud">
                  {data.attendees.length ? data.attendees.map((attendee, index) => <span key={`${attendee.name}-${index}`}>{attendee.name}{attendee.quantity > 1 ? ` +${attendee.quantity - 1}` : ''}</span>) : <p>Be the first name on the list.</p>}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>

      {panel && (
        <div className="dunda-modal-backdrop" onMouseDown={(eventTarget) => { if (eventTarget.target === eventTarget.currentTarget) setPanel(''); }}>
          <div className="dunda-checkout-modal">
            <button className="dunda-modal-close" onClick={() => setPanel('')}><X size={19} /></button>

            {result?.order?.status === 'paid' && result.order.kind === 'ticket' ? (
              <div className="dunda-success-view">
                <span className="dunda-success-icon"><Check size={28} /></span>
                <span className="dunda-kicker"><span /> Payment confirmed</span>
                <h2>You are pulling up!</h2>
                <p>{result.message}</p>
                <div className="ticket-result-list">
                  {result.order.ticketCodes.map((code) => <div key={code}><QRCodeCanvas value={`${event._id}:${code}`} size={112} /><strong>{code}</strong><small>{event.title} · {result.order.ticketTierName}</small></div>)}
                </div>
                <button className="dunda-btn primary full" onClick={share}><Share2 size={17} /> Tell your people</button>
              </div>
            ) : result?.order?.status === 'paid' && result.order.kind === 'gift' ? (
              <div className="dunda-success-view">
                <span className="dunda-success-icon"><Gift size={28} /></span>
                <span className="dunda-kicker"><span /> Gift delivered</span>
                <h2>You added to the moment.</h2>
                <p>{result.message}</p>
                <strong className="dunda-big-amount">{money(result.order.amount, result.order.currency)}</strong>
                <button className="dunda-btn primary full" onClick={() => setPanel('')}>Done</button>
              </div>
            ) : result?.squad ? (
              <div className="dunda-success-view">
                <span className="dunda-success-icon"><Users size={28} /></span>
                <span className="dunda-kicker"><span /> Squad created</span>
                <h2>{result.squad.name}</h2>
                <p>{result.message}</p>
                <div className="squad-code-result"><small>Your squad code</small><strong>{result.squad.code}</strong></div>
                <button className="dunda-btn primary full" onClick={async () => { await navigator.clipboard.writeText(result.shareLink); setResult((current) => ({ ...current, message: 'Squad link copied. Share it on WhatsApp.' })); }}><Copy size={17} /> Copy squad link</button>
              </div>
            ) : (
              <>
                <span className="dunda-kicker"><span /> {panel === 'ticket' ? 'Secure checkout' : panel === 'gift' ? 'Gift the moment' : 'Build your crew'}</span>
                <h2>{panel === 'ticket' ? selectedTierData?.name : panel === 'gift' ? selectedGiftData?.name || 'Custom gift' : 'Create a squad'}</h2>
                {panel === 'ticket' && <p className="dunda-modal-price">{money(selectedTierData?.price, event.currency)} each</p>}
                {panel === 'gift' && <p className="dunda-modal-price">{selectedGiftData ? money(selectedGiftData.amount, event.currency) : 'Choose your amount'}</p>}

                {panel === 'squad' ? (
                  <div className="dunda-form-grid">
                    <label className="span-2">Squad name<input value={squadForm.name} onChange={(e) => setSquadForm({ ...squadForm, name: e.target.value })} placeholder="e.g. Team Rongai" /></label>
                    <label>Your name<input value={squadForm.leaderName} onChange={(e) => setSquadForm({ ...squadForm, leaderName: e.target.value })} /></label>
                    <label>Phone number<input value={squadForm.leaderPhone} onChange={(e) => setSquadForm({ ...squadForm, leaderPhone: e.target.value })} /></label>
                    <div className="dunda-reward-note span-2"><Trophy size={18} /><span><strong>Squad reward</strong>{event.squadReward} when {event.squadSize} people join.</span></div>
                    {error && <div className="dunda-form-error span-2">{error}</div>}
                    <button className="dunda-btn primary full span-2" disabled={submitting} onClick={createSquad}>{submitting ? 'Creating...' : 'Create and share squad'}</button>
                  </div>
                ) : (
                  <div className="dunda-form-grid">
                    <label>Your name<input value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} /></label>
                    <label>Phone number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07..." /></label>
                    <label>Email (optional)<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                    <label>Public name<input value={form.publicName} onChange={(e) => setForm({ ...form, publicName: e.target.value })} placeholder="First name or nickname" /></label>
                    {panel === 'ticket' && <label>Quantity<select value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}>{[1,2,3,4,5,6,7,8,9,10].map((n) => <option value={n} key={n}>{n}</option>)}</select></label>}
                    {panel === 'ticket' && event.allowSquads && <label>Squad code<input value={form.squadCode} onChange={(e) => setForm({ ...form, squadCode: e.target.value.toUpperCase() })} placeholder="Optional" /></label>}
                    {panel === 'gift' && <label>Custom amount<input type="number" min="100" value={form.customGiftAmount} onChange={(e) => setForm({ ...form, customGiftAmount: e.target.value })} placeholder="Leave blank for listed amount" /></label>}
                    {panel === 'gift' && <label className="span-2">Message<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write something memorable..." /></label>}
                    <div className="dunda-payment-note span-2"><QrCode size={18} /><span><strong>Test checkout enabled</strong>This build confirms payment instantly so the full flow can be tested safely.</span></div>
                    {error && <div className="dunda-form-error span-2">{error}</div>}
                    <button className="dunda-btn primary full span-2" disabled={submitting || (panel === 'ticket' && !selectedTier)} onClick={() => checkout(panel)}>{submitting ? 'Processing...' : panel === 'ticket' ? 'Pay and get ticket' : 'Send gift'}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
