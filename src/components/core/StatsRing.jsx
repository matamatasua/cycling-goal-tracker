import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { getTotalMiles, getExpectedPace, getDaysRemaining, getWeeklyPlanTotal, getDayOfYear, getDaysInYear, getRecoveryColor } from '../../engine/projection'
import ProbabilityHex from './ProbabilityHex'

const RING_STATS = [
  { key: 'totalMiles', label: 'MILES', angle: 270 },
  { key: 'projectedTotal', label: 'PROJECTED', angle: 330 },
  { key: 'diff', label: 'VS EXPECTED', angle: 30 },
  { key: 'currentPace', label: 'MI/WK AVG', angle: 90 },
  { key: 'weeklyPlanMiles', label: 'MI/WK PLAN', angle: 150 },
  { key: 'daysRemaining', label: 'DAYS LEFT', angle: 210 },
]

export default function StatsRing() {
  const { activities, goal, weeklyPlan } = useData()

  const recovery = useMemo(() => getRecoveryColor(activities, goal, weeklyPlan), [activities, goal, weeklyPlan])

  const stats = useMemo(() => {
    const totalMiles = getTotalMiles(activities)
    const expected = getExpectedPace(new Date(), goal)
    const diff = Math.round((totalMiles - expected) * 10) / 10
    const daysRemaining = getDaysRemaining()
    const weeklyPlanMiles = getWeeklyPlanTotal(weeklyPlan)
    const dayOfYear = getDayOfYear()
    const daysInYear = getDaysInYear()
    const dailyAvg = dayOfYear > 0 ? totalMiles / dayOfYear : 0
    const projectedTotal = Math.round(dailyAvg * daysInYear)
    const weeksElapsed = dayOfYear / 7
    const currentPace = weeksElapsed > 0 ? Math.round((totalMiles / weeksElapsed) * 10) / 10 : 0

    return { totalMiles: Math.round(totalMiles), projectedTotal, diff, currentPace, weeklyPlanMiles, daysRemaining }
  }, [activities, goal, weeklyPlan])

  const radius = 150

  return (
    <div className="stats-ring">
      <div className="stats-ring-center">
        <ProbabilityHex />
      </div>
      {RING_STATS.map(({ key, label, angle }) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        const value = stats[key]
        const formattedValue = key === 'diff'
          ? `${value >= 0 ? '+' : ''}${value}`
          : key === 'totalMiles' || key === 'projectedTotal'
            ? value.toLocaleString()
            : value

        return (
          <div
            key={key}
            className="stats-ring-item glass-panel"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              '--stat-color': key === 'totalMiles' ? recovery.accent
                : key === 'diff' ? (value >= 0 ? 'var(--accent-cyan)' : 'var(--accent-red)')
                : 'var(--text-primary)',
            }}
          >
            <span className="stats-ring-value data-text" style={{ color: 'var(--stat-color)' }}>
              {formattedValue}
            </span>
            <span className="stats-ring-label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
