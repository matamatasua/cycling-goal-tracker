import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { fetchActivitiesFromStrava, mapStravaActivityToOurs, mergeActivities } from '../utils/strava'
import { dataReducer, initialDataState } from '../reducers/dataReducer'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

const DAY_MAP = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function DataProvider({ children }) {
  const { userId, accessToken, tokenExpiresAt, refreshStravaToken, isAuthenticated, stravaConnected } = useAuth()
  const [state, dispatch] = useReducer(dataReducer, initialDataState)

  // Load data from Supabase on auth, reset on sign-out
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      dispatch({ type: 'RESET' })
      return
    }
    loadFromSupabase()
  }, [isAuthenticated, userId])

  async function loadFromSupabase() {
    try {
      // Fetch activities
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      // Fetch weekly plan
      const { data: planRows } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', userId)

      // Fetch goal
      const { data: settings } = await supabase
        .from('user_settings')
        .select('goal')
        .eq('user_id', userId)
        .maybeSingle()

      // Convert plan rows to object
      let weeklyPlan = initialDataState.weeklyPlan
      if (planRows && planRows.length > 0) {
        weeklyPlan = { ...initialDataState.weeklyPlan }
        planRows.forEach(row => {
          const dayName = DAY_MAP[row.day_of_week]
          if (dayName) {
            weeklyPlan[dayName] = { miles: Number(row.miles), type: row.type }
          }
        })
      }

      dispatch({
        type: 'LOAD_DATA',
        activities: activities || [],
        weeklyPlan,
        goal: settings?.goal ?? 5000,
      })
    } catch (err) {
      console.error('Failed to load from Supabase:', err)
      dispatch({ type: 'LOAD_DATA' })
    }
  }

  const syncStrava = useCallback(async () => {
    if (!accessToken || !userId) return
    dispatch({ type: 'SYNC_START' })

    try {
      // Try up to 3 times, refreshing the token on each 401
      let token = accessToken
      let lastError = null

      for (let attempt = 1; attempt <= 3; attempt++) {
        // Refresh token if expired (with 60s buffer), unknown expiry, or retrying after 401
        const isExpired = !tokenExpiresAt || tokenExpiresAt < Math.floor(Date.now() / 1000) + 60
        if (isExpired || attempt > 1) {
          const refreshed = await refreshStravaToken()
          if (refreshed) token = refreshed
        }

        try {
          const stravaActivities = await fetchActivitiesFromStrava(token)
          const merged = mergeActivities(state.activities, stravaActivities)

          // Upsert all activities to Supabase
          const rows = merged.map(a => ({
            id: a.id,
            user_id: userId,
            date: a.date,
            miles: a.miles,
            type: a.type,
            notes: a.notes,
            source: a.source,
            moving_time: a.moving_time,
            elevation_gain: a.elevation_gain,
            avg_speed: a.avg_speed,
            max_speed: a.max_speed,
            avg_heartrate: a.avg_heartrate,
            max_heartrate: a.max_heartrate,
            suffer_score: a.suffer_score,
          }))

          const { error } = await supabase
            .from('activities')
            .upsert(rows, { onConflict: 'id' })

          if (error) throw error

          dispatch({ type: 'SYNC_SUCCESS', activities: merged })
          return
        } catch (err) {
          lastError = err
          // Only retry on 401 (expired/invalid token)
          if (!err.message?.includes('expired') && !err.message?.includes('Invalid')) break
          if (attempt === 3) break
        }
      }

      throw lastError
    } catch (err) {
      dispatch({ type: 'SYNC_ERROR', error: `Strava sync failed after retries (${err.message}). Try Reconnect Strava from the menu.` })
    }
  }, [accessToken, tokenExpiresAt, refreshStravaToken, userId, state.activities])

  // Auto-sync on first auth (only if Strava is connected)
  useEffect(() => {
    if (isAuthenticated && stravaConnected && accessToken && !state.isSyncing && state.activities.length === 0 && !state.loading) {
      syncStrava()
    }
  }, [isAuthenticated, stravaConnected, accessToken, state.loading])

  const updatePlanDay = useCallback(async (day, value) => {
    dispatch({ type: 'UPDATE_PLAN_DAY', day, value })

    if (!userId) return
    const dayIndex = DAY_MAP.indexOf(day)
    if (dayIndex === -1) return

    const currentDay = state.weeklyPlan[day]
    await supabase
      .from('weekly_plans')
      .upsert({
        user_id: userId,
        day_of_week: dayIndex,
        miles: value.miles ?? currentDay.miles,
        type: value.type ?? currentDay.type,
      }, { onConflict: 'user_id,day_of_week' })
  }, [userId, state.weeklyPlan])

  return (
    <DataContext.Provider value={{
      ...state,
      syncStrava,
      updatePlanDay,
    }}>
      {children}
    </DataContext.Provider>
  )
}
