# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All shipment endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object,
  "errors": array (optional)
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "coordinator"
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric and underscores only
- `email`: Valid email format
- `password`: Minimum 6 characters
- `full_name`: 2-100 characters
- `role`: Optional, defaults to "coordinator"

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "coordinator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Username or email already exists"
}
```

---

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "coordinator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### Verify Token
**GET** `/auth/verify`

Verify JWT token validity and get user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "coordinator"
    }
  }
}
```

---

## Shipment Endpoints

### Get All Shipments
**GET** `/shipments`

Retrieve all shipments for the authenticated user with pagination, search, and filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `search` (optional): Search by tracking number or destination address
- `status` (optional): Filter by status (PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, DELAYED, ALL)
- `sortBy` (optional): Sort field (tracking_number, destination_address, status, ship_date, estimated_delivery_date, createdAt)
- `sortOrder` (optional): Sort direction (asc, desc) - default: desc
- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 10

**Example Request:**
```
GET /api/shipments?search=TRK123&status=IN_TRANSIT&sortBy=ship_date&sortOrder=asc&page=1&limit=5
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "shipments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "tracking_number": "TRK123456789",
        "destination_address": "123 Main St, New York, NY 10001",
        "status": "IN_TRANSIT",
        "is_fragile": true,
        "ship_date": "2024-01-15T00:00:00.000Z",
        "estimated_delivery_date": "2024-01-20T00:00:00.000Z",
        "notes": "Handle with care",
        "createdAt": "2024-01-10T10:30:00.000Z",
        "updatedAt": "2024-01-15T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### Get Single Shipment
**GET** `/shipments/:id`

Retrieve a specific shipment by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "tracking_number": "TRK123456789",
    "destination_address": "123 Main St, New York, NY 10001",
    "status": "IN_TRANSIT",
    "is_fragile": true,
    "ship_date": "2024-01-15T00:00:00.000Z",
    "estimated_delivery_date": "2024-01-20T00:00:00.000Z",
    "notes": "Handle with care",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Shipment not found"
}
```

---

### Create Shipment
**POST** `/shipments`

Create a new shipment.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "tracking_number": "TRK123456789",
  "destination_address": "123 Main St, New York, NY 10001",
  "status": "PENDING",
  "is_fragile": true,
  "ship_date": "2024-01-15T00:00:00.000Z",
  "estimated_delivery_date": "2024-01-20T00:00:00.000Z",
  "notes": "Handle with care"
}
```

**Validation Rules:**
- `tracking_number`: Required, max 50 characters, must be unique
- `destination_address`: Required
- `status`: Optional, must be one of: PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, DELAYED
- `is_fragile`: Optional boolean, defaults to false
- `ship_date`: Required, valid ISO 8601 date
- `estimated_delivery_date`: Required, valid ISO 8601 date
- `notes`: Optional, max 1000 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "tracking_number": "TRK123456789",
    "destination_address": "123 Main St, New York, NY 10001",
    "status": "PENDING",
    "is_fragile": true,
    "ship_date": "2024-01-15T00:00:00.000Z",
    "estimated_delivery_date": "2024-01-20T00:00:00.000Z",
    "notes": "Handle with care",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Tracking number already exists"
}
```

---

### Update Shipment
**PUT** `/shipments/:id`

Update an existing shipment.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body (all fields optional):**
```json
{
  "tracking_number": "TRK987654321",
  "destination_address": "456 Oak Ave, Los Angeles, CA 90210",
  "status": "DELIVERED",
  "is_fragile": false,
  "ship_date": "2024-01-16T00:00:00.000Z",
  "estimated_delivery_date": "2024-01-21T00:00:00.000Z",
  "notes": "Updated delivery instructions"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shipment updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "user_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "tracking_number": "TRK987654321",
    "destination_address": "456 Oak Ave, Los Angeles, CA 90210",
    "status": "DELIVERED",
    "is_fragile": false,
    "ship_date": "2024-01-16T00:00:00.000Z",
    "estimated_delivery_date": "2024-01-21T00:00:00.000Z",
    "notes": "Updated delivery instructions",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-18T16:45:00.000Z"
  }
}
```

---

### Delete Shipment
**DELETE** `/shipments/:id`

Delete a shipment.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shipment deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Shipment not found"
}
```

---

### Get Shipment Statistics
**GET** `/shipments/stats/summary`

Get shipment statistics summary for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 5,
    "in_transit": 8,
    "out_for_delivery": 3,
    "delivered": 7,
    "delayed": 2
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation Error |
| 401 | Unauthorized - Invalid/Missing Token |
| 404 | Not Found |
| 409 | Conflict - Resource Already Exists |
| 500 | Internal Server Error |

---

## Status Values

Shipments can have the following status values:
- `PENDING`: Shipment is created but not yet shipped
- `IN_TRANSIT`: Shipment is on its way to destination
- `OUT_FOR_DELIVERY`: Shipment is out for final delivery
- `DELIVERED`: Shipment has been successfully delivered
- `DELAYED`: Shipment delivery is delayed

---

## Example Usage with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

### Create a shipment:
```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tracking_number": "TRK123456789",
    "destination_address": "123 Main St, New York, NY 10001",
    "ship_date": "2024-01-15T00:00:00.000Z",
    "estimated_delivery_date": "2024-01-20T00:00:00.000Z",
    "is_fragile": true,
    "notes": "Handle with care"
  }'
```

### Get all shipments with search:
```bash
curl -X GET "http://localhost:3001/api/shipments?search=TRK123&status=IN_TRANSIT&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
