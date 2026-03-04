import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useData } from '../../contexts/DataContext'
import { getDaysInYear } from '../../engine/projection'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function MonthlyChart() {
  const { activities, goal } = useData()

  const chartData = useMemo(() => {
    const now = new Date()
    const currentYear = 2026
    const currentMonth = now.getFullYear() === currentYear
      ? now.getMonth()
      : now.getFullYear() > currentYear ? 11 : -1

    if (currentMonth < 0) return []

    const daysInYear = getDaysInYear(currentYear)
    const dailyPace = goal / daysInYear

    const monthlyActuals = {}
    activities.forEach(a => {
      const [year, month] = a.date.split('-')
      if (Number(year) === currentYear) {
        const m = Number(month) - 1
        monthlyActuals[m] = (monthlyActuals[m] || 0) + (a.miles || 0)
      }
    })

    const data = []
    for (let m = 0; m <= currentMonth; m++) {
      const daysInM = getDaysInMonth(currentYear, m)
      const target = Math.round(dailyPace * daysInM)
      const actual = Math.round((monthlyActuals[m] || 0) * 10) / 10

      data.push({ month: MONTHS[m], target, actual, met: actual >= target })
    }
    return data
  }, [activities, goal])

  if (chartData.length === 0) return null

  return (
    <div className="monthly-container">
      <div className="monthly-header">
        <span className="section-title">MONTHLY BREAKDOWN</span>
      </div>

      <div className="monthly-chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${Math.round(value)} mi`, name]}
            />
            <Bar dataKey="target" name="Target" fill="var(--border-medium)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="actual" name="Actual" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.met ? 'var(--accent-green)' : 'var(--accent-orange)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="monthly-legend">
        <span className="drift-legend-item">
          <span className="drift-legend-line" style={{ background: 'var(--border-medium)' }} />
          TARGET
        </span>
        <span className="drift-legend-item">
          <span className="drift-legend-line" style={{ background: 'var(--accent-green)' }} />
          ON PACE
        </span>
        <span className="drift-legend-item">
          <span className="drift-legend-line" style={{ background: 'var(--accent-orange)' }} />
          BEHIND
        </span>
      </div>
    </div>
  )
}
