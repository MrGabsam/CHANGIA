import React, { useState } from 'react';
import { ArrowLeft, Gift, Plus, Sparkles, Ticket, Trash2, Trophy, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

const emptyTier = () => ({ name: '', description: '', price: '', quantity: '' });
const emptyGift = () => ({ name: '', description: '', emoji: '🎁', amount: '' });

export default function CreateDundaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '', eventDate: '', doorsOpen: '', theme: 'Dunda Night', coverImageUrl: '', capacity: 500,
    ageRestriction: '18+', dundaTarget: 300, dundaReward: 'A surprise guest performance', squadSize: 5,
    squadReward: 'Squad leader gets a free upgrade', allowGifting: true, allowSquads: true, showAttendees: true,
  });
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'Early Bird', description: 'Limited release', price: 1000, quantity: 150 },
    { name: 'Regular', description: 'General admission', price: 1500, quantity: 300 },
    { name: 'VIP', description: 'Priority entry and premium experience', price: 3500, quantity: 50 },
  ]);
  const [giftOptions, setGiftOptions] = useState([
    { name: 'Bottle for the table', description: 'Add to the celebration', emoji: '🍾', amount: 5000 },
    { name: 'DJ dedication', description: 'Send a message with a song request', emoji: '🎧', amount: 1500 },
    { name: 'VIP upgrade', description: 'Upgrade someone special', emoji: '⭐', amount: 2500 },
  ]);
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateTier(index, key, value) {
    setTicketTiers((current) => current.map((tier, tierIndex) => tierIndex === index ? { ...tier, [key]: value } : tier));
  }

  function updateGift(index, key, value) {
    setGiftOptions((current) => current.map((gift, giftIndex) => giftIndex === index ? { ...gift, [key]: value } : gift));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        dundaTarget: Number(form.dundaTarget || 0),
        squadSize: Number(form.squadSize || 5),
        ticketTiers: ticketTiers.map((tier) => ({ ...tier, price: Number(tier.price), quantity: Number(tier.quantity) })),
        giftOptions: giftOptions.filter((gift) => gift.name).map((gift) => ({ ...gift, amount: Number(gift.amount) })),
        status,
      };
      const { data } = await api.post('/dunda/events', payload);
      navigate(`/e/${data.event.slug}`);
    } catch (requestError) {
      const details = requestError.response?.data?.issues;
      setError(requestError.response?.data?.message || details?.[0]?.message || 'The event could not be created. Check the required fields.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="create-dunda-page" onSubmit={submit}>
      <div className="create-dunda-topbar">
        <div><Link to="/app/dunda"><ArrowLeft size={17} /> Back</Link><span>New experience</span></div>
        <div><button type="button" className={status === 'draft' ? 'active' : ''} onClick={() => setStatus('draft')}>Save draft</button><button className="dunda-btn primary" disabled={saving}>{saving ? 'Publishing...' : 'Publish Dunda'}</button></div>
      </div>

      <div className="create-dunda-heading">
        <span className="dunda-kicker"><span /> Event builder</span>
        <h1>Build something people cannot ignore.</h1>
        <p>Create the ticket, gifting and social mechanics in one focused flow.</p>
      </div>

      <div className="create-dunda-layout">
        <div className="create-dunda-main">
          <section className="dunda-builder-section">
            <div className="dunda-builder-title"><span>01</span><div><h2>Event identity</h2><p>Give people a reason to stop scrolling.</p></div></div>
            <div className="dunda-form-grid wide">
              <label className="span-2">Event name<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Afro Sunset Nairobi" required /></label>
              <label className="span-2">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes this event unmissable?" required /></label>
              <label>Theme<input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} /></label>
              <label>Cover image URL<input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="Optional" /></label>
              <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label>
              <label>Date and time<input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required /></label>
              <label>Doors open<input value={form.doorsOpen} onChange={(e) => setForm({ ...form, doorsOpen: e.target.value })} placeholder="8:00 PM" /></label>
              <label>Capacity<input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></label>
            </div>
          </section>

          <section className="dunda-builder-section">
            <div className="dunda-builder-title"><span>02</span><div><h2>Ticket tiers</h2><p>Use urgency and clear value to increase conversion.</p></div></div>
            <div className="dunda-builder-list">
              {ticketTiers.map((tier, index) => (
                <div className="dunda-builder-row" key={`tier-${index}`}>
                  <Ticket size={18} />
                  <input value={tier.name} onChange={(e) => updateTier(index, 'name', e.target.value)} placeholder="Tier name" required />
                  <input value={tier.description} onChange={(e) => updateTier(index, 'description', e.target.value)} placeholder="Short description" />
                  <label><small>KSh</small><input type="number" min="0" value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} required /></label>
                  <label><small>Qty</small><input type="number" min="1" value={tier.quantity} onChange={(e) => updateTier(index, 'quantity', e.target.value)} required /></label>
                  <button type="button" onClick={() => setTicketTiers((current) => current.filter((_, tierIndex) => tierIndex !== index))} disabled={ticketTiers.length === 1}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="dunda-add-row" onClick={() => setTicketTiers((current) => [...current, emptyTier()])}><Plus size={16} /> Add ticket tier</button>
          </section>

          <section className="dunda-builder-section">
            <div className="dunda-builder-title"><span>03</span><div><h2>Gift menu</h2><p>Turn supporters and absent friends into extra revenue.</p></div></div>
            <div className="dunda-builder-list">
              {giftOptions.map((gift, index) => (
                <div className="dunda-builder-row gift-row" key={`gift-${index}`}>
                  <input className="emoji-input" value={gift.emoji} onChange={(e) => updateGift(index, 'emoji', e.target.value)} />
                  <input value={gift.name} onChange={(e) => updateGift(index, 'name', e.target.value)} placeholder="Gift name" />
                  <input value={gift.description} onChange={(e) => updateGift(index, 'description', e.target.value)} placeholder="Why guests will buy it" />
                  <label><small>KSh</small><input type="number" min="0" value={gift.amount} onChange={(e) => updateGift(index, 'amount', e.target.value)} /></label>
                  <button type="button" onClick={() => setGiftOptions((current) => current.filter((_, giftIndex) => giftIndex !== index))}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="dunda-add-row" onClick={() => setGiftOptions((current) => [...current, emptyGift()])}><Plus size={16} /> Add gift</button>
          </section>

          <section className="dunda-builder-section">
            <div className="dunda-builder-title"><span>04</span><div><h2>Viral mechanics</h2><p>Give the crowd a reason to recruit friends.</p></div></div>
            <div className="dunda-form-grid wide">
              <label>Dunda target<input type="number" min="0" value={form.dundaTarget} onChange={(e) => setForm({ ...form, dundaTarget: e.target.value })} /></label>
              <label>Target reward<input value={form.dundaReward} onChange={(e) => setForm({ ...form, dundaReward: e.target.value })} /></label>
              <label>Squad size<input type="number" min="2" max="50" value={form.squadSize} onChange={(e) => setForm({ ...form, squadSize: e.target.value })} /></label>
              <label>Squad reward<input value={form.squadReward} onChange={(e) => setForm({ ...form, squadReward: e.target.value })} /></label>
            </div>
            <div className="dunda-toggle-grid">
              <label><input type="checkbox" checked={form.allowSquads} onChange={(e) => setForm({ ...form, allowSquads: e.target.checked })} /><span><Users size={18} /><strong>Squads</strong><small>Let guests recruit their crew.</small></span></label>
              <label><input type="checkbox" checked={form.allowGifting} onChange={(e) => setForm({ ...form, allowGifting: e.target.checked })} /><span><Gift size={18} /><strong>Gifting</strong><small>Sell extra moments and upgrades.</small></span></label>
              <label><input type="checkbox" checked={form.showAttendees} onChange={(e) => setForm({ ...form, showAttendees: e.target.checked })} /><span><Sparkles size={18} /><strong>Attendee wall</strong><small>Create social proof publicly.</small></span></label>
            </div>
          </section>

          {error && <div className="dunda-form-error">{error}</div>}
          <button className="dunda-btn primary create-dunda-submit" disabled={saving}>{saving ? 'Publishing your Dunda...' : 'Publish event and get share link'}</button>
        </div>

        <aside className="create-dunda-preview">
          <div className="create-dunda-preview-card">
            <span className="dunda-live-pill">LIVE PREVIEW</span>
            <div><small>{form.theme}</small><h2>{form.title || 'YOUR EVENT'}</h2><p>{form.eventDate || 'Date and time'} · {form.location || 'Location'}</p></div>
          </div>
          <div className="create-dunda-preview-note"><Trophy size={19} /><span><strong>Built to trend</strong>Squads, gifts and the Dunda meter are designed into the event—not added later.</span></div>
        </aside>
      </div>
    </form>
  );
}
