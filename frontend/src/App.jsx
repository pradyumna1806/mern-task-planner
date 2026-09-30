import AddTaskForm from './components/AddTaskForm'
import './App.css'

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Task Planner</h1>
      <AddTaskForm />
    </div>
  )
}

export default App
