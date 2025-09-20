import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await axios.get('/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Lỗi tải danh sách trạm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStation) {
        await axios.put(`/stations/${editingStation._id}`, formData);
      } else {
        await axios.post('/stations', formData);
      }
      setShowModal(false);
      setEditingStation(null);
      setFormData({ name: '', location: '', description: '' });
      fetchStations();
    } catch (error) {
      console.error('Lỗi lưu trạm:', error);
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      location: station.location,
      description: station.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa trạm này?')) {
      try {
        await axios.delete(`/stations/${id}`);
        fetchStations();
      } catch (error) {
        console.error('Lỗi xóa trạm:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Trạm</h1>
          <p className="text-gray-600">Thêm, sửa, xóa các trạm quan trắc</p>
        </div>
        <button
          onClick={() => {
            setEditingStation(null);
            setFormData({ name: '', location: '', description: '' });
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Thêm trạm
        </button>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station) => (
          <div key={station._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiMapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
                  <p className="text-sm text-gray-500">{station.location}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                {station.status || 'active'}
              </span>
            </div>
            
            {station.description && (
              <p className="mt-3 text-sm text-gray-600">{station.description}</p>
            )}
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(station)}
                className="btn btn-secondary flex items-center gap-1 text-sm"
              >
                <FiEdit className="h-4 w-4" />
                Sửa
              </button>
              <button
                onClick={() => handleDelete(station._id)}
                className="btn btn-danger flex items-center gap-1 text-sm"
              >
                <FiTrash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {stations.length === 0 && (
        <div className="text-center py-12">
          <FiMapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trạm nào</h3>
          <p className="text-gray-500">Bắt đầu bằng cách thêm trạm đầu tiên</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStation ? 'Sửa trạm' : 'Thêm trạm mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tên trạm</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Vị trí</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                  required
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
                  {editingStation ? 'Cập nhật' : 'Thêm'}
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

export default Stations; 