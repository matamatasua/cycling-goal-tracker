import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { getAuthorizationUrl, exchangeCodeForToken } from '../utils/strava'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [stravaInfo, setStravaInfo] = useState(null) // user_settings row
  const [loading, setLoading] = useState(true)

  // Initialize Supabase Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchStravaInfo(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchStravaInfo(session.user.id)
      } else {
        setStravaInfo(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle Strava OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (!code || state !== 'strava') return
    if (!session) return // Wait for Supabase session before processing

    // Clear URL and prevent double invocation
    window.history.replaceState({}, document.title, '/')

    handleStravaCallback(code)
  }, [session])

  async function fetchStravaInfo(userId) {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (data && data.strava_access_token) {
        setStravaInfo(data)
      }
    } catch {
      // No user_settings row yet — that's fine
    } finally {
      setLoading(false)
    }
  }

  async function handleStravaCallback(code) {
    if (!session) return

    try {
      setLoading(true)
      const result = await exchangeCodeForToken(
        code,
        import.meta.env.VITE_STRAVA_CLIENT_ID,
        import.meta.env.VITE_STRAVA_CLIENT_SECRET
      )

      // Upsert user_settings with Strava info, keyed by auth user ID
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          strava_athlete_id: result.athlete.id,
          strava_access_token: result.accessToken,
          athlete_name: result.athlete.name,
          athlete_profile_url: result.athlete.profileUrl,
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) throw error
      setStravaInfo(data)
    } catch (err) {
      console.error('Strava callback failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }, [])

  const connectStrava = useCallback(() => {
    const url = getAuthorizationUrl(
      import.meta.env.VITE_STRAVA_CLIENT_ID,
      import.meta.env.VITE_STRAVA_REDIRECT_URI
    )
    window.location.href = url
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange handles clearing session/stravaInfo
  }, [])

  const isAuthenticated = !!session
  const stravaConnected = !!stravaInfo?.strava_access_token
  const userId = session?.user?.id || null
  const accessToken = stravaInfo?.strava_access_token || null

  // Prefer Strava athlete name, fall back to Google display name
  const athleteName = stravaInfo?.athlete_name
    || session?.user?.user_metadata?.full_name
    || ''

  return (
    <AuthContext.Provider value={{
      user: session?.user || null,
      loading,
      isAuthenticated,
      stravaConnected,
      athleteName,
      userId,
      accessToken,
      signInWithGoogle,
      connectStrava,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
