import { FiAlertCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const Alert = ({ type = 'info', message, className = '' }) => {
  const alertStyles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200'
  };

  const icons = {
    info: FiInfo,
    warning: FiAlertTriangle,
    error: FiAlertCircle,
    success: FiInfo
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-center p-3 rounded-lg border ${alertStyles[type]} ${className}`}>
      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Alert;