# Database Schema Documentation

This document describes the MongoDB database schema for the Shipment Management System.

## 📊 Database Overview

- **Database Type**: MongoDB (NoSQL Document Database)
- **ODM**: Mongoose
- **Connection**: MongoDB Atlas (Cloud)

---

## 👤 User Collection

### Schema Definition
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Exclude from queries by default
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['coordinator', 'admin', 'manager'],
    default: 'coordinator'
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});
```

### Indexes
```javascript
// Unique indexes for performance and data integrity
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
```

### Sample Document
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$10$encrypted_password_hash",
  "full_name": "John Doe",
  "role": "coordinator",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB unique identifier |
| `username` | String | Yes | Unique username (3-50 chars, alphanumeric + underscore) |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Bcrypt hashed password (min 6 chars) |
| `full_name` | String | Yes | User's full name (2-100 chars) |
| `role` | String | No | User role (coordinator/admin/manager) |
| `createdAt` | Date | Auto | Account creation timestamp |
| `updatedAt` | Date | Auto | Last modification timestamp |

---

## 📦 Shipment Collection

### Schema Definition
```javascript
const shipmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tracking_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  destination_address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED'],
    default: 'PENDING'
  },
  is_fragile: {
    type: Boolean,
    default: false
  },
  ship_date: {
    type: Date,
    required: true
  },
  estimated_delivery_date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  }
}, {
  timestamps: true
});
```

### Indexes
```javascript
// Compound index for user-specific queries
shipmentSchema.index({ user_id: 1, createdAt: -1 });

// Unique index for tracking numbers
shipmentSchema.index({ tracking_number: 1 }, { unique: true });

// Index for status filtering
shipmentSchema.index({ status: 1 });

// Text index for search functionality
shipmentSchema.index({ 
  tracking_number: 'text', 
  destination_address: 'text' 
});
```

### Sample Document
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "tracking_number": "TRK123456789",
  "destination_address": "123 Main St, New York, NY 10001",
  "status": "IN_TRANSIT",
  "is_fragile": true,
  "ship_date": "2024-01-15T00:00:00.000Z",
  "estimated_delivery_date": "2024-01-20T00:00:00.000Z",
  "notes": "Handle with care - fragile electronics",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB unique identifier |
| `user_id` | ObjectId | Yes | Reference to User who owns this shipment |
| `tracking_number` | String | Yes | Unique tracking identifier (max 50 chars) |
| `destination_address` | String | Yes | Delivery destination address |
| `status` | String | No | Current shipment status (default: PENDING) |
| `is_fragile` | Boolean | No | Whether shipment contains fragile items |
| `ship_date` | Date | Yes | Date when shipment was sent |
| `estimated_delivery_date` | Date | Yes | Expected delivery date |
| `notes` | String | No | Additional notes or instructions (max 1000 chars) |
| `createdAt` | Date | Auto | Shipment creation timestamp |
| `updatedAt` | Date | Auto | Last modification timestamp |

---

## 🔗 Relationships

### User → Shipments (One-to-Many)
- One user can have multiple shipments
- Each shipment belongs to exactly one user
- Relationship established via `user_id` field in Shipment collection

```javascript
// Populate shipments for a user
const userWithShipments = await User.findById(userId).populate('shipments');

// Find shipments for a specific user
const userShipments = await Shipment.find({ user_id: userId });
```

---

## 📈 Query Patterns

### Common Queries

#### User Authentication
```javascript
// Find user by username for login
const user = await User.findOne({ username }).select('+password');

// Find user by ID for token verification
const user = await User.findById(userId);
```

#### Shipment Operations
```javascript
// Get paginated shipments for user
const shipments = await Shipment.find({ user_id: userId })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);

// Search shipments by tracking number or address
const shipments = await Shipment.find({
  user_id: userId,
  $or: [
    { tracking_number: { $regex: searchTerm, $options: 'i' } },
    { destination_address: { $regex: searchTerm, $options: 'i' } }
  ]
});

// Filter by status
const shipments = await Shipment.find({ 
  user_id: userId, 
  status: 'IN_TRANSIT' 
});

// Get shipment statistics
const stats = await Shipment.aggregate([
  { $match: { user_id: userId } },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
      in_transit: { $sum: { $cond: [{ $eq: ['$status', 'IN_TRANSIT'] }, 1, 0] } },
      delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } }
    }
  }
]);
```

---

## 🔒 Data Validation

### Mongoose Validation
- **Built-in validators**: required, unique, min/max length, enum
- **Custom validators**: regex patterns for username and email
- **Pre-save hooks**: password hashing before saving

### Application-level Validation
- **express-validator**: Additional validation in API routes
- **Frontend validation**: Real-time validation in React components

---

## 🚀 Performance Considerations

### Indexing Strategy
1. **Primary indexes**: _id (automatic)
2. **Unique indexes**: username, email, tracking_number
3. **Compound indexes**: user_id + createdAt for user-specific queries
4. **Text indexes**: tracking_number + destination_address for search
5. **Single field indexes**: status for filtering

### Query Optimization
- Use projection to limit returned fields
- Implement pagination for large result sets
- Use aggregation pipeline for complex statistics
- Cache frequently accessed data

### Connection Management
```javascript
// Connection pooling configuration
mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
});
```

---

## 🔄 Data Migration

### Initial Setup
```javascript
// Create collections and indexes
await User.createIndexes();
await Shipment.createIndexes();
```

### Sample Data Creation
```javascript
// Create sample user
const sampleUser = new User({
  username: 'demo_user',
  email: 'demo@example.com',
  password: await bcrypt.hash('password123', 10),
  full_name: 'Demo User',
  role: 'coordinator'
});

// Create sample shipment
const sampleShipment = new Shipment({
  user_id: sampleUser._id,
  tracking_number: 'DEMO123456',
  destination_address: '123 Demo Street, Demo City, DC 12345',
  status: 'PENDING',
  is_fragile: false,
  ship_date: new Date(),
  estimated_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  notes: 'Sample shipment for testing'
});
```

---

## 📊 Database Statistics

### Collection Sizes (Estimated)
- **Users**: ~1KB per document
- **Shipments**: ~500 bytes per document

### Growth Projections
- **Users**: Linear growth based on registration rate
- **Shipments**: Higher growth rate, multiple shipments per user

### Backup Strategy
- **MongoDB Atlas**: Automatic backups with point-in-time recovery
- **Manual exports**: Regular JSON exports for critical data
- **Replication**: Multi-region replica sets for high availability

---

## 🛠️ Database Maintenance

### Regular Tasks
1. **Monitor index usage**: Identify unused indexes
2. **Analyze query performance**: Use MongoDB Profiler
3. **Clean up old data**: Archive delivered shipments older than 1 year
4. **Update statistics**: Refresh collection statistics

### Monitoring Queries
```javascript
// Check database stats
db.stats()

// Check collection stats
db.users.stats()
db.shipments.stats()

// Check index usage
db.shipments.getIndexes()
```

---

## 🔍 Troubleshooting

### Common Issues
1. **Duplicate key errors**: Check unique constraints
2. **Slow queries**: Analyze indexes and query patterns
3. **Connection timeouts**: Review connection pool settings
4. **Memory usage**: Monitor document sizes and query complexity

### Debug Commands
```javascript
// Explain query execution
db.shipments.find({ user_id: ObjectId("...") }).explain("executionStats")

// Check current operations
db.currentOp()

// View server status
db.serverStatus()
```
