const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const planRoutes = require('./routes/dataRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/v1', planRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Healthcare Insurance Plan Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Healthcare Insurance Plan Management API',
    version: '1.0.0',
    endpoints: {
      plans: {
        'POST /api/v1/plans': 'Create new insurance plan',
        'GET /api/v1/plans': 'List all plans (supports ?org=domain&planType=type filters)',
        'GET /api/v1/plans/{planId}': 'Get specific plan details',
        'DELETE /api/v1/plans/{planId}': 'Delete insurance plan',
        'GET /api/v1/plans/{planId}/cost-calculation': 'Calculate patient cost (requires ?serviceId=id&claimAmount=amount)'
      },
      health: {
        'GET /health': 'API health check'
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      'GET /health',
      'GET /api/v1',
      'POST /api/v1/plans',
      'GET /api/v1/plans',
      'GET /api/v1/plans/{planId}',
      'DELETE /api/v1/plans/{planId}',
      'GET /api/v1/plans/{planId}/cost-calculation'
    ],
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Healthcare Insurance Plan Management API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`API Documentation: http://localhost:${PORT}/api/v1`);
});

module.exports = app;