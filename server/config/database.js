const mongoose = require('mongoose');

// Cấu hình kết nối MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/network_tracking');

    console.log('✅ MongoDB đã kết nối thành công!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    console.log(`🚀 Port: ${conn.connection.port}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

// Xử lý sự kiện kết nối
mongoose.connection.on('connected', () => {
  console.log('🔌 Mongoose đã kết nối với MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Lỗi kết nối Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose đã ngắt kết nối với MongoDB');
});

// Xử lý khi tắt ứng dụng
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('✅ Kết nối MongoDB đã đóng');
  process.exit(0);
});

module.exports = connectDB; 