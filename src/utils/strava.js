// Strava API utility module for authentication and activity fetching

const STRAVA_API_URL = 'https://www.strava.com/api/v3'
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

// Map Strava activity types to our simplified types
function mapActivityType(stravaType) {
  const typeMap = {
    'Ride': 'road',
    'MountainBikeRide': 'mtb',
    'VirtualRide': 'virtual',
    'EBikeRide': 'road',
    'Gravel': 'road',
  }
  return typeMap[stravaType] || 'road'
}

// Convert Strava activity to our data model
export function mapStravaActivityToOurs(stravaActivity) {
  const metersToMiles = 0.000621371
  return {
    id: stravaActivity.id,
    date: stravaActivity.start_date.split('T')[0], // ISO date format
    miles: Math.round(stravaActivity.distance * metersToMiles * 10) / 10, // round to 0.1
    type: mapActivityType(stravaActivity.type),
    notes: stravaActivity.name || '',
    source: 'strava', // Track that this came from Strava
  }
}

// Get the OAuth authorization URL
export function getAuthorizationUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity:read_all',
  })
  return `${STRAVA_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code, clientId, clientSecret) {
  const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    athlete: {
      id: data.athlete.id,
      name: data.athlete.firstname + ' ' + data.athlete.lastname,
      profileUrl: data.athlete.profile,
    },
  }
}

// Fetch activities from Strava
export async function fetchActivitiesFromStrava(accessToken, sinceDateString = null) {
  // If no date provided, default to 2026-01-01
  let after = null
  if (sinceDateString) {
    after = Math.floor(new Date(sinceDateString).getTime() / 1000)
  } else {
    // 2026-01-01 as Unix timestamp
    after = 1735689600
  }

  try {
    const params = new URLSearchParams({
      per_page: 100,
      after: after,
    })

    const response = await fetch(`${STRAVA_API_URL}/athlete/activities?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid or expired Strava token')
      }
      throw new Error(`Failed to fetch activities: ${response.statusText}`)
    }

    const activities = await response.json()
    return activities.map(mapStravaActivityToOurs)
  } catch (error) {
    console.error('Error fetching from Strava:', error)
    throw error
  }
}

// Merge new Strava activities with existing ones (by ID)
export function mergeActivities(existing, newActivities) {
  const activityMap = new Map()

  // Add existing activities
  existing.forEach(a => {
    activityMap.set(a.id, a)
  })

  // Add/update with new Strava activities (they override duplicates)
  newActivities.forEach(a => {
    activityMap.set(a.id, a)
  })

  // Return as array sorted by date (newest first)
  return Array.from(activityMap.values()).sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  )
}
