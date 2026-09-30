require('dotenv').config({ path: '../.env' }); // Point to .env in the parent directory
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// GET /api/tasks - Retrieve all tasks, optionally filter by priority
app.get('/api/tasks', async (req, res) => {
  try {
    const { priority } = req.query;
    const query = {};

    // 1. Validate priority if it is provided
    if (priority) {
      const validPriorities = ['Low', 'Medium', 'High'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority. Must be Low, Medium, or High.' });
      }
      query.priority = priority;
    }

    // 2. Fetch tasks based on the query (empty query fetches all)
    // Sorting by newest first is usually helpful for a task list
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    // 3. Return the tasks. If no tasks match the valid priority, 
    // it will naturally return a 200 OK with an empty array [], 
    // which is the RESTful standard for a "no results" list query.
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority } = req.body;
    
    const newTask = new Task({ title, priority });
    const savedTask = await newTask.save();
    
    res.status(201).json(savedTask);
  } catch (error) {
    // Mongoose validation errors (e.g., empty title, invalid priority)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    // Other errors
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/tasks/:id/complete - Mark a task as completed
app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if ID format is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    // 2. Find the task
    const task = await Task.findById(id);

    // 3. Handle non-existent task
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // 4. Handle already completed task
    if (task.completed) {
      return res.status(400).json({ error: 'Task is already completed' });
    }

    // 5. Update and save
    task.completed = true;
    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server only after connecting to the database
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
