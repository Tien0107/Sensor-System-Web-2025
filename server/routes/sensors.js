const express = require('express');
const Sensor = require('../models/Sensor');
const Device = require('../models/Device');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả cảm biến
router.get('/', auth, async (req, res) => {
  try {
    const sensors = await Sensor.find()
      .populate('deviceId', 'name stationId')
      .populate('deviceId.stationId', 'name location')
      .sort({ createdAt: -1 });
    res.json(sensors);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy cảm biến theo thiết bị
router.get('/device/:deviceId', auth, async (req, res) => {
  try {
    const sensors = await Sensor.find({ deviceId: req.params.deviceId })
      .populate('deviceId', 'name stationId')
      .populate('deviceId.stationId', 'name location')
      .sort({ createdAt: -1 });
    res.json(sensors);
  } catch (error) {
    console.error('❌ Lỗi lấy cảm biến theo thiết bị:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy cảm biến theo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate('deviceId', 'name stationId')
      .populate('deviceId.stationId', 'name location');
    
    if (!sensor) {
      return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
    }
    res.json(sensor);
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy dữ liệu cảm biến trong khoảng thời gian
router.get('/:id/data', auth, async (req, res) => {
  try {
    const { startTime, endTime, limit = 100 } = req.query;
    const sensor = await Sensor.findById(req.params.id);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
    }

    let data = sensor.data;

    // Lọc theo thời gian nếu có
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      data = sensor.getDataInRange(start, end);
    }

    // Giới hạn số lượng dữ liệu
    data = data.slice(-parseInt(limit));

    res.json({
      sensor: {
        id: sensor._id,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit
      },
      data
    });
  } catch (error) {
    console.error('❌ Lỗi lấy dữ liệu cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy dữ liệu mới nhất của cảm biến
router.get('/:id/latest', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
    }

    const latestData = sensor.getLatestData();

    res.json({
      sensor: {
        id: sensor._id,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit,
        status: sensor.status
      },
      latestData
    });
  } catch (error) {
    console.error('❌ Lỗi lấy dữ liệu mới nhất:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo cảm biến mới
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      deviceId, 
      type, 
      unit, 
      minValue, 
      maxValue, 
      samplingInterval, 
      description 
    } = req.body;

    if (!name || !deviceId || !type || !unit) {
      return res.status(400).json({ message: 'Tên, thiết bị, loại và đơn vị là bắt buộc' });
    }

    // Kiểm tra thiết bị tồn tại
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    const sensor = new Sensor({
      name,
      deviceId,
      type,
      unit,
      minValue,
      maxValue,
      samplingInterval: samplingInterval || 30,
      description
    });

    await sensor.save();
    
    const populatedSensor = await Sensor.findById(sensor._id)
      .populate('deviceId', 'name stationId')
      .populate('deviceId.stationId', 'name location');

    res.status(201).json({
      message: 'Tạo cảm biến thành công',
      sensor: populatedSensor
    });
  } catch (error) {
    console.error('❌ Lỗi tạo cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật cảm biến
router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      name, 
      type, 
      unit, 
      minValue, 
      maxValue, 
      status, 
      samplingInterval, 
      description 
    } = req.body;

    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        unit,
        minValue,
        maxValue,
        status,
        samplingInterval,
        description
      },
      { new: true, runValidators: true }
    ).populate('deviceId', 'name stationId')
     .populate('deviceId.stationId', 'name location');

    if (!sensor) {
      return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
    }

    res.json({
      message: 'Cập nhật cảm biến thành công',
      sensor
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa cảm biến
router.delete('/:id', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
    }

    res.json({ message: 'Xóa cảm biến thành công' });
  } catch (error) {
    console.error('❌ Lỗi xóa cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm dữ liệu cảm biến (cho testing)
router.post('/:id/data', auth, async (req, res) => {
  try {
    const { value, quality = 'good' } = req.body;
    const sensor = await Sensor.findById(req.params.id);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
    }

    await sensor.addData(value, quality);
    
    res.json({
      message: 'Thêm dữ liệu thành công',
      latestData: sensor.getLatestData()
    });
  } catch (error) {
    console.error('❌ Lỗi thêm dữ liệu cảm biến:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 