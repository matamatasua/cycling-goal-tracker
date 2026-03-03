import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import './ActivityLog.css';

const TYPES = ['road', 'mtb', 'virtual'];

export default function ActivityLog({ activities, onAdd }) {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], miles: '', type: 'road', notes: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.miles || parseFloat(formData.miles) <= 0) return;

    onAdd({
      id: uuid(),
      date: formData.date,
      miles: parseFloat(formData.miles),
      type: formData.type,
      notes: formData.notes,
    });

    setFormData({ date: new Date().toISOString().split('T')[0], miles: '', type: 'road', notes: '' });
  };

  return (
    <div className="activity-log">
      <h2>Activity Log</h2>
      <form onSubmit={handleSubmit} className="log-form">
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="log-input"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Miles"
          value={formData.miles}
          onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
          className="log-input"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="log-select"
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="log-input"
        />
        <button type="submit" className="log-submit">Log Activity</button>
      </form>

      <div className="activities-list">
        {[...activities].reverse().map(a => (
          <div key={a.id} className={`activity-item type-${a.type}`}>
            <div className="activity-date">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div className="activity-miles">{a.miles}mi</div>
            <div className="activity-type">{a.type}</div>
            {a.notes && <div className="activity-notes">{a.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
