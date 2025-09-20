const express = require('express');
const Device = require('../models/Device');
const Station = require('../models/Station');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả thiết bị
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find()
      .populate('stationId', 'name location')
      .sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách thiết bị:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thiết bị theo trạm
router.get('/station/:stationId', auth, async (req, res) => {
  try {
    const devices = await Device.find({ stationId: req.params.stationId })
      .populate('stationId', 'name location')
      .sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    console.error('❌ Lỗi lấy thiết bị theo trạm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thiết bị theo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('stationId', 'name location');
    
    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    res.json(device);
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin thiết bị:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo thiết bị mới
router.post('/', auth, async (req, res) => {
  try {
    const { name, stationId, type, model, serialNumber, description } = req.body;

    if (!name || !stationId || !type) {
      return res.status(400).json({ message: 'Tên, trạm và loại thiết bị là bắt buộc' });
    }

    // Kiểm tra trạm tồn tại
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm' });
    }

    // Kiểm tra serial number unique
    if (serialNumber) {
      const existingDevice = await Device.findOne({ serialNumber });
      if (existingDevice) {
        return res.status(400).json({ message: 'Serial number đã tồn tại' });
      }
    }

    const device = new Device({
      name,
      stationId,
      type,
      model,
      serialNumber,
      description
    });

    await device.save();
    
    const populatedDevice = await Device.findById(device._id)
      .populate('stationId', 'name location');

    res.status(201).json({
      message: 'Tạo thiết bị thành công',
      device: populatedDevice
    });
  } catch (error) {
    console.error('❌ Lỗi tạo thiết bị:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật thiết bị
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, model, serialNumber, status, description } = req.body;

    // Kiểm tra serial number unique nếu thay đổi
    if (serialNumber) {
      const existingDevice = await Device.findOne({ 
        serialNumber, 
        _id: { $ne: req.params.id } 
      });
      if (existingDevice) {
        return res.status(400).json({ message: 'Serial number đã tồn tại' });
      }
    }

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        model,
        serialNumber,
        status,
        description
      },
      { new: true, runValidators: true }
    ).populate('stationId', 'name location');

    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    res.json({
      message: 'Cập nhật thiết bị thành công',
      device
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật thiết bị:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa thiết bị
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    res.json({ message: 'Xóa thiết bị thành công' });
  } catch (error) {
    console.error('❌ Lỗi xóa thiết bị:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 