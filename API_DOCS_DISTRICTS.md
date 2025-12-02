# District Management API Documentation

## Base URL
```
http://localhost:5000/api/districts
```

## Authentication
(Temporarily disabled for testing on POST/GET)
Normally requires Bearer token.

---

## Endpoints

### 1. Get All Districts
Retrieve a list of all districts.

**Endpoint:**
```
GET /api/districts
```

**Response (200 OK):**
```json
[
  {
    "_id": "60d5ecb8b487343568912345",
    "name": "Lucknow",
    "headName": "Rahul Singh",
    "headPhone": "9876543210",
    "headEmail": "rahul@example.com",
    "assemblyCount": 5,
    "assemblies": [],
    "totalMembers": 0,
    "createdAt": "2025-11-25T10:00:00.000Z"
  }
]
```

---

### 2. Create District
Create a new district.

**Endpoint:**
```
POST /api/districts
```

**Request Body:**
```json
{
  "name": "Varanasi",
  "headName": "Amit Kumar",
  "headPhone": "9988776655",
  "headEmail": "amit@example.com",
  "assemblyCount": 8,
  "assemblies": [] 
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ Yes | District Name (Unique) |
| `headName` | String | No | Name of District Head |
| `headPhone` | String | No | Phone number of Head |
| `headEmail` | String | No | Email of Head |
| `assemblyCount` | Number | No | Number of assemblies |
| `assemblies` | Array | No | List of assembly names (optional) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "District created successfully",
  "data": {
    "_id": "60d5ecb8b487343568912345",
    "name": "Varanasi",
    ...
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "District already exists"
}
```
