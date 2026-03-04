import { useState, useEffect } from 'react'
// Strava OAuth production deployment fix
import GoalProgress from './components/GoalProgress'
import PaceChart from './components/PaceChart'
import WeeklyPlan from './components/WeeklyPlan'
import PlanAnalysis from './components/PlanAnalysis'
import { loadData, saveData, getDefaultData, loadAuthState, saveAuthState, clearAuthState } from './utils/storage'
import { getAuthorizationUrl, exchangeCodeForToken, fetchActivitiesFromStrava, mergeActivities } from './utils/strava'
import './App.css'

function App() {
  const [appData, setAppData] = useState(getDefaultData())
  const [authState, setAuthState] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  // Load persisted data on mount
  useEffect(() => {
    const saved = loadData()
    setAppData(saved)
    const savedAuth = loadAuthState()
    setAuthState(savedAuth)
  }, [])

  // Save app data whenever it changes
  useEffect(() => {
    saveData(appData)
  }, [appData])

  // Handle OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      exchangeCodeForToken(code, import.meta.env.VITE_STRAVA_CLIENT_ID, import.meta.env.VITE_STRAVA_CLIENT_SECRET)
        .then(result => {
          setAuthState(result)
          saveAuthState(result)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          // Sync activities after auth
          syncStravaActivities(result.accessToken)
        })
        .catch(error => {
          console.error('Auth error:', error)
          setSyncError('Failed to connect with Strava. Please try again.')
        })
    }
  }, [])

  // Auto-sync on mount if already authenticated
  useEffect(() => {
    if (authState && !isSyncing) {
      syncStravaActivities(authState.accessToken)
    }
  }, [])

  const syncStravaActivities = async (accessToken) => {
    setIsSyncing(true)
    setSyncError(null)
    try {
      const stravaActivities = await fetchActivitiesFromStrava(accessToken)
      const merged = mergeActivities(appData.activities, stravaActivities)
      setAppData({
        ...appData,
        activities: merged,
      })
    } catch (error) {
      setSyncError(error.message || 'Failed to sync activities')
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleConnectStrava = () => {
    const authUrl = getAuthorizationUrl(
      import.meta.env.VITE_STRAVA_CLIENT_ID,
      import.meta.env.VITE_STRAVA_REDIRECT_URI
    )
    window.location.href = authUrl
  }

  const handleRefreshStrava = () => {
    if (authState) {
      syncStravaActivities(authState.accessToken)
    }
  }

  const handleDisconnect = () => {
    setAuthState(null)
    clearAuthState()
    setSyncError(null)
  }

  const handleUpdatePlan = (newPlan) => {
    setAppData({
      ...appData,
      weeklyPlan: newPlan,
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <div>
              <h1>🚴 Cycling Goal Tracker</h1>
              <p>5,000 miles in 2026</p>
              <p className="timestamp">{new Date().toLocaleString()}</p>
            </div>
            <div className="header-actions">
              {!authState ? (
                <button className="btn btn-strava" onClick={handleConnectStrava}>
                  Connect with Strava
                </button>
              ) : (
                <div className="auth-section">
                  <div className="athlete-info">
                    <span>{authState.athlete.name}</span>
                  </div>
                  <button
                    className="btn btn-refresh"
                    onClick={handleRefreshStrava}
                    disabled={isSyncing}
                  >
                    {isSyncing ? 'Syncing...' : 'Refresh'}
                  </button>
                  <button className="btn btn-disconnect" onClick={handleDisconnect}>
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
          {syncError && <p className="error-message">{syncError}</p>}
        </div>
      </header>

      <main className="app-main">
        {authState ? (
          <>
            <GoalProgress activities={appData.activities} goal={appData.goal} />
            <PaceChart activities={appData.activities} />
            <WeeklyPlan plan={appData.weeklyPlan} onUpdate={handleUpdatePlan} />
            <PlanAnalysis activities={appData.activities} weeklyPlan={appData.weeklyPlan} />
          </>
        ) : (
          <div className="app-empty">
            <p>Connect with Strava to start tracking your 5,000-mile goal.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
