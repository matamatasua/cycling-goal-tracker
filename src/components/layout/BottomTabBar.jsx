const TABS = [
  { id: 'stats', label: 'STATS', icon: '\u2B22' },
  { id: 'chart', label: 'CHART', icon: '\u25B3' },
  { id: 'plan', label: 'PLAN', icon: '\u2630' },
  { id: 'log', label: 'LOG', icon: '\u25F7' },
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
