import { useState, useEffect } from 'react';

const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High'];

export default function TaskList({ refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('All');
  // Track which task IDs have a completion request in flight
  const [completingIds, setCompletingIds] = useState(new Set());
  // Track per-task completion errors: { [taskId]: errorMessage }
  const [completionErrors, setCompletionErrors] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError('');
      try {
        // Build URL — send the priority to the backend as a query param
        const url = priority === 'All'
          ? `${import.meta.env.VITE_API_URL}/api/tasks`
          : `${import.meta.env.VITE_API_URL}/api/tasks?priority=${priority}`;

        const response = await fetch(url);

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to fetch tasks from the server.');
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message || 'An unknown network error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshKey, priority]); // Refetch when refreshKey OR priority changes

  const handleComplete = async (taskId) => {
    if (completingIds.has(taskId)) return;

    setCompletingIds(prev => new Set(prev).add(taskId));
    setCompletionErrors(prev => ({ ...prev, [taskId]: null }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/complete`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to mark task as completed.');
      }

      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, completed: true } : task
        )
      );
    } catch (err) {
      setCompletionErrors(prev => ({ ...prev, [taskId]: err.message }));
    } finally {
      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Your Tasks</h2>

      {/* Priority Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        {PRIORITY_OPTIONS.map(option => (
          <button
            key={option}
            onClick={() => setPriority(option)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid #adb5bd',
              cursor: 'pointer',
              fontWeight: priority === option ? 'bold' : 'normal',
              backgroundColor: priority === option ? '#0d6efd' : '#f8f9fa',
              color: priority === option ? '#fff' : '#212529',
              transition: 'all 0.15s ease',
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ fontStyle: 'italic', color: '#666' }}>Loading tasks...</p>
      )}

      {/* Fetch error */}
      {!loading && error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && tasks.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <p>
            {priority === 'All'
              ? 'You have no tasks yet. Add one above to get started!'
              : `No ${priority} priority tasks found.`}
          </p>
        </div>
      )}

      {/* Task list */}
      {!loading && !error && tasks.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {tasks.map((task) => {
            const isCompleting = completingIds.has(task._id);
            const taskError = completionErrors[task._id];

            return (
              <li
                key={task._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '12px',
                  backgroundColor: task.completed ? '#f8f9fa' : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#6c757d' : '#212529'
                  }}>
                    {task.title}
                  </h4>
                  <span style={{
                    fontSize: '0.85em',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#e9ecef',
                    color: '#495057',
                    marginRight: '10px'
                  }}>
                    Priority: {task.priority}
                  </span>
                  {taskError && (
                    <p style={{ color: '#c62828', fontSize: '0.85em', margin: '8px 0 0 0' }}>
                      {taskError}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '1rem' }}>
                  {/* Status badge */}
                  <div style={{
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: task.completed ? '#d4edda' : '#fff3cd',
                    color: task.completed ? '#155724' : '#856404',
                    border: `1px solid ${task.completed ? '#c3e6cb' : '#ffeeba'}`
                  }}>
                    {task.completed ? '✓ Completed' : 'Pending'}
                  </div>

                  {/* Complete button — only for pending tasks */}
                  {!task.completed && (
                    <button
                      onClick={() => handleComplete(task._id)}
                      disabled={isCompleting}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.85em',
                        cursor: isCompleting ? 'not-allowed' : 'pointer',
                        backgroundColor: isCompleting ? '#adb5bd' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      {isCompleting ? 'Saving...' : 'Complete'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
