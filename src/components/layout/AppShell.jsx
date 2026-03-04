import { useState } from 'react'
import Header from './Header'
import BottomTabBar from './BottomTabBar'
import StatsRing from '../core/StatsRing'
import DriftVector from '../core/DriftVector'
import MonthlyChart from '../core/MonthlyChart'
import ActivityFeed from '../core/ActivityFeed'
import ActivityDetail from '../core/ActivityDetail'
import WeeklyPlan from '../plan/WeeklyPlan'
import WeekActual from '../plan/WeekActual'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

export default function AppShell() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { loading: dataLoading } = useData()
  const [activeDrawer, setActiveDrawer] = useState('stats')
  const [selectedActivity, setSelectedActivity] = useState(null)

  if (authLoading) {
    return (
      <div className="shell">
        <Header />
        <main className="shell-main">
          <div className="shell-loading">INITIALIZING...</div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="shell">
        <Header />
        <main className="shell-main">
          <div className="shell-unauthenticated">
            <div className="shell-hero">
              <div className="shell-hero-hex">&#x2B22;</div>
              <p className="shell-hero-text">
                Sign in with Google to activate your<br />
                <span className="accent-primary">CGT-26 Cycling Intelligence</span>
              </p>
              <p className="shell-hero-goal data-text">TARGET: 5,000 MILES / 2026</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="shell">
        <Header />
        <main className="shell-main">
          <div className="shell-loading">LOADING DATA...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="shell">
      <Header />
      <main className="shell-main">
        <div className="drawer-area">
          <div className={`drawer ${activeDrawer === 'stats' ? 'drawer-active' : ''}`}>
            <StatsRing />
          </div>
          <div className={`drawer ${activeDrawer === 'chart' ? 'drawer-active' : ''}`}>
            <div className="drawer-section glass-panel">
              <div className="drawer-section-header">
                <h2 className="section-title">PROJECTION</h2>
              </div>
              <DriftVector />
            </div>
            <div className="drawer-section glass-panel drawer-section-gap">
              <MonthlyChart />
            </div>
          </div>
          <div className={`drawer ${activeDrawer === 'plan' ? 'drawer-active' : ''}`}>
            <div className="drawer-section">
              <h2 className="section-title">WEEKLY PLAN</h2>
              <WeeklyPlan />
            </div>
            <div className="drawer-section glass-panel drawer-section-gap">
              <WeekActual />
            </div>
          </div>
          <div className={`drawer ${activeDrawer === 'log' ? 'drawer-active' : ''}`}>
            <div className="drawer-section">
              <h2 className="section-title">ACTIVITY LOG</h2>
              <ActivityFeed onSelectActivity={setSelectedActivity} />
            </div>
          </div>
        </div>
      </main>

      <BottomTabBar activeTab={activeDrawer} onTabChange={setActiveDrawer} />

      {selectedActivity && (
        <ActivityDetail
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  )
}
