# Net Station Server

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình file `.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/network_tracking

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Chạy server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Cấu trúc thư mục

```
server/
├── config/
│   ├── database.js    # Cấu hình kết nối MongoDB
│   └── index.js       # Cấu hình chính
├── models/            # MongoDB models
├── routes/            # API routes
├── middleware/        # Middleware
├── services/          # Business logic
└── index.js          # Entry point
```
