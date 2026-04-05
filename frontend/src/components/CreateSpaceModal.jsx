import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client.js';

const themes = ['Galaxy', 'Savannah', 'Ocean', 'Neon City', 'Lantern Sky'];
const visibilityModes = ['Names + Amounts', 'Names Only', 'Hidden Publicly'];

export function CreateSpaceModal({ open, mode = 'card', onClose, onCreated }) {
  const [form, setForm] = useState({
    type: mode,
    title: '',
    description: '',
    theme: 'Galaxy',
    goal: 25000,
    visibilityMode: 'Names Only',
    location: 'Nairobi',
    eventDate: '10 Jul 2026',
    price: 3000,
    primary: mode === 'event' ? 'M-Pesa Paybill 654321' : 'M-Pesa Till 123456',
    backup: 'Bank transfer available',
    diaspora: 'PayPal enabled',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setForm((current) => ({
      ...current,
      type: mode,
      primary: mode === 'event' ? 'M-Pesa Paybill 654321' : 'M-Pesa Till 123456',
    }));
  }, [mode]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        title: form.title,
        description: form.description,
        theme: form.theme,
        goal: Number(form.goal || 0),
        visibilityMode: form.visibilityMode,
        location: form.location,
        eventDate: form.eventDate,
        price: Number(form.price || 0),
        paymentInstructions: {
          primary: form.primary,
          backup: form.backup,
          diaspora: form.diaspora,
        },
      };
      const res = await api.post('/spaces', payload);
      onCreated(res.data.space);
      onClose();
      setForm({
        type: mode,
        title: '',
        description: '',
        theme: 'Galaxy',
        goal: 25000,
        visibilityMode: 'Names Only',
        location: 'Nairobi',
        eventDate: '10 Jul 2026',
        price: 3000,
        primary: mode === 'event' ? 'M-Pesa Paybill 654321' : 'M-Pesa Till 123456',
        backup: 'Bank transfer available',
        diaspora: 'PayPal enabled',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create space.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="row-between gap-12 modal-header">
          <div>
            <h2>Create {mode === 'event' ? 'Event' : 'Card'}</h2>
            <p>Keep it simple: fill the essentials and publish instantly.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="form-grid scroll-area" onSubmit={submit}>
          <div className="field field-span-2">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={mode === 'event' ? 'Community Dinner Night' : 'Mary’s Graduation Fund'} />
          </div>
          <div className="field field-span-2">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the celebration, contribution need, or paid event." />
          </div>
          <div className="field">
            <label>Theme</label>
            <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>{themes.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="field">
            <label>Visibility</label>
            <select value={form.visibilityMode} onChange={(e) => setForm({ ...form, visibilityMode: e.target.value })}>{visibilityModes.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="field">
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Nairobi" />
          </div>
          <div className="field">
            <label>Date</label>
            <input value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} placeholder="10 Jul 2026" />
          </div>
          {mode === 'event' ? (
            <div className="field field-span-2">
              <label>Ticket Price</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          ) : (
            <div className="field field-span-2">
              <label>Goal</label>
              <input type="number" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </div>
          )}
          <div className="field">
            <label>Primary payment</label>
            <input value={form.primary} onChange={(e) => setForm({ ...form, primary: e.target.value })} />
          </div>
          <div className="field">
            <label>Backup payment</label>
            <input value={form.backup} onChange={(e) => setForm({ ...form, backup: e.target.value })} />
          </div>
          <div className="field field-span-2">
            <label>Diaspora option</label>
            <input value={form.diaspora} onChange={(e) => setForm({ ...form, diaspora: e.target.value })} />
          </div>
          {error ? <div className="alert alert-error field-span-2">{error}</div> : null}
          <div className="row gap-12 field-span-2">
            <button className="button primary" disabled={saving}>{saving ? 'Saving...' : 'Create Now'}</button>
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
