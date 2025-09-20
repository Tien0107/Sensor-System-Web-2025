import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiMapPin,
  FiSmartphone,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import Alert from '../components/Alert';

function Dashboard() {
  const [stats, setStats] = useState({
    stations: 0,
    devices: 0,
    sensors: 0,
    activeSensors: 0
  });
  const [recentSensors, setRecentSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Đang tải dữ liệu dashboard...');
      const [stationsRes, devicesRes, sensorsRes] = await Promise.all([
        axios.get('/stations'),
        axios.get('/devices'),
        axios.get('/sensors')
      ]);

      const stations = stationsRes.data;
      const devices = devicesRes.data;
      const sensors = sensorsRes.data;

      console.log('📊 Dữ liệu nhận được:', {
        stations: stations.length,
        devices: devices.length,
        sensors: sensors.length,
        sensorsData: sensors
      });

      setStats({
        stations: stations.length,
        devices: devices.length,
        sensors: sensors.length,
        activeSensors: sensors.filter(s => s.status === 'active').length
      });

      // Lấy 5 cảm biến gần đây nhất
      const recent = sensors
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentSensors(recent);

      // Tính toán tất cả các cảnh báo
      const allAlerts = [];
      sensors.forEach(sensor => {
        const latestValue = sensor.data && sensor.data.length > 0
          ? sensor.data[sensor.data.length - 1]?.value
          : null;

        const sensorType = sensor.name === "Nhiệt độ"
          ? "temperature"
          : sensor.name === "Độ ẩm"
          ? "humidity"
          : sensor.name === "Áp suất"
          ? "pressure"
          : "other";

        let alertMessage = null;
        if (sensorType === "temperature" && latestValue > 35) {
          alertMessage = `Nhiệt độ cao: ${latestValue}°C`;
        }
        if (sensorType === "humidity" && latestValue > 80) {
          alertMessage = `Độ ẩm cao: ${latestValue}%`;
        }
        if (sensorType === "pressure" && latestValue > 1013) {
          alertMessage = `Áp suất cao: ${latestValue}hPa`;
        }
        if (sensorType === "other" && latestValue >= 1) {
          alertMessage = `Có chấn động: ${latestValue}`;
        }

        if (alertMessage) {
          allAlerts.push({
            sensorName: sensor.name,
            message: alertMessage,
            value: latestValue,
            type: 'error'
          });
        }
      });

      setAlerts(allAlerts);
      
      console.log('✅ Dữ liệu dashboard đã được tải thành công');
    } catch (error) {
      console.error('❌ Lỗi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <FiClock className="h-4 w-4" />;
      case 'error':
        return <FiAlertCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống quản lý trạm và cảm biến</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiMapPin className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng số trạm</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stations}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiSmartphone className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng số thiết bị</p>
              <p className="text-2xl font-bold text-gray-900">{stats.devices}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiActivity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng số cảm biến</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sensors}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiTrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cảm biến hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSensors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Cảnh báo hệ thống</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <FiAlertCircle className="h-3 w-3 mr-1" />
              {alerts.length} cảnh báo
            </span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                type={alert.type}
                message={`${alert.sensorName}: ${alert.message}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/stations" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <FiMapPin className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Quản lý trạm</h3>
              <p className="text-sm text-gray-500">Thêm, sửa, xóa trạm</p>
            </div>
          </div>
        </Link>

        <Link to="/devices" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <FiSmartphone className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Quản lý thiết bị</h3>
              <p className="text-sm text-gray-500">Thêm, sửa, xóa thiết bị</p>
            </div>
          </div>
        </Link>

        <Link to="/sensors" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <FiActivity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Quản lý cảm biến</h3>
              <p className="text-sm text-gray-500">Xem dữ liệu cảm biến</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Sensors */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cảm biến gần đây</h3>
        {recentSensors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên cảm biến
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại cảm biến
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cảnh báo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSensors.map((sensor) => {
                  const latestValue = sensor.data && sensor.data.length > 0
                  ? sensor.data[sensor.data.length - 1]?.value
                  : null;

                  // Xác định type dựa trên tên sensor (giống như trong Sensors.jsx)
                  const sensorType = sensor.name === "Nhiệt độ"
                    ? "temperature"
                    : sensor.name === "Độ ẩm"
                    ? "humidity"
                    : sensor.name === "Áp suất"
                    ? "pressure"
                    : "other";

                  let alert = null;
                  if (sensorType === "temperature" && latestValue > 35) {
                    alert = "Nhiệt độ cao";
                  }
                  if (sensorType === "humidity" && latestValue > 80) {
                    alert = "Độ ẩm cao";
                  }
                  if (sensorType === "pressure" && latestValue > 1013) {
                    alert = "Áp suất cao";
                  }
                  if (sensorType === "other" && latestValue >= 1) {
                    alert = "Có chấn động";
                  }

                  console.log(`🔍 Sensor ${sensor.name}:`, {
                    type: sensorType,
                    latestValue,
                    alert,
                    dataLength: sensor.data?.length || 0
                  });

                  return (
                    <tr key={sensor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sensor.name}</div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {sensor.type}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {sensor.deviceId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sensor.status)}`}>
                        {getStatusIcon(sensor.status)}
                        <span className="ml-1">{sensor.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alert && (
                        <span className="text-red-600 font-semibold">
                          {alert}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/sensors/${sensor._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có cảm biến nào</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 