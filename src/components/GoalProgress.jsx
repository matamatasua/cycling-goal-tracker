import { getTotalMiles, getPaceStatus } from '../utils/calculations';
import './GoalProgress.css';

export default function GoalProgress({ activities, goal = 5000 }) {
  const status = getPaceStatus(activities, goal);
  const miles = status.total;
  const percentage = (miles / goal) * 100;

  return (
    <div className="goal-progress">
      <div className="progress-visual">
        <svg viewBox="0 0 100 100" className="progress-ring">
          <circle cx="50" cy="50" r="45" className="progress-ring-bg" />
          <circle
            cx="50"
            cy="50"
            r="45"
            className={`progress-ring-fill status-${status.status}`}
            style={{ strokeDashoffset: 283 * (1 - percentage / 100) }}
          />
        </svg>
        <div className="progress-text">
          <div className="miles">{Math.round(miles)}</div>
          <div className="goal-text">of {goal} miles</div>
        </div>
      </div>
      <div className="progress-details">
        <div className={`status-badge status-${status.status}`}>
          {status.status === 'ahead' ? '✓ Ahead' : status.status === 'behind' ? '⚠ Behind' : 'On Pace'}
        </div>
        <div className="detail-row">
          <span>Expected pace:</span>
          <span className="value">{status.expected}mi</span>
        </div>
        <div className="detail-row">
          <span>Difference:</span>
          <span className={`value ${status.diff >= 0 ? 'positive' : 'negative'}`}>
            {status.diff > 0 ? '+' : ''}{status.diff}mi
          </span>
        </div>
        <div className="detail-row">
          <span>Completion:</span>
          <span className="value">{status.percentage}%</span>
        </div>
      </div>
    </div>
  );
}
