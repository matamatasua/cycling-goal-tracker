import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function formatDate(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getWeekDates() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)

  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(formatDate(d))
  }
  return dates
}

export default function WeekActual() {
  const { activities, weeklyPlan } = useData()
  const todayStr = formatDate(new Date())

  const weekData = useMemo(() => {
    const dates = getWeekDates()

    const actualByDate = {}
    activities.forEach(a => {
      if (dates.includes(a.date)) {
        actualByDate[a.date] = (actualByDate[a.date] || 0) + (a.miles || 0)
      }
    })

    return dates.map((date, i) => {
      const planned = weeklyPlan[DAYS[i]]?.miles || 0
      const actual = Math.round((actualByDate[date] || 0) * 10) / 10
      const isFuture = date > todayStr
      const isToday = date === todayStr
      const met = !isFuture && actual >= planned && planned > 0

      return { dayLabel: DAY_LABELS[i], date, planned, actual, isFuture, isToday, met }
    })
  }, [activities, weeklyPlan, todayStr])

  const totals = useMemo(() => {
    return weekData.reduce(
      (acc, day) => {
        acc.planned += day.planned
        if (!day.isFuture) acc.actual += day.actual
        return acc
      },
      { planned: 0, actual: 0 }
    )
  }, [weekData])

  return (
    <div className="week-actual-container">
      <div className="week-actual-header">
        <span className="section-title">THIS WEEK</span>
        <span className="week-actual-summary data-text">
          <span style={{ color: totals.actual >= totals.planned ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
            {Math.round(totals.actual * 10) / 10}
          </span>
          {' / '}
          {totals.planned} MI
        </span>
      </div>

      <div className="week-actual-progress">
        <div
          className="week-actual-progress-fill"
          style={{
            width: `${Math.min(100, totals.planned > 0 ? (totals.actual / totals.planned) * 100 : 0)}%`,
            background: totals.actual >= totals.planned ? 'var(--accent-green)' : 'var(--accent-orange)',
          }}
        />
      </div>

      <div className="week-actual-days">
        {weekData.map(day => (
          <div
            key={day.date}
            className={`week-actual-day${day.isFuture ? ' week-actual-day-future' : ''}${day.isToday ? ' week-actual-day-today' : ''}`}
          >
            <span className="week-actual-day-label">{day.dayLabel}</span>
            <span className="week-actual-day-planned data-text">{day.planned}</span>
            <span className="week-actual-day-divider">/</span>
            <span
              className="week-actual-day-actual data-text"
              style={{
                color: day.isFuture
                  ? 'var(--text-muted)'
                  : day.met
                    ? 'var(--accent-green)'
                    : day.actual > 0
                      ? 'var(--accent-orange)'
                      : 'var(--text-muted)',
              }}
            >
              {day.isFuture ? '--' : day.actual}
            </span>
            {!day.isFuture && day.met && (
              <span className="week-actual-day-check">&#x2713;</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
