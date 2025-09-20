const mqtt = require('mqtt');
const Sensor = require('../models/Sensor');
const Device = require('../models/Device');
const config = require('../config/index');

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.mockDataInterval = null;
  }

  connect() {
    const options = {
      clientId: `net_station_server_${Math.random().toString(16).slice(3)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    };

    if (config.MQTT_USERNAME && config.MQTT_PASSWORD) {
      options.username = config.MQTT_USERNAME;
      options.password = config.MQTT_PASSWORD;
    }

    this.client = mqtt.connect(config.MQTT_BROKER_URL, options);

    this.client.on('connect', () => {
      console.log('✅ Kết nối MQTT thành công');
      this.isConnected = true;
      this.subscribeToTopics();
      this.startMockDataGeneration();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on('error', (error) => {
      console.error('❌ Lỗi MQTT:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('🔌 Kết nối MQTT đã đóng');
      this.isConnected = false;
    });
  }

  subscribeToTopics() {
    // Subscribe to sensor data topics
    this.client.subscribe('sensors/+/data', (err) => {
      if (err) {
        console.error('❌ Lỗi subscribe MQTT:', err);
      } else {
        console.log('📡 Đã subscribe topic: sensors/+/data');
      }
    });

    // Subscribe to device status topics
    this.client.subscribe('devices/+/status', (err) => {
      if (err) {
        console.error('❌ Lỗi subscribe MQTT:', err);
      } else {
        console.log('📡 Đã subscribe topic: devices/+/status');
      }
    });
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      
      if (topic.startsWith('sensors/')) {
        await this.handleSensorData(topic, data);
      } else if (topic.startsWith('devices/')) {
        await this.handleDeviceStatus(topic, data);
      }
    } catch (error) {
      console.error('❌ Lỗi xử lý message MQTT:', error);
    }
  }

  async handleSensorData(topic, data) {
    const sensorId = topic.split('/')[1];
    
    try {
      const sensor = await Sensor.findById(sensorId);
      if (sensor) {
        await sensor.addData(data.value, data.quality || 'good');
        console.log(`📊 Đã cập nhật dữ liệu sensor ${sensor.name}: ${data.value}${sensor.unit}`);
      }
    } catch (error) {
      console.error('❌ Lỗi cập nhật dữ liệu sensor:', error);
    }
  }

  async handleDeviceStatus(topic, data) {
    const deviceId = topic.split('/')[1];
    
    try {
      await Device.findByIdAndUpdate(deviceId, {
        status: data.status,
        lastSeen: new Date()
      });
      console.log(`📱 Đã cập nhật trạng thái device ${deviceId}: ${data.status}`);
    } catch (error) {
      console.error('❌ Lỗi cập nhật trạng thái device:', error);
    }
  }

  startMockDataGeneration() {
    // Tạo dữ liệu mẫu cho các sensor mỗi 30 giây
    this.mockDataInterval = setInterval(async () => {
      try {
        const sensors = await Sensor.find({ status: 'active' });
        
        for (const sensor of sensors) {
          const mockValue = this.generateMockValue(sensor);
          await sensor.addData(mockValue, 'good');
          
          // Publish to MQTT topic
          if (this.isConnected) {
            const topic = `sensors/${sensor._id}/data`;
            const message = JSON.stringify({
              value: mockValue,
              quality: 'good',
              timestamp: new Date()
            });
            this.client.publish(topic, message);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi tạo dữ liệu mẫu:', error);
      }
    }, 30000); // 30 giây
  }

  generateMockValue(sensor) {
    const now = new Date();
    const hour = now.getHours();
    
    switch (sensor.type) {
      case 'temperature':
        // Nhiệt độ thay đổi theo giờ trong ngày
        const baseTemp = 25;
        const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
        return Math.round((baseTemp + tempVariation + (Math.random() - 0.5) * 2) * 10) / 10;
        
      case 'humidity':
        // Độ ẩm cao vào sáng sớm và tối
        const baseHumidity = 60;
        const humidityVariation = Math.sin((hour - 6) * Math.PI / 12) * 20;
        return Math.round(Math.max(30, Math.min(95, baseHumidity - humidityVariation + (Math.random() - 0.5) * 10)));
        
      case 'pressure':
        // Áp suất khí quyển ổn định với biến động nhỏ
        return Math.round((1013 + (Math.random() - 0.5) * 10) * 10) / 10;
        
      case 'light':
        // Ánh sáng cao vào ban ngày, thấp vào ban đêm
        if (hour >= 6 && hour <= 18) {
          return Math.round((800 + Math.random() * 400));
        } else {
          return Math.round(Math.random() * 50);
        }
        
      case 'noise':
        // Tiếng ồn cao vào giờ cao điểm
        const baseNoise = 40;
        const noiseVariation = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 30 : 10;
        return Math.round(baseNoise + Math.random() * noiseVariation);
        
      case 'air_quality':
        // Chất lượng không khí tốt vào sáng sớm, kém vào giờ cao điểm
        const baseAQI = 50;
        const aqiVariation = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 40 : 20;
        return Math.round(baseAQI + Math.random() * aqiVariation);
        
      case 'wind_speed':
        // Tốc độ gió thay đổi ngẫu nhiên
        return Math.round((Math.random() * 20) * 10) / 10;
        
      case 'rainfall':
        // Mưa có thể xảy ra bất kỳ lúc nào với xác suất thấp
        return Math.random() < 0.1 ? Math.round(Math.random() * 5 * 10) / 10 : 0;
        
      default:
        return Math.round(Math.random() * 100);
    }
  }

  stopMockDataGeneration() {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }
  }

  disconnect() {
    this.stopMockDataGeneration();
    if (this.client) {
      this.client.end();
    }
  }
}

module.exports = new MQTTService(); 