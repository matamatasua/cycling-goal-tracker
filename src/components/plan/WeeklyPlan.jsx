import { useData } from '../../contexts/DataContext'
import { getWeeklyPlanTotal } from '../../engine/projection'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function WeeklyPlan() {
  const { weeklyPlan, updatePlanDay } = useData()
  const total = getWeeklyPlanTotal(weeklyPlan)

  return (
    <div className="plan-container">
      <div className="plan-header">
        <span className="plan-total data-text">{total} MI/WEEK</span>
      </div>

      <div className="plan-days">
        {DAYS.map((day, i) => {
          const dayData = weeklyPlan[day] || { miles: 0 }
          return (
            <div key={day} className="plan-day glass-panel">
              <span className="plan-day-label">{DAY_LABELS[i]}</span>
              <input
                type="number"
                value={dayData.miles}
                onChange={e => updatePlanDay(day, { miles: Number(e.target.value) || 0 })}
                className="plan-day-miles data-text"
                min="0"
                max="999"
                step="1"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
