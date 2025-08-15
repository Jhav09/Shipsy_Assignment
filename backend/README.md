# Shipment Manager Backend API

A Node.js/Express backend API for the Shipment Management System with MySQL database integration.

## Features

- 🔐 **User Authentication** - JWT-based login/register system
- 📦 **Shipment Management** - Full CRUD operations for shipments
- 🔍 **Advanced Filtering** - Search, filter, sort, and pagination
- 📊 **Statistics** - Dashboard analytics for shipment status
- 🛡️ **Security** - Password hashing, input validation, SQL injection protection
- 🗄️ **MySQL Database** - Persistent data storage with relational structure

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env` file and update with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=shipment_manager
   DB_PORT=3306
   JWT_SECRET=your_strong_jwt_secret_key
   ```

4. **Initialize database:**
   ```bash
   npm run init-db
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Shipments (Protected Routes)
- `GET /api/shipments` - Get all shipments with filtering/pagination
- `GET /api/shipments/:id` - Get single shipment
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment
- `GET /api/shipments/stats/summary` - Get shipment statistics

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('coordinator', 'admin') DEFAULT 'coordinator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Shipments Table
```sql
CREATE TABLE shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  destination_address TEXT NOT NULL,
  status ENUM('PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED') DEFAULT 'PENDING',
  is_fragile BOOLEAN DEFAULT FALSE,
  ship_date DATE NOT NULL,
  estimated_delivery_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Default Credentials

After running `npm run init-db`, you can login with:
- **Username:** coordinator
- **Password:** shipment123

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123",
    "full_name": "New User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "coordinator",
    "password": "shipment123"
  }'
```

### Create Shipment (with JWT token)
```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tracking_number": "TRK123",
    "destination_address": "123 Main St, City, State",
    "status": "PENDING",
    "is_fragile": true,
    "ship_date": "2024-01-15",
    "estimated_delivery_date": "2024-01-20",
    "notes": "Handle with care"
  }'
```

## Development

- **Database Reset:** Delete the database and run `npm run init-db` again
- **Logs:** Server logs all requests and errors to console
- **Hot Reload:** Use `npm run dev` for automatic server restart on file changes

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- SQL injection protection with parameterized queries
- CORS configuration
- Request rate limiting ready for production

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper MySQL user with limited permissions
4. Add rate limiting middleware
5. Set up HTTPS
6. Configure proper CORS origins

## Troubleshooting

- **Database Connection Error:** Check MySQL server is running and credentials are correct
- **Port Already in Use:** Change PORT in .env file
- **JWT Errors:** Ensure JWT_SECRET is set and tokens are properly formatted
- **Permission Errors:** Check MySQL user has proper database permissions
