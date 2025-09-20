const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/index');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = { auth, adminAuth }; 