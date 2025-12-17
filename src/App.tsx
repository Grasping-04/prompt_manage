import { AppProvider } from './store/AppContext'
import { Sidebar } from './components/Sidebar'
import { TaskList } from './components/TaskList'

function App() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-[var(--color-bg-secondary)]">
        <Sidebar />
        <TaskList />
      </div>
    </AppProvider>
  )
}

export default App
