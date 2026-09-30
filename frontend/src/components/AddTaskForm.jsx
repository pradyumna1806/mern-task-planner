import { useState } from 'react';

export default function AddTaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Client-side validation: prevent empty or space-only titles
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title cannot be empty.');
      return;
    }

    try {
      // Send the request to the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: trimmedTitle,
          priority: priority
        }),
      });

      // Handle non-2xx responses from the server
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add task. Please try again.');
      }

      // Success: Clear the form
      setTitle('');
      setPriority('Medium');
      
      // Notify parent to refresh the task list
      if (onTaskAdded) {
        onTaskAdded();
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', maxWidth: '400px' }}>
      <h3>Add New Task</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        <div>
          <label htmlFor="task-title" style={{ display: 'block', marginBottom: '4px' }}>Title:</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label htmlFor="task-priority" style={{ display: 'block', marginBottom: '4px' }}>Priority:</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {error && <p style={{ color: 'red', margin: '0' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
          Add Task
        </button>
      </form>
    </div>
  );
}
