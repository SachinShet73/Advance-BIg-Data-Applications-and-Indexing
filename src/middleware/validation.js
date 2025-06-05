const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const insurancePlanSchema = require('../schemas/data-schema.json');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validatePlan = ajv.compile(insurancePlanSchema);

const validateInsurancePlan = (req, res, next) => {
  const valid = validatePlan(req.body);
  
  if (!valid) {
    const errors = validatePlan.errors.map(error => ({
      field: error.instancePath || error.dataPath,
      message: error.message,
      value: error.data,
      allowedValues: error.params?.allowedValues || null
    }));
    
    return res.status(400).json({
      error: 'Insurance Plan Validation Failed',
      message: 'The provided insurance plan data does not conform to the required schema',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }
  
  if (!validateOrganizationConsistency(req.body)) {
    return res.status(400).json({
      error: 'Organization Consistency Validation Failed',
      message: 'All nested objects must have the same _org value as the parent plan',
      timestamp: new Date().toISOString()
    });
  }
  
  if (!validateObjectIdUniqueness(req.body)) {
    return res.status(400).json({
      error: 'Object ID Uniqueness Validation Failed',
      message: 'All objectId values must be unique within the plan',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

const validateOrganizationConsistency = (planData) => {
  const org = planData._org;
  
  if (planData.planCostShares && planData.planCostShares._org !== org) {
    return false;
  }
  
  if (planData.linkedPlanServices) {
    for (const service of planData.linkedPlanServices) {
      if (service._org !== org) return false;
      if (service.linkedService && service.linkedService._org !== org) return false;
      if (service.planserviceCostShares && service.planserviceCostShares._org !== org) return false;
    }
  }
  
  return true;
};

const validateObjectIdUniqueness = (planData) => {
  const objectIds = new Set();
  
  const addObjectId = (id) => {
    if (objectIds.has(id)) {
      return false;
    }
    objectIds.add(id);
    return true;
  };
  
  if (planData.objectId && !addObjectId(planData.objectId)) return false;
  
  if (planData.planCostShares?.objectId && !addObjectId(planData.planCostShares.objectId)) return false;
  
  if (planData.linkedPlanServices) {
    for (const service of planData.linkedPlanServices) {
      if (service.objectId && !addObjectId(service.objectId)) return false;
      if (service.linkedService?.objectId && !addObjectId(service.linkedService.objectId)) return false;
      if (service.planserviceCostShares?.objectId && !addObjectId(service.planserviceCostShares.objectId)) return false;
    }
  }
  
  return true;
};

const validatePlanType = (planType) => {
  const validPlanTypes = ['inNetwork', 'outOfNetwork', 'emergency'];
  return validPlanTypes.includes(planType);
};

const validateDateFormat = (req, res, next) => {
  const { creationDate } = req.body;
  
  if (creationDate) {
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(creationDate)) {
      return res.status(400).json({
        error: 'Date Format Validation Failed',
        message: 'creationDate must be in MM-DD-YYYY format',
        timestamp: new Date().toISOString()
      });
    }
    
    const [month, day, year] = creationDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return res.status(400).json({
        error: 'Date Validation Failed',
        message: 'creationDate must be a valid date',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  next();
};

module.exports = { 
  validateInsurancePlan,
  validateDateFormat,
  validatePlanType,
  validateOrganizationConsistency,
  validateObjectIdUniqueness
};