import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSmartphone, FiPlus, FiEdit, FiTrash2, FiWifi, FiWifiOff } from 'react-icons/fi';

function Devices() {
  const [devices, setDevices] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stationId: '',
    type: '',
    model: '',
    serialNumber: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, stationsRes] = await Promise.all([
        axios.get('/devices'),
        axios.get('/stations')
      ]);
      setDevices(devicesRes.data);
      setStations(stationsRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await axios.put(`/devices/${editingDevice._id}`, formData);
      } else {
        await axios.post('/devices', formData);
      }
      setShowModal(false);
      setEditingDevice(null);
      setFormData({
        name: '',
        stationId: '',
        type: '',
        model: '',
        serialNumber: '',
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Lỗi lưu thiết bị:', error);
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      stationId: device.stationId._id || device.stationId,
      type: device.type,
      model: device.model || '',
      serialNumber: device.serialNumber || '',
      description: device.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thiết bị này?')) {
      try {
        await axios.delete(`/devices/${id}`);
        fetchData();
      } catch (error) {
        console.error('Lỗi xóa thiết bị:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'online' ? (
      <FiWifi className="h-4 w-4" />
    ) : (
      <FiWifiOff className="h-4 w-4" />
    );
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thiết bị</h1>
          <p className="text-gray-600">Thêm, sửa, xóa các thiết bị quan trắc</p>
        </div>
        <button
          onClick={() => {
            setEditingDevice(null);
            setFormData({
              name: '',
              stationId: '',
              type: '',
              model: '',
              serialNumber: '',
              description: ''
            });
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Thêm thiết bị
        </button>
      </div>

      {/* Devices Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FiSmartphone className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                        {/* {device.model && (
                          <div className="text-sm text-gray-500">{device.model}</div>
                        )} */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {device.stationId?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="ml-1">{device.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(device)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(device._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <FiSmartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thiết bị nào</h3>
          <p className="text-gray-500">Bắt đầu bằng cách thêm thiết bị đầu tiên</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingDevice ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tên thiết bị</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Trạm</label>
                <select
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Chọn trạm</option>
                  {stations.map((station) => (
                    <option key={station._id} value={station._id}>
                      {station.name} - {station.location}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Loại thiết bị</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingDevice ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devices; 