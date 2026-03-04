const YEAR = 2026
const GOAL = 5000

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getDaysInYear(year = YEAR) {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365
}

export function getDaysRemaining(date = new Date()) {
  return getDaysInYear(date.getFullYear()) - getDayOfYear(date)
}

export function getExpectedPace(date = new Date(), goal = GOAL) {
  const dayOfYear = getDayOfYear(date)
  const daysInYear = getDaysInYear(date.getFullYear())
  return (goal / daysInYear) * dayOfYear
}

export function getTotalMiles(activities) {
  return activities.reduce((sum, a) => sum + (a.miles || 0), 0)
}

export function getMilesByType(activities) {
  return activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + (a.miles || 0)
    return acc
  }, {})
}

// Get the Monday-based week number for a date in the year
function getWeekNumber(date) {
  const d = new Date(date)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const dayOffset = yearStart.getDay() === 0 ? 6 : yearStart.getDay() - 1
  return Math.floor((getDayOfYear(d) + dayOffset) / 7)
}

// Get the start date (Monday) of a given week number
function getWeekStartDate(weekNum, year = YEAR) {
  const yearStart = new Date(year, 0, 1)
  const dayOffset = yearStart.getDay() === 0 ? 6 : yearStart.getDay() - 1
  const daysToAdd = (weekNum * 7) - dayOffset
  const weekStart = new Date(year, 0, 1 + daysToAdd)
  return weekStart.toISOString().split('T')[0]
}

// Group activities into weekly totals
export function getWeeklyActuals(activities) {
  const weekMap = {}
  activities.forEach(a => {
    const week = getWeekNumber(new Date(a.date))
    weekMap[week] = (weekMap[week] || 0) + a.miles
  })
  return weekMap
}

// Get weekly plan total
export function getWeeklyPlanTotal(weeklyPlan) {
  return Object.values(weeklyPlan).reduce((sum, day) => sum + (day.miles || 0), 0)
}

// Build full 52-week projection
// Returns array of { week, weekStart, actual, projected, cumActual, cumProjected }
export function buildWeeklyProjection(activities, weeklyPlan, adjustments = []) {
  const now = new Date()
  const currentWeek = getWeekNumber(now)
  const totalWeeks = 52
  const weeklyActuals = getWeeklyActuals(activities)
  const basePlanMiles = getWeeklyPlanTotal(weeklyPlan)

  let cumActual = 0
  let cumProjected = 0
  const weeks = []

  for (let w = 0; w <= totalWeeks; w++) {
    const weekStart = getWeekStartDate(w)
    const actualMiles = weeklyActuals[w] || 0

    if (w <= currentWeek) {
      // Past/current week: use actuals
      cumActual += actualMiles
      cumProjected += actualMiles
      weeks.push({
        week: w,
        weekStart,
        actual: Math.round(actualMiles * 10) / 10,
        projected: null,
        cumActual: Math.round(cumActual * 10) / 10,
        cumProjected: Math.round(cumProjected * 10) / 10,
      })
    } else {
      // Future week: use plan + adjustments
      const adjustedMiles = getAdjustedMilesForWeek(weekStart, basePlanMiles, adjustments)
      cumProjected += adjustedMiles
      weeks.push({
        week: w,
        weekStart,
        actual: null,
        projected: Math.round(adjustedMiles * 10) / 10,
        cumActual: null,
        cumProjected: Math.round(cumProjected * 10) / 10,
      })
    }
  }

  return weeks
}

// Get adjusted miles for a specific week based on scenario adjustments
function getAdjustedMilesForWeek(weekStart, baseMiles, adjustments) {
  const weekDate = new Date(weekStart)
  let miles = baseMiles

  // Sort by priority: time_off > set_weekly > boost
  const sorted = [...adjustments].sort((a, b) => {
    const priority = { time_off: 0, set_weekly: 1, boost: 2 }
    return (priority[a.type] ?? 3) - (priority[b.type] ?? 3)
  })

  for (const adj of sorted) {
    const start = new Date(adj.start_date)
    const end = new Date(adj.end_date)

    if (weekDate >= start && weekDate <= end) {
      if (adj.type === 'time_off') {
        return 0
      } else if (adj.type === 'set_weekly') {
        miles = adj.miles_per_week
      } else if (adj.type === 'boost') {
        miles += adj.miles_per_week
      }
    }
  }

  return miles
}

// Build cumulative data for chart (actual data points)
export function getCumulativeData(activities) {
  const sorted = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date))
  let cumulative = 0
  const byDate = {}

  sorted.forEach(a => {
    byDate[a.date] = (byDate[a.date] || 0) + a.miles
  })

  return Object.keys(byDate).sort().map(date => {
    cumulative += byDate[date]
    return { date, actual: Math.round(cumulative * 10) / 10 }
  })
}

// Recovery factor: how much harder do you need to ride vs your reference pace?
// Returns color info for pScore display based on feasibility, not fixed thresholds.
export function getRecoveryColor(activities, goal, weeklyPlan) {
  const totalMiles = getTotalMiles(activities)
  const dayOfYear = getDayOfYear()
  const daysInYear = getDaysInYear()
  const daysRemaining = daysInYear - dayOfYear
  const dailyAvg = dayOfYear > 0 ? totalMiles / dayOfYear : 0
  const projectedTotal = Math.round(dailyAvg * daysInYear)
  const pScore = Math.min(100, Math.max(0, Math.round((projectedTotal / goal) * 100)))

  // Already at or above goal
  if (totalMiles >= goal || daysRemaining <= 0) {
    return { pScore, recoveryFactor: 0, accent: 'var(--accent-cyan)', glow: 'var(--accent-cyan-glow)', haloClass: 'hex-halo-high' }
  }

  const requiredDailyPace = (goal - totalMiles) / daysRemaining
  const weeklyPlanDaily = getWeeklyPlanTotal(weeklyPlan) / 7
  const referencePace = Math.max(dailyAvg, weeklyPlanDaily, 0.1)
  const recoveryFactor = requiredDailyPace / referencePace

  if (recoveryFactor <= 1.0) {
    return { pScore, recoveryFactor, accent: 'var(--accent-cyan)', glow: 'var(--accent-cyan-glow)', haloClass: 'hex-halo-high' }
  }
  if (recoveryFactor <= 1.5) {
    return { pScore, recoveryFactor, accent: 'var(--accent-amber)', glow: 'var(--accent-amber-glow)', haloClass: 'hex-halo-mid' }
  }
  return { pScore, recoveryFactor, accent: 'var(--accent-red)', glow: 'var(--accent-red-glow)', haloClass: 'hex-halo-low' }
}

// Build target pace line for full year
export function getPaceLineData(goal = GOAL) {
  const daysInYear = getDaysInYear()
  const dailyPace = goal / daysInYear
  const milestones = [
    '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01',
    '2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01',
    '2026-09-01', '2026-10-01', '2026-11-01', '2026-12-01', '2026-12-31'
  ]

  return milestones.map(dateStr => {
    const dayOfYear = getDayOfYear(new Date(dateStr))
    return { date: dateStr, pace: Math.round(dailyPace * dayOfYear) }
  })
}
