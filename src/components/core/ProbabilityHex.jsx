import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { getRecoveryColor } from '../../engine/projection'

const COG_PATH = 'M 242.75 56.44 L 243.06 44.40 L 246.05 28.22 A 228 228 0 0 1 265.95 28.22 L 268.94 44.40 L 269.25 56.44 A 200 200 0 0 1 294.85 59.81 L 298.27 48.26 L 305.35 33.40 A 228 228 0 0 1 324.56 38.55 L 323.27 54.96 L 320.45 66.67 A 200 200 0 0 1 344.30 76.55 L 350.59 66.27 L 361.28 53.76 A 228 228 0 0 1 378.50 63.71 L 373.01 79.22 L 367.26 89.80 A 200 200 0 0 1 387.74 105.52 L 396.48 97.22 L 410.03 87.90 A 228 228 0 0 1 424.10 101.97 L 414.78 115.52 L 406.48 124.26 A 200 200 0 0 1 422.20 144.74 L 432.78 138.99 L 448.29 133.50 A 228 228 0 0 1 458.24 150.72 L 445.73 161.41 L 435.45 167.70 A 200 200 0 0 1 445.33 191.55 L 457.04 188.73 L 473.45 187.44 A 228 228 0 0 1 478.60 206.65 L 463.74 213.73 L 452.19 217.15 A 200 200 0 0 1 455.56 242.75 L 467.60 243.06 L 483.78 246.05 A 228 228 0 0 1 483.78 265.95 L 467.60 268.94 L 455.56 269.25 A 200 200 0 0 1 452.19 294.85 L 463.74 298.27 L 478.60 305.35 A 228 228 0 0 1 473.45 324.56 L 457.04 323.27 L 445.33 320.45 A 200 200 0 0 1 435.45 344.30 L 445.73 350.59 L 458.24 361.28 A 228 228 0 0 1 448.29 378.50 L 432.78 373.01 L 422.20 367.26 A 200 200 0 0 1 406.48 387.74 L 414.78 396.48 L 424.10 410.03 A 228 228 0 0 1 410.03 424.10 L 396.48 414.78 L 387.74 406.48 A 200 200 0 0 1 367.26 422.20 L 373.01 432.78 L 378.50 448.29 A 228 228 0 0 1 361.28 458.24 L 350.59 445.73 L 344.30 435.45 A 200 200 0 0 1 320.45 445.33 L 323.27 457.04 L 324.56 473.45 A 228 228 0 0 1 305.35 478.60 L 298.27 463.74 L 294.85 452.19 A 200 200 0 0 1 269.25 455.56 L 268.94 467.60 L 265.95 483.78 A 228 228 0 0 1 246.05 483.78 L 243.06 467.60 L 242.75 455.56 A 200 200 0 0 1 217.15 452.19 L 213.73 463.74 L 206.65 478.60 A 228 228 0 0 1 187.44 473.45 L 188.73 457.04 L 191.55 445.33 A 200 200 0 0 1 167.70 435.45 L 161.41 445.73 L 150.72 458.24 A 228 228 0 0 1 133.50 448.29 L 138.99 432.78 L 144.74 422.20 A 200 200 0 0 1 124.26 406.48 L 115.52 414.78 L 101.97 424.10 A 228 228 0 0 1 87.90 410.03 L 97.22 396.48 L 105.52 387.74 A 200 200 0 0 1 89.80 367.26 L 79.22 373.01 L 63.71 378.50 A 228 228 0 0 1 53.76 361.28 L 66.27 350.59 L 76.55 344.30 A 200 200 0 0 1 66.67 320.45 L 54.96 323.27 L 38.55 324.56 A 228 228 0 0 1 33.40 305.35 L 48.26 298.27 L 59.81 294.85 A 200 200 0 0 1 56.44 269.25 L 44.40 268.94 L 28.22 265.95 A 228 228 0 0 1 28.22 246.05 L 44.40 243.06 L 56.44 242.75 A 200 200 0 0 1 59.81 217.15 L 48.26 213.73 L 33.40 206.65 A 228 228 0 0 1 38.55 187.44 L 54.96 188.73 L 66.67 191.55 A 200 200 0 0 1 76.55 167.70 L 66.27 161.41 L 53.76 150.72 A 228 228 0 0 1 63.71 133.50 L 79.22 138.99 L 89.80 144.74 A 200 200 0 0 1 105.52 124.26 L 97.22 115.52 L 87.90 101.97 A 228 228 0 0 1 101.97 87.90 L 115.52 97.22 L 124.26 105.52 A 200 200 0 0 1 144.74 89.80 L 138.99 79.22 L 133.50 63.71 A 228 228 0 0 1 150.72 53.76 L 161.41 66.27 L 167.70 76.55 A 200 200 0 0 1 191.55 66.67 L 188.73 54.96 L 187.44 38.55 A 228 228 0 0 1 206.65 33.40 L 213.73 48.26 L 217.15 59.81 Z'

