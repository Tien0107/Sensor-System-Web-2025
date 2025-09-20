const express = require('express');
const Station = require('../models/Station');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả trạm
router.get('/', auth, async (req, res) => {
  try {
    const stations = await Station.find().sort({ createdAt: -1 });
    res.json(stations);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách trạm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy trạm theo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm' });
    }
    res.json(station);
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin trạm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo trạm mới
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, description, coordinates } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Tên và vị trí là bắt buộc' });
    }

    const station = new Station({
      name,
      location,
      description,
      coordinates
    });

    await station.save();
    res.status(201).json({
      message: 'Tạo trạm thành công',
      station
    });
  } catch (error) {
    console.error('❌ Lỗi tạo trạm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật trạm
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, location, description, status, coordinates } = req.body;

    const station = await Station.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location,
        description,
        status,
        coordinates
      },
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm' });
    }

    res.json({
      message: 'Cập nhật trạm thành công',
      station
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật trạm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa trạm
router.delete('/:id', auth, async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm' });
    }

    res.json({ message: 'Xóa trạm thành công' });
  } catch (error) {
    console.error('❌ Lỗi xóa trạm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 