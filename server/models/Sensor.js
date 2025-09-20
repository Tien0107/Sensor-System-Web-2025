const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  quality: {
    type: String,
    enum: ['good', 'uncertain', 'bad'],
    default: 'good'
  }
});

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'pressure', 'light', 'noise', 'air_quality', 'wind_speed', 'rainfall'],
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  minValue: {
    type: Number
  },
  maxValue: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
  },
  data: [sensorDataSchema],
  samplingInterval: {
    type: Number,
    default: 30, // seconds
    min: 1
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
sensorSchema.index({ deviceId: 1, 'data.timestamp': -1 });
sensorSchema.index({ type: 1 });

// Method to add new sensor data
sensorSchema.methods.addData = function(value, quality = 'good') {
  const newData = {
    value,
    timestamp: new Date(),
    quality
  };
  
  this.data.push(newData);
  
  // Keep only last 1000 data points to prevent memory issues
  if (this.data.length > 1000) {
    this.data = this.data.slice(-1000);
  }
  
  return this.save();
};

// Method to get data within time range
sensorSchema.methods.getDataInRange = function(startTime, endTime) {
  return this.data.filter(data => 
    data.timestamp >= startTime && data.timestamp <= endTime
  ).sort((a, b) => a.timestamp - b.timestamp);
};

// Method to get latest data
sensorSchema.methods.getLatestData = function() {
  return this.data.length > 0 ? this.data[this.data.length - 1] : null;
};

module.exports = mongoose.model('Sensor', sensorSchema); 