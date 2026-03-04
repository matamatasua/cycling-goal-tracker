import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import AppShell from './components/layout/AppShell'
import './styles/theme.css'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
