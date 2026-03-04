import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { getRecoveryColor } from '../../engine/projection'

export default function ProbabilityHex() {
  const { activities, goal, weeklyPlan } = useData()

  const { pScore, accent, glow, haloClass } = useMemo(
    () => getRecoveryColor(activities, goal, weeklyPlan),
    [activities, goal, weeklyPlan]
  )

  const hexSize = 100
  const cx = 120
  const cy = 120
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return `${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`
  }).join(' ')

  return (
    <div className="hex-compact">
      <svg viewBox="0 0 240 240" className={`hex-svg ${haloClass}`} style={{ '--glow-color': glow }}>
        <polygon
          points={hexPoints}
          fill="none"
          stroke={accent}
          strokeWidth="1"
          opacity="0.3"
          className="hex-outline"
        />
        <polygon
          points={hexPoints}
          fill="currentColor"
          fillOpacity="0.03"
          stroke={accent}
          strokeWidth="2"
          className="hex-body"
          style={{ color: accent }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" className="hex-prob-text" fill={accent}>
          {pScore}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" className="hex-prob-label" fill="var(--text-muted)">
          pScore%
        </text>
      </svg>
    </div>
  )
}
