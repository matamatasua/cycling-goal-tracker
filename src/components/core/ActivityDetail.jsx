function formatDuration(seconds) {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s}s`
}

export default function ActivityDetail({ activity, onClose }) {
  if (!activity) return null

  const date = new Date(activity.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const stats = [
    { label: 'DISTANCE', value: `${activity.miles} mi` },
    { label: 'DATE', value: date },
    { label: 'MOVING TIME', value: formatDuration(activity.moving_time) },
    { label: 'AVG SPEED', value: activity.avg_speed ? `${activity.avg_speed} mph` : null },
    { label: 'MAX SPEED', value: activity.max_speed ? `${activity.max_speed} mph` : null },
    { label: 'ELEVATION', value: activity.elevation_gain != null ? `${activity.elevation_gain.toLocaleString()} ft` : null },
    { label: 'AVG HR', value: activity.avg_heartrate ? `${activity.avg_heartrate} bpm` : null },
    { label: 'MAX HR', value: activity.max_heartrate ? `${activity.max_heartrate} bpm` : null },
    { label: 'SUFFER SCORE', value: activity.suffer_score },
  ].filter(s => s.value != null)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <h3 className="modal-title">{activity.notes || 'Ride'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-badges">
          <span className="modal-type-badge" style={{ background: `var(--color-${activity.type || 'road'})` }}>
            {(activity.type || 'road').toUpperCase()}
          </span>
          <span className="modal-source-badge">
            {activity.source === 'strava' ? 'STRAVA' : 'MANUAL'}
          </span>
        </div>

        <div className="modal-body">
          {stats.map(({ label, value }) => (
            <div key={label} className="modal-stat-row">
              <span className="modal-stat-label">{label}</span>
              <span className="modal-stat-value data-text">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
