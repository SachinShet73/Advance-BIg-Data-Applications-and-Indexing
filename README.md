# Healthcare Insurance Plan Management API

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Healthcare](https://img.shields.io/badge/Healthcare-Insurance-blue.svg)](https://healthcare.gov/)

A production-ready REST API for managing healthcare insurance plans with complex cost-sharing structures, service-specific overrides, and real-time patient cost calculations. Built with Node.js, Express, and comprehensive JSON Schema validation.

## 🏥 Business Use Case

**Healthcare Insurance Plan Configuration and Cost Calculation**

Insurance companies need to manage complex healthcare plans with different cost-sharing structures for various medical services. Each plan has overall deductibles/copays plus service-specific cost sharing rules that override defaults.

### Key Business Problems Solved:
- **Plan Configuration Management**: Centralized storage and validation of insurance plan structures
- **Service-Specific Cost Overrides**: Handle different copays/deductibles for specific medical services
- **Real-Time Cost Calculation**: Calculate patient responsibility before service delivery
- **Organization Consistency**: Ensure all plan components belong to the same insurance organization
- **Compliance & Auditing**: Track plan changes with versioning and timestamps

## 🚀 Features

- ✅ **Insurance Plan CRUD**: Create, read, delete healthcare insurance plans
- ✅ **Complex Schema Validation**: Validates nested plan structures with cost-sharing rules
- ✅ **Service Override Logic**: Service-specific cost sharing overrides plan defaults
- ✅ **Patient Cost Calculation**: Real-time calculation of patient financial responsibility
- ✅ **Organization Consistency**: Validates all nested objects belong to same organization
- ✅ **Object ID Uniqueness**: Ensures unique identifiers across plan components
- ✅ **Conditional Reads**: ETags support for efficient caching and bandwidth optimization
- ✅ **Filtered Queries**: Search plans by organization and plan type
- ✅ **API Versioning**: Future-proof versioned endpoints (`/api/v1`)
- ✅ **Security Headers**: Helmet.js integration for security best practices
- ✅ **CORS Support**: Cross-origin resource sharing enabled
- ✅ **Request Logging**: Morgan middleware for comprehensive request logging
- ✅ **Error Handling**: Standardized error responses with proper HTTP status codes
- ✅ **Health Monitoring**: Built-in health check endpoint

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Data Model](#-data-model)
- [Usage Examples](#-usage-examples)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Contributing](#-contributing)

## ⚡ Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd structured-data-rest-api

# Install dependencies
npm install

# Start the development server
npm run dev

# Or start production server
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL: `/api/v1`

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/plans` | Create new insurance plan | `201`, `400`, `409`, `500` |
| `GET` | `/plans/{planId}` | Retrieve specific plan | `200`, `304`, `404`, `500` |
| `GET` | `/plans` | List all plans (supports filters) | `200`, `500` |
| `DELETE` | `/plans/{planId}` | Delete insurance plan | `204`, `404`, `500` |
| `GET` | `/plans/{planId}/cost-calculation` | Calculate patient cost | `200`, `400`, `404`, `500` |
| `GET` | `/health` | Health check endpoint | `200` |
| `GET` | `/api/v1` | API documentation endpoint | `200` |

### 🔧 Request/Response Headers

| Header | Usage | Description |
|--------|-------|-------------|
| `Content-Type` | Request/Response | Always `application/json` |
| `ETag` | Response | Entity tag for caching |
| `If-None-Match` | Request | Conditional read support |
| `Location` | Response | URI of created resource |
| `Cache-Control` | Response | Caching directives |

### 📊 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET request |
| `201` | Created | Resource created successfully |
| `204` | No Content | Resource deleted successfully |
| `304` | Not Modified | Resource unchanged (conditional read) |
| `400` | Bad Request | Validation failed |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `500` | Server Error | Internal server error |

## 🗂️ Insurance Plan Data Model

The API manages complex healthcare insurance plans with nested cost-sharing structures:

### Core Insurance Plan Schema (POST /plans)

```json
{
  "objectId": "plan-12345",                   // Auto-generated if not provided
  "objectType": "plan",                       // Required: must be "plan"
  "planType": "inNetwork",                    // Required: inNetwork|outOfNetwork|emergency
  "_org": "healthcorp.com",                   // Required: organization domain
  "creationDate": "06-05-2025",              // Required: MM-DD-YYYY format
  "planCostShares": {                         // Required: plan-level cost sharing
    "objectId": "cost-67890",                 // Auto-generated if not provided
    "objectType": "membercostshare",          // Required
    "deductible": 2000,                       // Required: annual deductible
    "copay": 25,                              // Required: default copay
    "_org": "healthcorp.com"                  // Required: must match plan._org
  },
  "linkedPlanServices": [                     // Optional: service-specific overrides
    {
      "objectId": "planservice-111",          // Auto-generated if not provided
      "objectType": "planservice",            // Required
      "_org": "healthcorp.com",               // Required: must match plan._org
      "linkedService": {
        "objectId": "service-222",            // Auto-generated if not provided
        "objectType": "service",              // Required
        "name": "Annual Physical",            // Required: service name
        "_org": "healthcorp.com"              // Required: must match plan._org
      },
      "planserviceCostShares": {
        "objectId": "cost-333",               // Auto-generated if not provided
        "objectType": "membercostshare",      // Required
        "deductible": 0,                      // Service-specific deductible
        "copay": 0,                           // Service-specific copay (overrides plan default)
        "_org": "healthcorp.com"              // Required: must match plan._org
      }
    }
  ]
}
```

### Complete Response Schema (GET /plans/{planId})

```json
{
  "objectId": "plan-12345",
  "objectType": "plan",
  "planType": "inNetwork",
  "_org": "healthcorp.com",
  "creationDate": "06-05-2025",
  "planCostShares": {
    "objectId": "cost-67890",
    "objectType": "membercostshare",
    "deductible": 2000,
    "copay": 25,
    "_org": "healthcorp.com"
  },
  "linkedPlanServices": [
    {
      "objectId": "planservice-111",
      "objectType": "planservice",
      "_org": "healthcorp.com",
      "linkedService": {
        "objectId": "service-222",
        "objectType": "service",
        "name": "Annual Physical",
        "_org": "healthcorp.com"
      },
      "planserviceCostShares": {
        "objectId": "cost-333",
        "objectType": "membercostshare",
        "deductible": 0,
        "copay": 0,
        "_org": "healthcorp.com"
      }
    }
  ],
  "metadata": {                               // Auto-generated by server
    "createdAt": "2025-06-05T17:00:00.000Z",
    "updatedAt": "2025-06-05T17:00:00.000Z",
    "version": 1
  }
}
```

### Business Logic Rules

| Rule | Description | Implementation |
|------|-------------|----------------|
| **Organization Consistency** | All nested `_org` values must match the plan's `_org` | Validated in middleware |
| **Object ID Uniqueness** | All `objectId` values must be unique within the plan | Validated in middleware |
| **Service Cost Override** | Service-level cost sharing overrides plan defaults | Implemented in cost calculation |
| **Plan Type Validation** | Plan type must be valid enum value | JSON schema validation |
| **Date Format** | Creation date must be MM-DD-YYYY | Custom validation middleware |

### Cost Calculation Hierarchy

1. **Check for Service Override**: Look for service-specific cost sharing
2. **Apply Service Rules**: If found, use service `deductible` and `copay`
3. **Fall Back to Plan**: If no override, use plan-level `deductible` and `copay`
4. **Calculate Patient Cost**: Apply deductible first, then copay

## 💡 Usage Examples

### 1. Create a New Insurance Plan

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "objectType": "plan",
    "planType": "inNetwork",
    "_org": "healthcorp.com",
    "creationDate": "06-05-2025",
    "planCostShares": {
      "objectType": "membercostshare",
      "deductible": 1500,
      "copay": 25,
      "_org": "healthcorp.com"
    },
    "linkedPlanServices": [
      {
        "objectType": "planservice",
        "_org": "healthcorp.com",
        "linkedService": {
          "objectType": "service",
          "name": "Annual Physical",
          "_org": "healthcorp.com"
        },
        "planserviceCostShares": {
          "objectType": "membercostshare",
          "deductible": 0,
          "copay": 0,
          "_org": "healthcorp.com"
        }
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "message": "Insurance plan created successfully",
  "objectId": "lts123abc456",
  "planType": "inNetwork",
  "version": 1,
  "timestamp": "2025-06-05T17:00:00.000Z"
}
```

**Headers:**
```
ETag: "a1b2c3d4"
Location: /api/v1/plans/lts123abc456
```

### 2. Retrieve an Insurance Plan

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/plans/lts123abc456
```

**Response (200 OK):**
```json
{
  "objectId": "lts123abc456",
  "objectType": "plan",
  "planType": "inNetwork",
  "_org": "healthcorp.com",
  "creationDate": "06-05-2025",
  "planCostShares": {
    "objectId": "lts123def789",
    "objectType": "membercostshare",
    "deductible": 1500,
    "copay": 25,
    "_org": "healthcorp.com"
  },
  "linkedPlanServices": [
    {
      "objectId": "lts123ghi012",
      "objectType": "planservice",
      "_org": "healthcorp.com",
      "linkedService": {
        "objectId": "lts123jkl345",
        "objectType": "service",
        "name": "Annual Physical",
        "_org": "healthcorp.com"
      },
      "planserviceCostShares": {
        "objectId": "lts123mno678",
        "objectType": "membercostshare",
        "deductible": 0,
        "copay": 0,
        "_org": "healthcorp.com"
      }
    }
  ],
  "metadata": {
    "createdAt": "2025-06-05T17:00:00.000Z",
    "updatedAt": "2025-06-05T17:00:00.000Z",
    "version": 1
  }
}
```

### 3. Calculate Patient Cost for a Service

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/plans/lts123abc456/cost-calculation?serviceId=lts123jkl345&claimAmount=200"
```

**Response (200 OK):**
```json
{
  "planId": "lts123abc456",
  "serviceId": "lts123jkl345",
  "claimAmount": 200,
  "applicableCostShares": {
    "objectId": "lts123mno678",
    "objectType": "membercostshare",
    "deductible": 0,
    "copay": 0,
    "_org": "healthcorp.com"
  },
  "patientResponsibility": {
    "totalPatientCost": 0,
    "deductiblePortion": 0,
    "copayPortion": 0,
    "insurancePays": 200,
    "claimAmount": 200
  },
  "serviceOverrideApplied": true,
  "calculation": {
    "deductible": 0,
    "copay": 0,
    "patientPays": 0
  },
  "timestamp": "2025-06-05T17:05:00.000Z"
}
```

### 4. List Plans with Filters

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/plans?org=healthcorp.com&planType=inNetwork"
```

**Response (200 OK):**
```json
{
  "plans": [
    {
      "key": "lts123abc456",
      "objectId": "lts123abc456",
      "planType": "inNetwork",
      "_org": "healthcorp.com",
      "metadata": {
        "createdAt": "2025-06-05T17:00:00.000Z",
        "updatedAt": "2025-06-05T17:00:00.000Z",
        "version": 1
      }
    }
  ],
  "count": 1,
  "filters": {
    "org": "healthcorp.com",
    "planType": "inNetwork"
  },
  "timestamp": "2025-06-05T17:05:00.000Z"
}
```

### 5. Delete an Insurance Plan

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/v1/plans/lts123abc456
```

**Response (204 No Content):**
```
Status: 204 No Content
(Empty body)
```

### 6. Validation Error Example

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "objectType": "plan",
    "planType": "invalidType",
    "_org": "healthcorp.com",
    "creationDate": "invalid-date",
    "planCostShares": {
      "objectType": "membercostshare",
      "deductible": -100,
      "_org": "different-org.com"
    }
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "Insurance Plan Validation Failed",
  "message": "The provided insurance plan data does not conform to the required schema",
  "details": [
    {
      "field": "/planType",
      "message": "must be equal to one of the allowed values",
      "value": "invalidType",
      "allowedValues": ["inNetwork", "outOfNetwork", "emergency"]
    },
    {
      "field": "/creationDate",
      "message": "must match pattern \"^\\\\d{2}-\\\\d{2}-\\\\d{4}$\"",
      "value": "invalid-date"
    },
    {
      "field": "/planCostShares/deductible",
      "message": "must be >= 0",
      "value": -100
    },
    {
      "field": "/planCostShares",
      "message": "must have required property 'copay'"
    }
  ],
  "timestamp": "2025-06-05T17:00:00.000Z"
}
```

### 7. Organization Consistency Error

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "objectType": "plan",
    "planType": "inNetwork",
    "_org": "healthcorp.com",
    "creationDate": "06-05-2025",
    "planCostShares": {
      "objectType": "membercostshare",
      "deductible": 1500,
      "copay": 25,
      "_org": "different-org.com"
    }
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "Organization Consistency Validation Failed",
  "message": "All nested objects must have the same _org value as the parent plan",
  "timestamp": "2025-06-05T17:00:00.000Z"
}
```

## 🏗️ Architecture

### Project Structure

```
src/
├── app.js                 # Main application entry point
├── controllers/
│   └── dataController.js  # Business logic for data operations
├── middleware/
│   └── validation.js      # JSON schema validation middleware
├── routes/
│   └── dataRoutes.js      # API route definitions
├── schemas/
│   └── data-schema.json   # JSON schema for data validation
└── storage/
    └── keyValueStore.js   # In-memory key/value storage implementation
```

### Key Components

- **Express.js**: Web framework for handling HTTP requests
- **AJV**: JSON Schema validation library
- **Helmet**: Security middleware for HTTP headers
- **Morgan**: HTTP request logger middleware
- **CORS**: Cross-Origin Resource Sharing support

### Storage Layer

The key/value store provides:
- **In-memory storage** with Map data structure
- **Automatic metadata generation** (timestamps, versions, ETags)
- **ETag generation** for caching support
- **Version tracking** for each record

## 🧪 Testing

### Manual Testing with Health Check

```bash
# Check if the API is running
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### Testing with Different Data Types

```bash
# Test with user data
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -d '{"id": "user-1", "name": "Alice", "type": "user", "attributes": {"role": "admin"}}'

# Test with product data
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -d '{"id": "prod-1", "name": "Laptop", "type": "product", "attributes": {"price": 999.99, "category": "electronics"}}'

# Test with order data
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -d '{"id": "order-1", "name": "Order #1001", "type": "order", "attributes": {"total": 1299.99, "items": 3}}'
```

## 🛠️ Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `NODE_ENV` | `development` | Environment mode |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

The API is production-ready and can be deployed to:

- **Docker**: Create a Dockerfile for containerization
- **Heroku**: Deploy with `git push heroku main`
- **AWS/Azure/GCP**: Deploy using serverless functions or VMs
- **Vercel/Netlify**: Deploy as serverless functions

## 📊 Performance Considerations

- **In-memory storage**: Fast access but limited by RAM
- **ETag caching**: Reduces bandwidth for unchanged resources
- **Request size limit**: 10MB JSON payload limit
- **CORS enabled**: Ready for frontend integration

## 🔒 Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **Input validation**: JSON schema validation on all inputs
- **Error handling**: No sensitive data in error responses
- **CORS**: Controlled cross-origin access