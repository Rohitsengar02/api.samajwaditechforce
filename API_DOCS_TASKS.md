# Task Management API Documentation

## Base URL
```
http://localhost:5000/api/tasks
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.
Additionally, most endpoints require admin role.

```http
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Get All Tasks
Retrieve a list of all tasks with optional filtering and pagination.

**Endpoint:**
```
GET /api/tasks
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | String | Filter by status: "Active" or "Expired" | - |
| `platform` | String | Filter by platform: "facebook", "twitter", "instagram", "app" | - |
| `page` | Number | Page number for pagination | 1 |
| `limit` | Number | Number of items per page | 20 |

**Example Request:**
```http
GET /api/tasks?status=Active&platform=facebook&page=1&limit=10
Authorization: Bearer your-jwt-token-here
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Share Campaign Video on Facebook",
      "description": "Share our latest campaign video with your network",
      "platform": "facebook",
      "points": 50,
      "deadline": "2025-12-31T00:00:00.000Z",
      "targetAudience": "All",
      "linkToShare": "https://facebook.com/post/123",
      "mediaUrl": "",
      "type": "Social Media",
      "status": "Active",
      "createdBy": {
        "_id": "507f191e810c19729de860ea",
        "name": "Admin User",
        "email": "admin@stf.com"
      },
      "createdAt": "2025-11-25T12:00:00.000Z",
      "updatedAt": "2025-11-25T12:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Task
Retrieve detailed information about a specific task.

**Endpoint:**
```
GET /api/tasks/:id
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the task |

**Example Request:**
```http
GET /api/tasks/507f1f77bcf86cd799439011
Authorization: Bearer your-jwt-token-here
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Share Campaign Video on Facebook",
    "description": "Share our latest campaign video with your network",
    "platform": "facebook",
    "points": 50,
    "deadline": "2025-12-31T00:00:00.000Z",
    "targetAudience": "All",
    "linkToShare": "https://facebook.com/post/123",
    "mediaUrl": "",
    "type": "Social Media",
    "status": "Active",
    "createdBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "Admin User",
      "email": "admin@stf.com"
    },
    "createdAt": "2025-11-25T12:00:00.000Z",
    "updatedAt": "2025-11-25T12:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### 3. Create Task
Create a new task for members to complete.

**Endpoint:**
```
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "Share Campaign Video on Facebook",
  "description": "Share our latest campaign video with your network and tag 3 friends",
  "platform": "facebook",
  "points": 50,
  "deadline": "2025-12-31",
  "targetAudience": "All",
  "linkToShare": "https://facebook.com/post/123",
  "mediaUrl": "",
  "type": "Social Media"
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ Yes | Task title (max 200 chars) |
| `description` | String | No | Detailed task description |
| `platform` | String | ✅ Yes | Platform: "facebook", "twitter", "instagram", "app" |
| `points` | Number | No | Points reward (default: 10) |
| `deadline` | String/Date | No | Task deadline (ISO 8601 or YYYY-MM-DD) |
| `targetAudience` | String | No | Target users (default: "All") |
| `linkToShare` | String | No | URL to share |
| `mediaUrl` | String | No | Reference media URL |
| `type` | String | No | Type: "Social Media", "Field Work", "Event" (default: "Social Media") |

**Example Request:**
```http
POST /api/tasks
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "title": "Share Campaign Video on Facebook",
  "description": "Share our latest campaign video",
  "platform": "facebook",
  "points": 50,
  "deadline": "2025-12-31",
  "targetAudience": "All",
  "linkToShare": "https://facebook.com/post/123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Share Campaign Video on Facebook",
    "description": "Share our latest campaign video",
    "platform": "facebook",
    "points": 50,
    "deadline": "2025-12-31T00:00:00.000Z",
    "targetAudience": "All",
    "linkToShare": "https://facebook.com/post/123",
    "mediaUrl": "",
    "type": "Social Media",
    "status": "Active",
    "createdBy": "507f191e810c19729de860ea",
    "createdAt": "2025-11-25T12:00:00.000Z",
    "updatedAt": "2025-11-25T12:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Task title is required"
}
```

---

### 4. Update Task
Update an existing task.

**Endpoint:**
```
PUT /api/tasks/:id
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the task |

**Request Body:**
(All fields are optional - only include fields you want to update)
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "platform": "twitter",
  "points": 75,
  "deadline": "2025-12-31",
  "targetAudience": "District Heads",
  "linkToShare": "https://twitter.com/post/456",
  "mediaUrl": "https://example.com/media.jpg",
  "type": "Social Media",
  "status": "Active"
}
```

**Example Request:**
```http
PUT /api/tasks/507f1f77bcf86cd799439011
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "points": 75,
  "deadline": "2026-01-15"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Share Campaign Video on Facebook",
    "description": "Share our latest campaign video",
    "platform": "facebook",
    "points": 75,
    "deadline": "2026-01-15T00:00:00.000Z",
    "targetAudience": "All",
    "linkToShare": "https://facebook.com/post/123",
    "type": "Social Media",
    "status": "Active",
    "createdBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "Admin User",
      "email": "admin@stf.com"
    },
    "createdAt": "2025-11-25T12:00:00.000Z",
    "updatedAt": "2025-11-26T10:30:00.000Z"
  }
}
```

---

### 5. Delete Task
Delete a task permanently.

**Endpoint:**
```
DELETE /api/tasks/:id
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the task |

**Example Request:**
```http
DELETE /api/tasks/507f1f77bcf86cd799439011
Authorization: Bearer your-jwt-token-here
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {}
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### 6. Update Task Status
Update only the status of a task (Active/Expired).

**Endpoint:**
```
PATCH /api/tasks/:id/status
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the task |

**Request Body:**
```json
{
  "status": "Expired"
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | ✅ Yes | Must be "Active" or "Expired" |

**Example Request:**
```http
PATCH /api/tasks/507f1f77bcf86cd799439011/status
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "status": "Expired"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Share Campaign Video on Facebook",
    "status": "Expired",
    "createdBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "Admin User",
      "email": "admin@stf.com"
    },
    "createdAt": "2025-11-25T12:00:00.000Z",
    "updatedAt": "2025-11-26T15:45:00.000Z"
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Error Response Format

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Platform Values
- `facebook`
- `twitter`
- `instagram`
- `app`

## Task Types
- `Social Media` (default)
- `Field Work`
- `Event`

## Task Status
- `Active` (default)
- `Expired`

---

## Testing with cURL

### Create a Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "platform": "facebook",
    "points": 25,
    "deadline": "2025-12-31"
  }'
```

### Get All Tasks
```bash
curl -X GET "http://localhost:5000/api/tasks?status=Active&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Update Task
```bash
curl -X PUT http://localhost:5000/api/tasks/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "points": 50
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer your-jwt-token"
```

---

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token with admin privileges.
2. **Validation**: Title and platform are required fields when creating a task.
3. **Date Format**: Deadlines can be provided in ISO 8601 format or YYYY-MM-DD.
4. **Pagination**: Default pagination is 20 items per page, max 100.
5. **Filtering**: You can filter by status and platform simultaneously.
6. **Population**: The `createdBy` field is automatically populated with user details.

---

## Frontend Integration Example

```typescript
// Create Task
const createTask = async (taskData) => {
  const response = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(taskData),
  });
  
  const result = await response.json();
  return result;
};

// Get All Tasks
const getTasks = async () => {
  const response = await fetch('http://localhost:5000/api/tasks?status=Active', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
  
  const result = await response.json();
  return result.data;
};
```
