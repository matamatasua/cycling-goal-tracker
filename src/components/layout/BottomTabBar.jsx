function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M5 12v8a1 1 0 001 1h12a1 1 0 001-1v-8" />
    </svg>
  )
}

function ChartsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9h9" />
      <path d="M12 12l6.36 6.36" />
    </svg>
  )
}

function PlanIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="4" y1="10" x2="20" y2="10" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,13 7,13 9,7 12,17 15,10 17,13 21,13" />
    </svg>
  )
}

const TABS = [
  { id: 'stats', label: 'HOME', icon: <HomeIcon /> },
  { id: 'chart', label: 'CHARTS', icon: <ChartsIcon /> },
  { id: 'plan', label: 'PLAN', icon: <PlanIcon /> },
  { id: 'log', label: 'ACTIVITY', icon: <ActivityIcon /> },
]

export default function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {activeTab === tab.id && <span className="tab-indicator" />}
        </button>
      ))}
    </nav>
  )
}
