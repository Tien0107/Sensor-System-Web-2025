const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const config = require('../config/index');

const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo user mới
    const user = new User({
      name,
      email,
      password,
      age: age || 0
    });

    await user.save();

    // Tạo token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin user hiện tại
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        age: req.user.age
      }
    });
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 