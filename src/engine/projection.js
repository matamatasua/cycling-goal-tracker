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

// Get the Monday-based week number for a date in the year
function getWeekNumber(date) {
  const d = new Date(date)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const dayOffset = yearStart.getDay() === 0 ? 6 : yearStart.getDay() - 1
  return Math.floor((getDayOfYear(d) + dayOffset) / 7)
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
    return { pScore, recoveryFactor: 0, accent: 'var(--accent-green)', glow: 'var(--accent-green-glow)', haloClass: 'hex-halo-high' }
  }

  const requiredDailyPace = (goal - totalMiles) / daysRemaining
  const weeklyPlanDaily = getWeeklyPlanTotal(weeklyPlan) / 7
  const referencePace = Math.max(dailyAvg, weeklyPlanDaily, 0.1)
  const recoveryFactor = requiredDailyPace / referencePace

  if (recoveryFactor <= 1.0) {
    return { pScore, recoveryFactor, accent: 'var(--accent-green)', glow: 'var(--accent-green-glow)', haloClass: 'hex-halo-high' }
  }
  if (recoveryFactor <= 1.5) {
    return { pScore, recoveryFactor, accent: 'var(--accent-orange)', glow: 'var(--accent-orange-glow)', haloClass: 'hex-halo-mid' }
  }
  return { pScore, recoveryFactor, accent: 'var(--accent-red)', glow: 'var(--accent-red-glow)', haloClass: 'hex-halo-low' }
}

