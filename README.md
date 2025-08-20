# Shipment Management System

A full-stack web application for managing shipments with user authentication, CRUD operations, and real-time tracking capabilities.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Shipment Management**: Create, read, update, and delete shipments
- **Real-time Tracking**: Track shipment status with multiple states
- **Search & Filter**: Search by tracking number or destination address
- **Sorting & Pagination**: Efficient data handling for large datasets
- **Statistics Dashboard**: Overview of shipment statistics by status
- **Responsive UI**: Modern React-based frontend with clean design
- **Data Validation**: Comprehensive input validation on both frontend and backend

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests

### Frontend
- **React.js** with functional components and hooks
- **CSS3** for styling
- **Font Awesome** for icons
- **Local Storage** for token persistence

## 📁 Project Structure

```
Shipsy Assignment/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection and models
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── shipments.js         # Shipment CRUD routes
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server setup
│   └── package.json             # Backend dependencies
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API service layer
│   │   ├── utils/               # Utility functions
│   │   ├── App.js               # Main App component
│   │   └── App.css              # Global styles
│   └── package.json             # Frontend dependencies
└── README.md                    # Project documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Shipsy Assignment"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # MongoDB Configuration
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:3001`

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm start
   ```
   Application will open at `http://localhost:3000`

## 📊 Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  full_name: String (required),
  role: String (default: 'coordinator'),
  createdAt: Date,
  updatedAt: Date
}
```

### Shipment Model
```javascript
{
  user_id: ObjectId (required),
  tracking_number: String (unique, required),
  destination_address: String (required),
  status: String (enum: ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED']),
  is_fragile: Boolean (default: false),
  ship_date: Date (required),
  estimated_delivery_date: Date (required),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage on the frontend
- All shipment routes require authentication
- Tokens expire after 24 hours (configurable)
- Automatic token verification on app load

## 🎯 Usage

1. **Registration**: Create a new account with username, email, password, and full name
2. **Login**: Sign in with your username and password
3. **Dashboard**: View shipment statistics and manage shipments
4. **Create Shipment**: Add new shipments with tracking details
5. **Search & Filter**: Find shipments by tracking number or destination
6. **Update Status**: Modify shipment status and details
7. **Delete Shipments**: Remove shipments from the system

## 🚀 Deployment

### Backend Deployment (AWS)
backend- https://counseling-enters-cables-ross.trycloudflare.com/api/shipments

### Frontend Deployment (AWS)
https://dg-envelope-router-named.trycloudflare.com/

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### API Health Check
Visit `http://localhost:3001/health` to verify backend is running

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Shipments
- `GET /api/shipments` - Get all shipments (with pagination, search, filter)
- `GET /api/shipments/:id` - Get single shipment
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment
- `GET /api/shipments/stats/summary` - Get shipment statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.
