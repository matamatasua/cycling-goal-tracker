import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../../contexts/DataContext'
import { getTotalMiles, getDayOfYear, getDaysInYear, getWeeklyPlanTotal } from '../../engine/projection'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export default function DriftVector() {
  const { activities, goal, weeklyPlan } = useData()

  const chartData = useMemo(() => {
    const daysInYear = getDaysInYear()
    const dailyPace = goal / daysInYear
    const today = new Date()
    const dayOfYear = getDayOfYear(today)
    const totalMiles = getTotalMiles(activities)
    const weeklyPlanMiles = getWeeklyPlanTotal(weeklyPlan)
    const dailyAvg = dayOfYear > 0 ? totalMiles / dayOfYear : 0

    // Build cumulative actuals by date
    const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date))
    const byDate = {}
    sorted.forEach(a => {
      byDate[a.date] = (byDate[a.date] || 0) + a.miles
    })
    let cumActual = 0
    const actualByDate = {}
    Object.keys(byDate).sort().forEach(date => {
      cumActual += byDate[date]
      actualByDate[date] = Math.round(cumActual * 10) / 10
    })

    // Build exactly 12 monthly points + Dec 31
    const points = []

    for (let m = 0; m < 12; m++) {
      const date = new Date(2026, m, 1)
      const dateStr = date.toISOString().split('T')[0]
      const day = getDayOfYear(date)
      const isPast = day <= dayOfYear

      const point = {
        month: MONTHS[m],
        target: Math.round(dailyPace * day),
        trend: Math.round(dailyAvg * day),
      }

      // Actual: find closest actual data on or before this month's 1st
      if (isPast) {
        const closest = Object.keys(actualByDate)
          .filter(d => d <= dateStr)
          .sort()
          .pop()
        if (closest) {
          point.actual = actualByDate[closest]
        }
      }

      // Plan projection: only for future months
      if (!isPast) {
        const daysFromToday = day - dayOfYear
        const weeksFromToday = daysFromToday / 7
        point.planProjected = Math.round(totalMiles + weeklyPlanMiles * weeksFromToday)
      }

      // Bridge point: current month gets both actual and plan start
      if (isPast && m < 11) {
        const nextDate = new Date(2026, m + 1, 1)
        const nextDay = getDayOfYear(nextDate)
        if (nextDay > dayOfYear) {
          // This is the current month — add planProjected at current total for handoff
          point.planProjected = Math.round(totalMiles)
        }
      }

      points.push(point)
    }

    // Dec 31
    points.push({
      month: 'Dec 31',
      target: goal,
      trend: Math.round(dailyAvg * daysInYear),
      planProjected: Math.round(totalMiles + weeklyPlanMiles * ((daysInYear - dayOfYear) / 7)),
    })

    return points
  }, [activities, goal, weeklyPlan])

  const totalMiles = useMemo(() => getTotalMiles(activities), [activities])
  const expected = useMemo(() => {
    const dayOfYear = getDayOfYear()
    return (goal / getDaysInYear()) * dayOfYear
  }, [goal])
  const driftPercent = expected > 0 ? ((totalMiles - expected) / expected) * 100 : 0

  return (
    <div className="drift-container">
      <div className="drift-header">
        <span className="drift-indicator data-text" style={{ color: driftPercent >= 0 ? 'var(--accent-cyan)' : 'var(--accent-amber)' }}>
          {driftPercent >= 0 ? '+' : ''}{driftPercent.toFixed(1)}% DRIFT
        </span>
      </div>

      <div className="drift-chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.9)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${Math.round(value).toLocaleString()} mi`, name]}
            />

            {/* White line: monthly target pace */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#FFFFFF"
              strokeWidth={1.5}
              dot={false}
              name="Target"
              connectNulls
            />

            {/* Amber dotted: current trend extrapolated */}
            <Line
              type="monotone"
              dataKey="trend"
              stroke="var(--accent-amber)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="Trend"
              connectNulls
            />

            {/* Solid green: actual miles to date */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--accent-green)"
              strokeWidth={2.5}
              dot={false}
              name="Actual"
              connectNulls
            />

            {/* Dashed green: projected from weekly plan */}
            <Line
              type="monotone"
              dataKey="planProjected"
              stroke="var(--accent-green)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              name="Plan"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="drift-legend">
        <span className="drift-legend-item">
          <span className="drift-legend-line" style={{ background: '#FFFFFF' }} />
          TARGET
        </span>
        <span className="drift-legend-item">
          <span className="drift-legend-line drift-legend-dotted" style={{ borderColor: 'var(--accent-amber)' }} />
          TREND
        </span>
        <span className="drift-legend-item">
          <span className="drift-legend-line" style={{ background: 'var(--accent-green)' }} />
          ACTUAL
        </span>
        <span className="drift-legend-item">
          <span className="drift-legend-line drift-legend-dashed" style={{ borderColor: 'var(--accent-green)' }} />
          PLAN
        </span>
      </div>
    </div>
  )
}
