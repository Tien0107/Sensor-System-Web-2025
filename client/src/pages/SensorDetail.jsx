// import io from 'socket.io-client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiThermometer, FiDroplet, FiActivity, FiClock, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SensorDetail() {
  const { id } = useParams();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  // test socket.io
  // useEffect(() => {
  //   const socket = io('http://localhost:5000');
    
  //   // Join sensor room để nhận updates
  //   socket.emit('join-sensor', id);
    
  //   // Lắng nghe dữ liệu mới
  //   socket.on('sensor-data-update', (data) => {
  //     console.log('Dữ liệu MQTT mới:', data);
  //     // Cập nhật state với dữ liệu mới
  //   });
    
  //   return () => {
  //     socket.emit('leave-sensor', id);
  //     socket.disconnect();
  //   };
  // }, [id]);

  const fetchSensorDetail = useCallback(async () => {
    try {
      const response = await axios.get(`/sensors/${id}`);
      setSensor(response.data);
    } catch (error) {
      console.error('Lỗi tải chi tiết cảm biến:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchSensorDetail();
  }, [fetchSensorDetail]);

  const getSensorIcon = (type, name) => {
    if (type === 'temperature' || name === 'Nhiệt độ') {
      return <FiThermometer className="h-8 w-8 text-red-500" />;
    } 
    if (type === 'humidity' || name === 'Độ ẩm') {
      return <FiDroplet className="h-8 w-8 text-blue-500" />;
    }
    if (type === 'pressure' || name === 'Áp suất') {
      return <FiBarChart2 className="h-8 w-8 text-purple-500" />;
    }
    else{
      return <FiActivity className="h-8 w-8 text-green-500" />;
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

  const formatChartData = () => {
    if (!sensor?.data || sensor.data.length === 0) return null;

    const data = sensor.data.slice(-50); // Lấy 50 điểm dữ liệu gần nhất
    
    return {
      labels: data.map(item => {
        const date = new Date(item.timestamp);
        return date.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }),
      datasets: [
        {
          label: `${sensor.name} (${sensor.unit})`,
          data: data.map(item => item.value),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Dữ liệu ${sensor?.name}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: sensor?.unit || 'Giá trị',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Thời gian',
        },
      },
    },
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy cảm biến</h3>
        <Link to="/sensors" className="text-primary-600 hover:text-primary-800">
          Quay lại danh sách cảm biến
        </Link>
      </div>
    );
  }

  const latestData = sensor.data && sensor.data.length > 0 
    ? sensor.data[sensor.data.length - 1] 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/sensors"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sensor.name}</h1>
          <p className="text-gray-600">
            {sensor.deviceId?.name} - {sensor.deviceId?.stationId?.name}
          </p>
        </div>
      </div>

      {/* Sensor Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              {getSensorIcon(sensor.type, sensor.name)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cảm biến</h3>
              <p className="text-sm text-gray-500">{sensor.type}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Loại:</span>
              <span className="font-medium">{sensor.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Đơn vị:</span>
              <span className="font-medium">{sensor.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trạng thái:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sensor.status)}`}>
                {sensor.status}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiTrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Giá trị hiện tại</h3>
              <p className="text-sm text-gray-500">Cập nhật mới nhất</p>
            </div>
          </div>
          <div className="mt-4">
            {latestData ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {latestData.value} {sensor.unit}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(latestData.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiClock className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thống kê</h3>
              <p className="text-sm text-gray-500">Tổng quan dữ liệu</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng số điểm:</span>
              <span className="font-medium">{sensor.data?.length || 0}</span>
            </div>
            {sensor.data && sensor.data.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá trị min:</span>
                  <span className="font-medium">
                    {Math.min(...sensor.data.map(d => d.value)).toFixed(2)} {sensor.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá trị max:</span>
                  <span className="font-medium">
                    {Math.max(...sensor.data.map(d => d.value)).toFixed(2)} {sensor.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá trị TB:</span>
                  <span className="font-medium">
                    {(sensor.data.reduce((sum, d) => sum + d.value, 0) / sensor.data.length).toFixed(2)} {sensor.unit}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Biểu đồ dữ liệu</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === '1h' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              1 giờ
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === '24h' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              24 giờ
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === '7d' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              7 ngày
            </button>
          </div>
        </div>
        
        {sensor.data && sensor.data.length > 0 ? (
          <div className="h-80">
            <Line data={formatChartData()} options={chartOptions} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Chưa có dữ liệu để hiển thị biểu đồ
          </div>
        )}
      </div>

      {/* Recent Data Table */}
      {sensor.data && sensor.data.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dữ liệu gần đây</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sensor.data.slice(-10).reverse().map((data, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(data.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.value} {sensor.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SensorDetail; 