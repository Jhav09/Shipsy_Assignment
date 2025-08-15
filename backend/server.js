const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // From .env
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Shipment Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// MongoDB connection and start server
const startServer = async () => {
  try {
    const connected = await connectDB();
    
    if (!connected) {
      console.error('❌ Failed to connect to MongoDB');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('🚀 Shipment Manager API Server Started');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log('📝 API Documentation:');
      console.log('   POST /api/auth/register - Register new user');
      console.log('   POST /api/auth/login - User login');
      console.log('   GET  /api/auth/verify - Verify token');
      console.log('   GET  /api/shipments - Get all shipments');
      console.log('   POST /api/shipments - Create shipment');
      console.log('   PUT  /api/shipments/:id - Update shipment');
      console.log('   DELETE /api/shipments/:id - Delete shipment');
      console.log('   GET  /api/shipments/stats/summary - Get statistics');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
