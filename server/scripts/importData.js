// const mongoose = require('mongoose');
// const fs = require('fs');
// const path = require('path');

// const config = require('../config');
// const User = require('../models/User');
// const Station = require('../models/Station');
// const Device = require('../models/Device');
// const Sensor = require('../models/Sensor');

// async function importData() {
//   try {
//     // Kết nối MongoDB
//     await mongoose.connect(config.MONGODB_URI);
//     console.log('✅ Kết nối MongoDB thành công');

//     // Xóa dữ liệu cũ
//     await User.deleteMany({});
//     await Station.deleteMany({});
//     await Device.deleteMany({});
//     await Sensor.deleteMany({});
//     console.log('🗑️  Đã xóa dữ liệu cũ');

//     // Import Users
//     const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../network_tracking.users.json'), 'utf8'));
//     for (const userData of usersData) {
//       const user = new User({
//         name: userData.name,
//         email: userData.email,
//         password: userData.password,
//         age: userData.age,
//         role: userData.role
//       });
//       await user.save();
//     }
//     console.log(`👥 Đã import ${usersData.length} users`);

//     // Import Stations
//     const stationsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../network_tracking.stations.json'), 'utf8'));
//     for (const stationData of stationsData) {
//       const station = new Station({
//         name: stationData.name,
//         location: stationData.location
//       });
//       await station.save();
//     }
//     console.log(`🏢 Đã import ${stationsData.length} stations`);

//     // Import Devices
//     const devicesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../network_tracking.devices.json'), 'utf8'));
//     for (const deviceData of devicesData) {
//       const device = new Device({
//         name: deviceData.name,
//         stationId: deviceData.stationId.$oid,
//         type: 'Weather Station',
//         model: 'WS-1000',
//         serialNumber: `SN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
//         status: 'online'
//       });
//       await device.save();
//     }
//     console.log(`📱 Đã import ${devicesData.length} devices`);

//     // Import Sensors
//     const sensorsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../network_tracking.sensors.json'), 'utf8'));
//     for (const sensorData of sensorsData) {
//       const sensor = new Sensor({
//         name: sensorData.name,
//         deviceId: sensorData.deviceId.$oid,
//         type: sensorData.name.toLowerCase().includes('nhiệt') ? 'temperature' : 'humidity',
//         unit: sensorData.name.toLowerCase().includes('nhiệt') ? '°C' : '%',
//         minValue: sensorData.name.toLowerCase().includes('nhiệt') ? -10 : 0,
//         maxValue: sensorData.name.toLowerCase().includes('nhiệt') ? 50 : 100,
//         data: sensorData.data.map(d => ({
//           value: d.value,
//           timestamp: new Date(d.timestamp.$date),
//           quality: 'good'
//         }))
//       });
//       await sensor.save();
//     }
//     console.log(`📊 Đã import ${sensorsData.length} sensors`);

//     // Tạo thêm một số cảm biến mẫu
//     const devices = await Device.find();
//     const sensorTypes = [
//       { name: 'Áp suất khí quyển', type: 'pressure', unit: 'hPa', min: 900, max: 1100 },
//       { name: 'Cường độ ánh sáng', type: 'light', unit: 'lux', min: 0, max: 1000 },
//       { name: 'Mức độ tiếng ồn', type: 'noise', unit: 'dB', min: 30, max: 100 },
//       { name: 'Chất lượng không khí', type: 'air_quality', unit: 'AQI', min: 0, max: 500 },
//       { name: 'Tốc độ gió', type: 'wind_speed', unit: 'm/s', min: 0, max: 30 },
//       { name: 'Lượng mưa', type: 'rainfall', unit: 'mm/h', min: 0, max: 100 }
//     ];

//     for (const device of devices) {
//       for (const sensorType of sensorTypes) {
//         const sensor = new Sensor({
//           name: sensorType.name,
//           deviceId: device._id,
//           type: sensorType.type,
//           unit: sensorType.unit,
//           minValue: sensorType.min,
//           maxValue: sensorType.max,
//           samplingInterval: 30
//         });
//         await sensor.save();
//       }
//     }
//     console.log(`📊 Đã tạo thêm ${devices.length * sensorTypes.length} sensors mẫu`);

//     console.log('✅ Import dữ liệu hoàn tất!');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Lỗi import dữ liệu:', error);
//     process.exit(1);
//   }
// }

// importData(); 