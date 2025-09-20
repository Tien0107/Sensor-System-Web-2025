const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema); 