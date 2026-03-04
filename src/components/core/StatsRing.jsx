import { useMemo, useState, useEffect, useRef } from 'react'
import { useData } from '../../contexts/DataContext'
import { getTotalMiles, getExpectedPace, getDaysRemaining, getWeeklyPlanTotal, getDayOfYear, getDaysInYear, getRecoveryColor } from '../../engine/projection'
import ProbabilityHex from './ProbabilityHex'

const RING_STATS = [
  { key: 'totalMiles', label: 'MILES', angle: 270 },
  { key: 'projectedTotal', label: 'PROJECTED', angle: 330 },
  { key: 'diff', label: 'VS EXPECTED', angle: 30 },
  { key: 'currentPace', label: 'WK AVG', angle: 90 },
  { key: 'weeklyPlanMiles', label: 'WK PLAN', angle: 150 },
  { key: 'daysRemaining', label: 'DAYS LEFT', angle: 210 },
]

const STAT_TIPS = {
  pScore: { blurb: 'Your probability of hitting the goal based on current pace vs. what\'s needed. Green = on track, orange = stretch, red = need to ramp up.', label: 'pScore' },
  totalMiles: { blurb: 'Total miles ridden this year across all activities.', label: 'Total Miles' },
  projectedTotal: { blurb: 'Where you\'ll end up by Dec 31 if you keep your current daily average.', label: 'Projected Total' },
  diff: { blurb: 'How far ahead or behind you are compared to a perfectly even pace to the goal.', label: 'vs Expected' },
  currentPace: { blurb: 'Your average miles per week based on actual riding so far.', label: 'Weekly Avg' },
  weeklyPlanMiles: { blurb: 'Total miles planned per week from your weekly plan.', label: 'Weekly Plan' },
  daysRemaining: { blurb: 'Calendar days left in the year to reach your goal.', label: 'Days Left' },
}

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

    const remaining = Math.max(0, Math.round(goal - totalMiles))
    return { totalMiles: Math.round(totalMiles), projectedTotal, diff, currentPace, weeklyPlanMiles, daysRemaining, remaining }
  }, [activities, goal, weeklyPlan])

  const [activeTip, setActiveTip] = useState(null)
  const holdingRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!activeTip) return
    timerRef.current = setTimeout(() => {
      if (!holdingRef.current) setActiveTip(null)
    }, 5000)
    return () => clearTimeout(timerRef.current)
  }, [activeTip])

  const holdProps = {
    onMouseDown: () => { holdingRef.current = true },
    onMouseUp: () => { holdingRef.current = false },
    onTouchStart: () => { holdingRef.current = true },
    onTouchEnd: () => { holdingRef.current = false },
  }

  function openTip(key, e) {
    e.stopPropagation()
    setActiveTip(activeTip === key ? null : key)
  }

  const radius = 150

  return (
    <div className="stats-ring-wrapper" onClick={() => setActiveTip(null)}>
      <div className="stats-ring">
        <div className={`stats-ring-center${activeTip === 'pScore' ? ' stats-ring-center-active' : ''}`} onClick={e => openTip('pScore', e)}>
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
              className={`stats-ring-item glass-panel${activeTip === key ? ' stats-ring-item-active' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                '--stat-color': key === 'totalMiles' ? recovery.accent
                  : key === 'diff' ? (value >= 0 ? 'var(--accent-green)' : 'var(--accent-red)')
                  : 'var(--text-primary)',
              }}
              onClick={e => openTip(key, e)}
            >
              <span className="stats-ring-value data-text" style={{ color: 'var(--stat-color)' }}>
                {formattedValue}
              </span>
              <span className="stats-ring-label">{label}</span>
            </div>
          )
        })}
      </div>
      <div className="stats-ring-goal data-text">
        <span className="stats-ring-goal-remaining">{stats.remaining.toLocaleString()}</span>
        {' left to '}
        <span className="stats-ring-goal-total">{goal.toLocaleString()}</span>
        {' Goal'}
      </div>
      {activeTip && STAT_TIPS[activeTip] && (
        <div className="stats-ring-tip" {...holdProps}>
          {STAT_TIPS[activeTip].blurb}
          {' '}
          <span className="stats-ring-tip-stat data-text">
            Your {STAT_TIPS[activeTip].label} = {
              activeTip === 'pScore' ? `${recovery.pScore}%`
                : activeTip === 'diff' ? `${stats.diff >= 0 ? '+' : ''}${stats.diff} mi`
                : activeTip === 'daysRemaining' ? `${stats.daysRemaining} days`
                : `${(stats[activeTip] ?? '').toLocaleString()} mi`
            }
          </span>
        </div>
      )}
    </div>
  )
}
