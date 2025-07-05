import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'active'
  },
  taxId: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  contactPerson: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  paymentTerms: {
    type: Number,
    default: 30 // days
  }
}, {
  timestamps: true
});

// Index for efficient queries
clientSchema.index({ userId: 1, name: 1 });
clientSchema.index({ userId: 1, email: 1 });

// Add pagination plugin
clientSchema.plugin(mongoosePaginate);

export default mongoose.model('Client', clientSchema); 