const TICK_MARKS = [
  { x1: 256, y1: 77, x2: 256, y2: 102, w: 4, o: 0.95 },
  { x1: 346, y1: 104, x2: 333, y2: 126, w: 2.5, o: 0.5 },
  { x1: 400, y1: 160, x2: 379, y2: 173, w: 2.5, o: 0.5 },
  { x1: 422, y1: 256, x2: 397, y2: 256, w: 4, o: 0.95 },
  { x1: 400, y1: 352, x2: 379, y2: 339, w: 2.5, o: 0.5 },
  { x1: 346, y1: 408, x2: 333, y2: 386, w: 2.5, o: 0.5 },
  { x1: 256, y1: 435, x2: 256, y2: 410, w: 4, o: 0.95 },
  { x1: 166, y1: 408, x2: 179, y2: 386, w: 2.5, o: 0.5 },
  { x1: 112, y1: 352, x2: 133, y2: 339, w: 2.5, o: 0.5 },
  { x1: 90, y1: 256, x2: 115, y2: 256, w: 4, o: 0.95 },
  { x1: 112, y1: 160, x2: 133, y2: 173, w: 2.5, o: 0.5 },
  { x1: 166, y1: 104, x2: 179, y2: 126, w: 2.5, o: 0.5 },
]

export default function ProbabilityHex() {
  const { activities, goal, weeklyPlan } = useData()

  const { pScore, accent, glow, haloClass } = useMemo(
    () => getRecoveryColor(activities, goal, weeklyPlan),
    [activities, goal, weeklyPlan]
  )

  return (
    <div className="hex-compact">
      <svg viewBox="0 0 512 512" className={`hex-svg ${haloClass}`} style={{ '--glow-color': glow }}>
        <defs>
          <radialGradient id="cog-faceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E1E1E" stopOpacity="1" />
            <stop offset="100%" stopColor="#121212" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="cog-centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.1" />
            <stop offset="100%" stopColor="#121212" stopOpacity="0" />
          </radialGradient>
          <filter id="cog-cogGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Cog gear — glow layer */}
        <path
          d={COG_PATH}
          fill="none"
          stroke={accent}
          strokeWidth="5"
          strokeLinejoin="round"
          filter="url(#cog-cogGlow)"
          opacity="0.95"
        />
        {/* Cog gear — dark fill */}
        <path
          d={COG_PATH}
          fill="#1E2A3A"
          opacity="0.7"
        />
        {/* Cog gear — bright stroke */}
        <path
          d={COG_PATH}
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Inner face */}
        <circle cx="256" cy="256" r="195" fill="url(#cog-faceGrad)" />
        <circle cx="256" cy="256" r="195" fill="url(#cog-centerGlow)" />
        <circle cx="256" cy="256" r="195" fill="none" stroke={accent} strokeWidth="1" opacity="0.25" />

        {/* Tick marks */}
        {TICK_MARKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={accent}
            strokeWidth={t.w}
            strokeLinecap="round"
            opacity={t.o}
          />
        ))}

        {/* pScore value */}
        <text
          x="256" y="244"
          textAnchor="middle"
          dominantBaseline="central"
          className="hex-prob-text"
          fill={accent}
          fontSize="80"
        >
          {pScore}
        </text>

        {/* pScore label */}
        <text
          x="256" y="310"
          textAnchor="middle"
          className="hex-prob-label"
          fill="var(--text-muted)"
          fontSize="28"
        >
          pScore%
        </text>
      </svg>
    </div>
  )
}
