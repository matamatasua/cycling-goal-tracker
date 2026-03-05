import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

export default function Header() {
  const { isAuthenticated, stravaConnected, athleteName, signInWithGoogle, connectStrava, signOut } = useAuth()
  const { isSyncing, syncError, syncStrava } = useData()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">CGT-26</h1>
      </div>

      <div className="header-actions">
        {!isAuthenticated ? (
          <button className="header-btn header-btn-connect" onClick={signInWithGoogle}>
            SIGN IN
          </button>
        ) : (
          <div className="header-menu-wrapper" ref={menuRef}>
            <span className="header-athlete">{athleteName}</span>
            <button
              className="header-menu-toggle"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              &#x22EE;
            </button>

            {menuOpen && (
              <div className="header-dropdown glass-panel">
                {stravaConnected ? (
                  <>
                    <button
                      className="header-dropdown-item"
                      onClick={() => { syncStrava(); setMenuOpen(false) }}
                      disabled={isSyncing}
                    >
                      {isSyncing ? 'SYNCING...' : 'SYNC STRAVA'}
                    </button>
                    <button
                      className="header-dropdown-item"
                      onClick={() => { connectStrava(); setMenuOpen(false) }}
                    >
                      RECONNECT STRAVA
                    </button>
                  </>
                ) : (
                  <button
                    className="header-dropdown-item"
                    onClick={() => { connectStrava(); setMenuOpen(false) }}
                  >
                    CONNECT STRAVA
                  </button>
                )}
                <button
                  className="header-dropdown-item header-dropdown-item-danger"
                  onClick={() => { signOut(); setMenuOpen(false) }}
                >
                  SIGN OUT
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {syncError && <div className="header-error">{syncError}</div>}
    </header>
  )
}
