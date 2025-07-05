import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    // required: true (removed to make optional)
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, clientId: 1 });
projectSchema.index({ userId: 1, deadline: 1 });

// Virtual for project progress
projectSchema.virtual('progress').get(function() {
  // This will be calculated based on completed tasks
  return 0;
});

// Add pagination plugin
projectSchema.plugin(mongoosePaginate);

export default mongoose.model('Project', projectSchema); 