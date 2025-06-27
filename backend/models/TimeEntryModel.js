import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isBillable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
timeEntrySchema.index({ userId: 1, startTime: 1 });
timeEntrySchema.index({ userId: 1, taskId: 1 });
timeEntrySchema.index({ userId: 1, projectId: 1 });
timeEntrySchema.index({ userId: 1, isRunning: 1 });

export default mongoose.model('TimeEntry', timeEntrySchema); 