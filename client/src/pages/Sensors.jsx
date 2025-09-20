import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiBarChart2,
  FiActivity,
  FiThermometer,
  FiDroplet,
  FiTrendingUp,
} from "react-icons/fi";

function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await axios.get("/sensors");
      setSensors(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách cảm biến:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case "temperature":
        return <FiThermometer className="h-6 w-6 text-red-500" />;
      case "humidity":
        return <FiDroplet className="h-6 w-6 text-blue-500" />;
      case "pressure":
        return <FiBarChart2 className="h-6 w-6 text-purple-500" />;
      default:
        return <FiActivity className="h-6 w-6 text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const sensorWithType = sensors.map((sensor) => ({
    ...sensor,
    type:
      sensor.name === "Nhiệt độ"
        ? "temperature"
        : sensor.name === "Độ ẩm"
        ? "humidity"
        : sensor.name === "Áp suất"
        ? "pressure"
        : "other",
    unit:
      sensor.name === "Nhiệt độ"
        ? "°C"
        : sensor.name === "Độ ẩm"
        ? "%"
        : sensor.name === "Áp suất"
        ? "hPa"
        : "Độ Richter",
  }));

  const filteredSensors =
    selectedType === "all"
      ? sensorWithType
      : sensorWithType.filter((sensor) => sensor.type === selectedType);

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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Cảm biến</h1>
        <p className="text-gray-600">Xem và quản lý các cảm biến quan trắc</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            selectedType === "all"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setSelectedType("temperature")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            selectedType === "temperature"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Nhiệt độ
        </button>
        <button
          onClick={() => setSelectedType("humidity")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            selectedType === "humidity"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Độ ẩm
        </button>
        <button
          onClick={() => setSelectedType("pressure")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            selectedType === "pressure"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Áp suất
        </button>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSensors.map((sensor) => {
          const latestValue = sensor.data && sensor.data.length > 0
          ? sensor.data[sensor.data.length - 1]?.value
          : null;

          let alert = null;
          if (sensor.type === "temperature" && latestValue > 35) {
            alert = "Nhiệt độ cao";
          }
          if (sensor.type === "humidity" && latestValue > 80) {
            alert = "Độ ẩm cao";
          } 
          if (sensor.type === "pressure" && latestValue > 1013) {
            alert = "Áp suất cao";
          }
          if (sensor.type === "other" && latestValue >= 1) {
            alert = "Có chấn động";
          }

          return (
            <Link
            key={sensor._id}
            to={`/sensors/${sensor._id}`}
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getSensorIcon(sensor.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {sensor.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {sensor.deviceId?.name || "N/A"} -{" "}
                    {sensor.deviceId?.stationId?.name || "N/A"}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  sensor.status
                )}`}
              >
                {sensor.status}
              </span>
              <div className="mt-2">
                {alert && (
                  <span className="text-red-600 font-semibold">
                    {alert}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Loại:</span>
                <span className="font-medium">{sensor.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đơn vị:</span>
                <span className="font-medium">{sensor.unit}</span>
              </div>
              {sensor.data && sensor.data.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giá trị mới nhất:</span>
                  <span className="font-medium text-primary-600">
                    {sensor.data[sensor.data.length - 1]?.value} {sensor.unit}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <FiTrendingUp className="h-4 w-4" />
                {sensor.data?.length || 0} dữ liệu
              </div>
              <span className="text-sm text-primary-600 font-medium">
                Xem chi tiết →
              </span>
            </div>
            </Link>
          );
        })}
      </div>

      {filteredSensors.length === 0 && (
        <div className="text-center py-12">
          <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedType === "all"
              ? "Chưa có cảm biến nào"
              : `Không có cảm biến ${selectedType}`}
          </h3>
          <p className="text-gray-500">
            {selectedType === "all"
              ? "Bắt đầu bằng cách thêm cảm biến đầu tiên"
              : "Thử chọn loại cảm biến khác"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Sensors;
