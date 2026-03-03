import './WeeklyPlan.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPES = ['road', 'mtb', 'virtual', 'rest'];

export default function WeeklyPlan({ plan, onUpdate }) {
  const handleChange = (day, field, value) => {
    const updated = { ...plan };
    updated[day] = { ...updated[day], [field]: value };
    onUpdate(updated);
  };

  const total = Object.values(plan).reduce((sum, day) => sum + (day.miles || 0), 0);

  return (
    <div className="weekly-plan">
      <h2>Weekly Plan ({total} miles/week)</h2>
      <div className="plan-grid">
        {DAYS.map((day, idx) => {
          const dayData = plan[day] || { miles: 0, type: 'rest' };
          return (
            <div key={day} className="plan-day">
              <div className="day-label">{DAY_NAMES[idx]}</div>
              <input
                type="number"
                min="0"
                step="1"
                value={dayData.miles || 0}
                onChange={(e) => handleChange(day, 'miles', parseFloat(e.target.value) || 0)}
                className="plan-miles"
                placeholder="Miles"
              />
              <select
                value={dayData.type || 'rest'}
                onChange={(e) => handleChange(day, 'type', e.target.value)}
                className={`plan-type type-${dayData.type}`}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
