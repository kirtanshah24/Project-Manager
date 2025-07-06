import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  clientName: {
    type: String,
    required: false,
    trim: true
  },
  fileUrl: {
    type: String,
    required: false,
    trim: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  terms: {
    type: String,
    maxlength: [1000, 'Terms cannot exceed 1000 characters']
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'paypal', 'check', 'cash'],
    default: 'bank_transfer'
  },
  paymentReference: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly']
  },
  nextInvoiceDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, clientId: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate tax
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate discount
  if (this.discountType === 'percentage') {
    this.discountAmount = (this.subtotal * this.discountValue) / 100;
  } else {
    this.discountAmount = this.discountValue;
  }
  
  // Calculate total
  this.total = this.subtotal + this.taxAmount - this.discountAmount;
  
  next();
});

export default mongoose.model('Invoice', invoiceSchema); 