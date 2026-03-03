const GOAL = 5000;
const YEAR = 2026;

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDaysInYear(year = YEAR) {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
}

export function getDaysRemaining(date = new Date()) {
  return getDaysInYear(date.getFullYear()) - getDayOfYear(date);
}

export function getExpectedPace(date = new Date(), goal = GOAL) {
  const dayOfYear = getDayOfYear(date);
  const daysInYear = getDaysInYear(date.getFullYear());
  return (goal / daysInYear) * dayOfYear;
}

export function getTotalMiles(activities) {
  return activities.reduce((sum, a) => sum + (a.miles || 0), 0);
}

export function getMilesByType(activities) {
  return activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + (a.miles || 0);
    return acc;
  }, {});
}

export function getPaceStatus(activities, goal = GOAL) {
  const total = getTotalMiles(activities);
  const expected = getExpectedPace();
  const diff = total - expected;
  return {
    total,
    expected: Math.round(expected * 10) / 10,
    diff: Math.round(diff * 10) / 10,
    percentage: Math.round((total / goal) * 1000) / 10,
    status: diff >= 0 ? 'ahead' : 'behind',
  };
}

export function getWeeklyPlanTotal(weeklyPlan) {
  return Object.values(weeklyPlan).reduce((sum, day) => sum + (day.miles || 0), 0);
}

export function projectCompletion(activities, weeklyPlan, goal = GOAL) {
  const total = getTotalMiles(activities);
  const remaining = goal - total;
  const weeklyMiles = getWeeklyPlanTotal(weeklyPlan);
  const daysRemaining = getDaysRemaining();
  const weeksRemaining = daysRemaining / 7;

  if (remaining <= 0) {
    return { onTrack: true, message: 'Goal already reached!', projectedTotal: total, surplus: total - goal };
  }

  if (weeklyMiles === 0) {
    return { onTrack: false, message: 'No weekly plan set.', projectedTotal: total, deficit: remaining };
  }

  const weeksToFinish = remaining / weeklyMiles;
  const projectedTotal = total + (weeklyMiles * weeksRemaining);
  const extraPerWeek = Math.round((remaining / weeksRemaining - weeklyMiles) * 10) / 10;

  return {
    onTrack: projectedTotal >= goal,
    projectedTotal: Math.round(projectedTotal),
    weeklyMiles,
    neededPerWeek: Math.round((remaining / weeksRemaining) * 10) / 10,
    extraPerWeek,
    daysRemaining,
    weeksRemaining: Math.round(weeksRemaining * 10) / 10,
    remaining: Math.round(remaining),
    message: projectedTotal >= goal
      ? `On track! With current plan (${weeklyMiles}mi/week), you'll hit ${goal} miles.`
      : `Need +${Math.abs(extraPerWeek)} more miles/week to hit ${goal}.`,
  };
}

export function getCumulativeData(activities) {
  const sorted = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date));
  let cumulative = 0;
  const data = [];
  const byDate = {};

  sorted.forEach(a => {
    const key = a.date;
    byDate[key] = (byDate[key] || 0) + a.miles;
  });

  Object.keys(byDate).sort().forEach(date => {
    cumulative += byDate[date];
    data.push({ date, actual: Math.round(cumulative * 10) / 10 });
  });

  return data;
}

export function getPaceLineData(goal = GOAL) {
  const daysInYear = getDaysInYear();
  const dailyPace = goal / daysInYear;
  const points = [];

  // Key milestone dates
  const milestones = [
    '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01',
    '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01', '2026-12-01', '2026-12-31'
  ];

  milestones.forEach(dateStr => {
    const date = new Date(dateStr);
    const dayOfYear = getDayOfYear(date);
    points.push({ date: dateStr, pace: Math.round(dailyPace * dayOfYear) });
  });

  return points;
}
