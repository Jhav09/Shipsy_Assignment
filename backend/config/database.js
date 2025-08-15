require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection URI from .env
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shipment_management';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error);
    return false;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['coordinator', 'admin'],
    default: 'coordinator'
  }
}, {
  timestamps: true
});

// Shipment Schema
const shipmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tracking_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  destination_address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED'],
    default: 'PENDING'
  },
  is_fragile: {
    type: Boolean,
    default: false
  },
  ship_date: {
    type: Date,
    required: true
  },
  estimated_delivery_date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: ''
  }
}, {
  timestamps: true
});

// Create indexes for better performance
shipmentSchema.index({ user_id: 1, tracking_number: 1 });
shipmentSchema.index({ user_id: 1, status: 1 });
shipmentSchema.index({ user_id: 1, createdAt: -1 });

// Models
const User = mongoose.model('User', userSchema);
const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = {
  connectDB,
  User,
  Shipment
};
