import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'

function getWeekKey(dateStr) {
  const d = new Date(dateStr)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.floor(((d - yearStart) / (1000 * 60 * 60 * 24) + yearStart.getDay()) / 7)
  return weekNum
}

export default function ActivityFeed({ onSelectActivity }) {
  const { activities } = useData()
  const [showAll, setShowAll] = useState(false)

  const grouped = useMemo(() => {
    const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date))
    const display = showAll ? sorted : sorted.slice(0, 20)

    const groups = []
    let currentWeek = null
    let currentGroup = null

    display.forEach(a => {
      const week = getWeekKey(a.date)
      if (week !== currentWeek) {
        currentWeek = week
        currentGroup = { week, activities: [], total: 0 }
        groups.push(currentGroup)
      }
      currentGroup.activities.push(a)
      currentGroup.total += a.miles
    })

    return groups
  }, [activities, showAll])

  if (activities.length === 0) {
    return (
      <div className="feed-empty">
        <p className="text-muted">No activities synced yet. Hit SYNC to pull from Strava.</p>
      </div>
    )
  }

  return (
    <div className="feed-container">
      {grouped.map(group => (
        <div key={group.week} className="feed-week">
          <div className="feed-week-header">
            <span className="feed-week-total data-text">
              {Math.round(group.total * 10) / 10} mi
            </span>
          </div>

          {group.activities.map(a => (
            <div key={a.id} className="feed-activity" onClick={() => onSelectActivity?.(a)}>
              <div className="feed-activity-info">
                <span className="feed-activity-name">{a.notes || 'Ride'}</span>
                <span className="feed-activity-date data-text">
                  {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className="feed-activity-miles data-text">
                {a.miles} mi
              </span>
            </div>
          ))}
        </div>
      ))}

      {activities.length > 20 && !showAll && (
        <button className="feed-show-all" onClick={() => setShowAll(true)}>
          SHOW ALL ({activities.length} ACTIVITIES)
        </button>
      )}
    </div>
  )
}
