import { projectCompletion, getMilesByType } from '../utils/calculations';
import './PlanAnalysis.css';

export default function PlanAnalysis({ activities, weeklyPlan }) {
  const projection = projectCompletion(activities, weeklyPlan);
  const milesByType = getMilesByType(activities);

  return (
    <div className="plan-analysis">
      <h2>Plan Analysis</h2>

      <div className={`analysis-card ${projection.onTrack ? 'on-track' : 'needs-adjustment'}`}>
        <div className="analysis-message">{projection.message}</div>

        <div className="analysis-grid">
          <div className="metric">
            <div className="metric-label">Projected Total</div>
            <div className="metric-value">{projection.projectedTotal} mi</div>
          </div>

          <div className="metric">
            <div className="metric-label">Weekly Plan</div>
            <div className="metric-value">{projection.weeklyMiles} mi</div>
          </div>

          <div className="metric">
            <div className="metric-label">Miles Remaining</div>
            <div className="metric-value">{projection.remaining} mi</div>
          </div>

          <div className="metric">
            <div className="metric-label">Days Left</div>
            <div className="metric-value">{projection.daysRemaining}</div>
          </div>

          <div className="metric">
            <div className="metric-label">Weeks Left</div>
            <div className="metric-value">{projection.weeksRemaining}</div>
          </div>

          <div className="metric">
            <div className="metric-label">Needed Weekly</div>
            <div className="metric-value">{projection.neededPerWeek} mi</div>
          </div>
        </div>

        {projection.extraPerWeek !== 0 && (
          <div className={`adjustment ${projection.extraPerWeek > 0 ? 'increase' : 'buffer'}`}>
            {projection.extraPerWeek > 0
              ? `Need +${projection.extraPerWeek} mi/week to adjust plan`
              : `${Math.abs(projection.extraPerWeek)} mi/week buffer built in`
            }
          </div>
        )}
      </div>

      {Object.keys(milesByType).length > 0 && (
        <div className="type-breakdown">
          <h3>Miles by Type</h3>
          <div className="breakdown-grid">
            {Object.entries(milesByType).map(([type, miles]) => (
              <div key={type} className={`breakdown-item type-${type}`}>
                <div className="breakdown-type">{type}</div>
                <div className="breakdown-miles">{miles.toFixed(1)} mi</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
