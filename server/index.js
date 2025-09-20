const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const config = require('./config/index');
const connectDB = require('./config/database');
const mqttService = require('./services/mqttService');

// Import routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const deviceRoutes = require('./routes/devices');
const sensorRoutes = require('./routes/sensors');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React dev server
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Connect to MQTT (tạm thời tắt để tránh lỗi)
// mqttService.connect();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensors', sensorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mqtt: mqttService.isConnected ? 'connected' : 'disconnected'
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join sensor room for real-time updates
  socket.on('join-sensor', (sensorId) => {
    socket.join(`sensor-${sensorId}`);
    console.log(`📡 Client ${socket.id} joined sensor ${sensorId}`);
  });

  // Leave sensor room
  socket.on('leave-sensor', (sensorId) => {
    socket.leave(`sensor-${sensorId}`);
    console.log(`📡 Client ${socket.id} left sensor ${sensorId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ message: 'Lỗi server nội bộ' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API không tồn tại' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Đang tắt server...');
  mqttService.disconnect();
  process.exit(0);
});

// Start server
server.listen(config.PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${config.PORT}`);
  console.log(`📡 MQTT Broker: ${config.MQTT_BROKER_URL}`);
  console.log(`🗄️  MongoDB: ${config.MONGODB_URI}`);
});


