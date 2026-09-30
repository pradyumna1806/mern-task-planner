import { useState } from 'react'
import AddTaskForm from './components/AddTaskForm'
import TaskList from './components/TaskList'
import './App.css'

function App() {
  // Simple state to force a re-render of TaskList when a task is added
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskAdded = () => {
    // Incrementing this key will trigger the useEffect inside TaskList
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Task Planner</h1>
      <AddTaskForm onTaskAdded={handleTaskAdded} />
      <TaskList refreshKey={refreshKey} />
    </div>
  )
}

export default App
