import { useState, useEffect } from 'react'
import GoalProgress from './components/GoalProgress'
import PaceChart from './components/PaceChart'
import WeeklyPlan from './components/WeeklyPlan'
import ActivityLog from './components/ActivityLog'
import PlanAnalysis from './components/PlanAnalysis'
import { loadData, saveData, getDefaultData } from './utils/storage'
import './App.css'

function App() {
  const [appData, setAppData] = useState(getDefaultData())

  useEffect(() => {
    const saved = loadData()
    setAppData(saved)
  }, [])

  useEffect(() => {
    saveData(appData)
  }, [appData])

  const handleAddActivity = (activity) => {
    setAppData({
      ...appData,
      activities: [...appData.activities, activity],
    })
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
          <h1>🚴 Cycling Goal Tracker</h1>
          <p>5,000 miles in 2026</p>
        </div>
      </header>

      <main className="app-main">
        <GoalProgress activities={appData.activities} goal={appData.goal} />
        <PaceChart activities={appData.activities} />
        <WeeklyPlan plan={appData.weeklyPlan} onUpdate={handleUpdatePlan} />
        <PlanAnalysis activities={appData.activities} weeklyPlan={appData.weeklyPlan} />
        <ActivityLog activities={appData.activities} onAdd={handleAddActivity} />
      </main>
    </div>
  )
}

export default App
