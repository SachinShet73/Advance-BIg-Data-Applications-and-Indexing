# Healthcare Plan Management API

A comprehensive REST API for managing healthcare insurance plans with advanced caching, search capabilities, and real-time data processing. Built with Node.js and containerized with Docker for scalable deployment.

## Architecture Overview

The system implements a microservices architecture with the following components:

- **API Layer**: Express.js REST API with Google OAuth2 authentication
- **Caching Layer**: Redis for high-performance data storage and ETag management
- **Search Engine**: Elasticsearch for complex queries and analytics
- **Message Queue**: RabbitMQ for asynchronous data processing
- **Data Validation**: JSON Schema validation using AJV

## Features

- **Complete CRUD Operations**: Create, read, update, delete, and patch healthcare plans
- **JSON Schema Validation**: Strict validation of plan data structure
- **Google OAuth2 Authentication**: Secure authentication with JWT tokens
- **ETag Support**: Conditional requests for optimized performance
- **Real-time Search**: Elasticsearch integration for complex plan queries
- **Asynchronous Processing**: RabbitMQ for background data indexing
- **Parent-Child Relationships**: Support for nested plan structures
- **Docker Containerization**: Easy deployment and scaling

## Prerequisites

- Node.js 14+
- Docker and Docker Compose
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd healthcare-plan-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Services with Docker

```bash
docker-compose up -d
```

This starts:
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601
- **RabbitMQ**: http://localhost:15672 (guest/guest)
- **Redis**: localhost:6379

### 4. Start the API Server

```bash
# Development mode
npm run start:dev

# Production mode
npm start
```

The API will be available at http://localhost:8000

## API Endpoints

### Authentication

```http
GET /v1/token
```
Generate a JWT token for API access.

```http
POST /v1/validate
```
Validate an existing JWT token.

### Plan Management

```http
POST /v1/plan
```
Create a new healthcare plan.

```http
GET /v1/plan/{objectId}
```
Retrieve a specific plan by ID.

```http
PUT /v1/plan/{objectId}
```
Replace an entire plan (requires If-Match header).

```http
PATCH /v1/plan/{objectId}
```
Partially update a plan (requires If-Match header).

```http
DELETE /v1/plan/{objectId}
```
Delete a plan (requires If-Match header).

### Health Check

```http
GET /health
```
API health status endpoint.

## Configuration

### Environment Variables

Create a `config/local.json` file with:

```json
{
  "PORT": 8000,
  "REDIS_URL": "redis://localhost:6379",
  "PLAN_TYPE": "plan",
  "ELASTICSEARCH_INDEX_NAME": "indexplan",
  "RABBITMQ_QUEUE_NAME": "plan_queue",
  "RABBITMQ_EXCHANGE_TYPE": "direct",
  "RABBITMQ_EXCHANGE_NAME": "plan_exchange",
  "RABBITMQ_KEY": "plan_routing_key"
}
```

Set the Google OAuth2 client ID:

```bash
export CLIENT_ID="your-google-oauth-client-id"
```

## Request/Response Examples

### Create a Plan

```bash
curl -X POST http://localhost:8000/v1/plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d @example-plan.json
```

### Get a Plan

```bash
curl -X GET http://localhost:8000/v1/plan/12xvxc345ssdsds-508 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Update a Plan

```bash
curl -X PUT http://localhost:8000/v1/plan/12xvxc345ssdsds-508 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "If-Match: <etag-value>" \
  -d @updated-plan.json
```

## Data Model

The API uses a comprehensive JSON schema for healthcare plans including:

- **Plan Information**: Basic plan details and metadata
- **Cost Shares**: Deductibles, copays, and cost-sharing details
- **Linked Services**: Associated healthcare services
- **Service Cost Shares**: Service-specific cost information

See `example-plan.json` for a complete data structure example.

## Elasticsearch Integration

The system automatically indexes all plan data in Elasticsearch for advanced querying:

- **Parent-child relationships** for nested data structures
- **Full-text search** capabilities
- **Complex aggregations** and analytics
- **Real-time synchronization** via RabbitMQ

### Sample Elasticsearch Queries

```javascript
// Find plans by service name
GET /indexplan/_search
{
  "query": {
    "wildcard": {
      "name": {
        "value": "yearly*"
      }
    }
  }
}

// Find plans with specific copay amounts
GET /indexplan/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "copay": 175 } },
        { "match": { "deductible": 10 } }
      ]
    }
  }
}
```

## Development

### Running Tests

```bash
npm test
```

### Code Structure

```
src/
├── controllers/     # Request handlers
├── middlewares/     # Authentication and validation
├── models/         # JSON schemas
├── routes/         # API route definitions
├── services/       # Business logic and external integrations
└── validations/    # Input validation logic
```

### Adding New Features

1. Define routes in `src/routes/`
2. Implement controllers in `src/controllers/`
3. Add business logic in `src/services/`
4. Update JSON schemas in `src/models/`
5. Add validation in `src/validations/`

## Monitoring and Logging

- **Health Check**: `/health` endpoint for monitoring
- **Kibana Dashboard**: http://localhost:5601 for Elasticsearch data visualization
- **RabbitMQ Management**: http://localhost:15672 for queue monitoring
- **Redis CLI**: Connect directly for cache inspection

## Security Features

- **Google OAuth2**: Industry-standard authentication
- **JWT Tokens**: Secure, stateless authentication
- **Input Validation**: Comprehensive JSON schema validation
- **ETag Headers**: Prevent concurrent modification conflicts
- **CORS Support**: Configurable cross-origin resource sharing

## Deployment

### Docker Production Deployment

```bash
# Build and run in production mode
docker-compose -f docker-compose.yml up --build -d
```

### Environment-specific Configuration

- Development: `npm run start:dev`
- Production: `npm start`
- Testing: `npm test`

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   redis-server
   # or
   brew services start redis
   ```

2. **Elasticsearch Not Responding**
   ```bash
   docker-compose restart elasticsearch
   ```

3. **RabbitMQ Queue Issues**
   ```bash
   # Access management interface
   open http://localhost:15672
   ```

### Useful Commands

```bash
# Clear all Redis data
redis-cli FLUSHALL

# Reset Elasticsearch index
curl -X DELETE http://localhost:9200/indexplan

# View Docker logs
docker-compose logs -f

# Clean Docker containers
docker rm -vf $(docker ps -aq)
docker rmi -f $(docker images -aq)
```

## API Documentation

Access the Elasticsearch queries documentation in the `ElasticsearchQueries` file for examples of:
- Index management
- Complex search queries
- Parent-child relationship queries
- Aggregation examples


- Verify service health: `curl http://localhost:8000/health`
