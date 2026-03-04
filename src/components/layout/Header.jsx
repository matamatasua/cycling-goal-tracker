import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

export default function Header() {
  const { isAuthenticated, stravaConnected, athleteName, signInWithGoogle, connectStrava, signOut } = useAuth()
  const { isSyncing, syncError, syncStrava } = useData()

  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">CGT-26</h1>
        <span className="header-subtitle">CYCLING GOAL TRACKER</span>
      </div>

      <div className="header-actions">
        {!isAuthenticated ? (
          <button className="header-btn header-btn-connect" onClick={signInWithGoogle}>
            SIGN IN
          </button>
        ) : stravaConnected ? (
          <>
            <span className="header-athlete">{athleteName}</span>
            <button
              className="header-btn header-btn-sync"
              onClick={syncStrava}
              disabled={isSyncing}
            >
              {isSyncing ? 'SYNCING...' : 'SYNC'}
            </button>
            <button className="header-btn header-btn-disconnect" onClick={signOut}>
              SIGN OUT
            </button>
          </>
        ) : (
          <>
            <span className="header-athlete">{athleteName}</span>
            <button className="header-btn header-btn-connect" onClick={connectStrava}>
              CONNECT STRAVA
            </button>
            <button className="header-btn header-btn-disconnect" onClick={signOut}>
              SIGN OUT
            </button>
          </>
        )}
      </div>

      {syncError && <div className="header-error">{syncError}</div>}
    </header>
  )
}
