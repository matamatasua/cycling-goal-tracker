const STORAGE_KEY = 'cyclingGoalTracker';

export function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultData();
  } catch {
    return getDefaultData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getDefaultData() {
  return {
    goal: 5000,
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
  };
}
