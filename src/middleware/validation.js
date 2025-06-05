const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const dataSchema = require('../schemas/data-schema.json');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(dataSchema);

const validateData = (req, res, next) => {
  const valid = validate(req.body);
  
  if (!valid) {
    const errors = validate.errors.map(error => ({
      field: error.instancePath || error.dataPath,
      message: error.message,
      value: error.data
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = { validateData };