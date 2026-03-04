export const initialDataState = {
  activities: [],
  weeklyPlan: {
    monday: { miles: 20, type: 'road' },
    tuesday: { miles: 0, type: 'rest' },
    wednesday: { miles: 25, type: 'mtb' },
    thursday: { miles: 0, type: 'rest' },
    friday: { miles: 20, type: 'virtual' },
    saturday: { miles: 40, type: 'road' },
    sunday: { miles: 0, type: 'rest' },
  },
  goal: 5000,
  loading: true,
  syncError: null,
  isSyncing: false,
}

export function dataReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        activities: action.activities || [],
        weeklyPlan: action.weeklyPlan || state.weeklyPlan,
        goal: action.goal ?? state.goal,
        loading: false,
      }

    case 'SYNC_START':
      return { ...state, isSyncing: true, syncError: null }

    case 'SYNC_SUCCESS':
      return {
        ...state,
        activities: action.activities,
        isSyncing: false,
        syncError: null,
      }

    case 'SYNC_ERROR':
      return { ...state, isSyncing: false, syncError: action.error }

    case 'UPDATE_WEEKLY_PLAN':
      return { ...state, weeklyPlan: action.weeklyPlan }

    case 'UPDATE_PLAN_DAY':
      return {
        ...state,
        weeklyPlan: {
          ...state.weeklyPlan,
          [action.day]: { ...state.weeklyPlan[action.day], ...action.value },
        },
      }

    case 'SET_GOAL':
      return { ...state, goal: action.goal }

    case 'RESET':
      return { ...initialDataState }

    default:
      return state
  }
}
