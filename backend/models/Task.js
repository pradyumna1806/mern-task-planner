const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true // Removes leading/trailing spaces. If it's only spaces, it becomes empty and triggers the required error.
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium' // Optional, but good practice
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
