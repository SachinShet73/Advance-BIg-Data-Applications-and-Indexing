const KeyValueStore = require('../storage/keyValueStore');

class DataController {
  constructor() {
    this.store = new KeyValueStore();
  }

  createPlan = (req, res) => {
    try {
      const planData = this.enrichPlanData(req.body);
      const { objectId } = planData;
      
      if (this.store.exists(objectId)) {
        return res.status(409).json({
          error: 'Conflict',
          message: `Insurance plan with objectId '${objectId}' already exists`,
          timestamp: new Date().toISOString()
        });
      }

      this.validateOrganizationConsistency(planData);

      const result = this.store.set(objectId, planData);
      
      if (result.success) {
        res.status(201)
           .header('ETag', `"${result.etag}"`)
           .header('Location', `/api/v1/plans/${objectId}`)
           .json({
             message: 'Insurance plan created successfully',
             objectId: objectId,
             planType: planData.planType,
             version: result.version,
             timestamp: new Date().toISOString()
           });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create insurance plan',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      if (error.message.includes('Organization consistency')) {
        res.status(400).json({
          error: 'Validation Error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  enrichPlanData = (planData) => {
    const enriched = { ...planData };
    
    if (!enriched.objectId) {
      enriched.objectId = this.generateObjectId();
    }
    
    if (!enriched.planCostShares.objectId) {
      enriched.planCostShares.objectId = this.generateObjectId();
    }
    
    if (enriched.linkedPlanServices) {
      enriched.linkedPlanServices = enriched.linkedPlanServices.map(service => ({
        ...service,
        objectId: service.objectId || this.generateObjectId(),
        linkedService: {
          ...service.linkedService,
          objectId: service.linkedService.objectId || this.generateObjectId()
        },
        planserviceCostShares: {
          ...service.planserviceCostShares,
          objectId: service.planserviceCostShares.objectId || this.generateObjectId()
        }
      }));
    }
    
    return enriched;
  };

  generateObjectId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  validateOrganizationConsistency = (planData) => {
    const org = planData._org;
    
    if (planData.planCostShares._org !== org) {
      throw new Error('Organization consistency error: planCostShares._org must match plan._org');
    }
    
    if (planData.linkedPlanServices) {
      planData.linkedPlanServices.forEach((service, index) => {
        if (service._org !== org) {
          throw new Error(`Organization consistency error: linkedPlanServices[${index}]._org must match plan._org`);
        }
        if (service.linkedService._org !== org) {
          throw new Error(`Organization consistency error: linkedPlanServices[${index}].linkedService._org must match plan._org`);
        }
        if (service.planserviceCostShares._org !== org) {
          throw new Error(`Organization consistency error: linkedPlanServices[${index}].planserviceCostShares._org must match plan._org`);
        }
      });
    }
  };

  getPlan = (req, res) => {
    try {
      const { planId } = req.params;
      const ifNoneMatch = req.headers['if-none-match'];
      
      const result = this.store.get(planId, ifNoneMatch ? ifNoneMatch.replace(/"/g, '') : null);
      
      if (!result.success) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Insurance plan with objectId '${planId}' not found`,
          timestamp: new Date().toISOString()
        });
      }

      if (result.notModified) {
        return res.status(304)
                 .header('ETag', `"${result.etag}"`)
                 .end();
      }

      res.status(200)
         .header('ETag', `"${result.etag}"`)
         .header('Cache-Control', 'max-age=3600')
         .json(result.data);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  calculatePatientCost = (req, res) => {
    try {
      const { planId } = req.params;
      const { serviceId, claimAmount } = req.query;
      
      if (!serviceId || !claimAmount) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'serviceId and claimAmount query parameters are required',
          timestamp: new Date().toISOString()
        });
      }

      const planResult = this.store.get(planId);
      
      if (!planResult.success) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Insurance plan with objectId '${planId}' not found`,
          timestamp: new Date().toISOString()
        });
      }

      const plan = planResult.data;
      const amount = parseFloat(claimAmount);
      
      let applicableCostShares = plan.planCostShares;
      let serviceOverride = null;
      
      if (plan.linkedPlanServices) {
        serviceOverride = plan.linkedPlanServices.find(
          service => service.linkedService.objectId === serviceId
        );
        
        if (serviceOverride) {
          applicableCostShares = serviceOverride.planserviceCostShares;
        }
      }

      const patientCost = this.calculateCost(amount, applicableCostShares);
      
      res.status(200).json({
        planId: planId,
        serviceId: serviceId,
        claimAmount: amount,
        applicableCostShares: applicableCostShares,
        patientResponsibility: patientCost,
        serviceOverrideApplied: serviceOverride !== null,
        calculation: {
          deductible: applicableCostShares.deductible,
          copay: applicableCostShares.copay,
          patientPays: patientCost.totalPatientCost
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  calculateCost = (claimAmount, costShares) => {
    const deductible = costShares.deductible;
    const copay = costShares.copay;
    
    let patientDeductible = 0;
    let patientCopay = copay;
    let remainingAfterDeductible = claimAmount;
    
    if (claimAmount > deductible) {
      patientDeductible = deductible;
      remainingAfterDeductible = claimAmount - deductible;
    } else {
      patientDeductible = claimAmount;
      remainingAfterDeductible = 0;
      patientCopay = 0;
    }
    
    const totalPatientCost = patientDeductible + patientCopay;
    const insurancePays = claimAmount - totalPatientCost;
    
    return {
      totalPatientCost: totalPatientCost,
      deductiblePortion: patientDeductible,
      copayPortion: patientCopay,
      insurancePays: Math.max(0, insurancePays),
      claimAmount: claimAmount
    };
  };

  deletePlan = (req, res) => {
    try {
      const { planId } = req.params;
      
      const result = this.store.delete(planId);
      
      if (!result.success) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Insurance plan with objectId '${planId}' not found`,
          timestamp: new Date().toISOString()
        });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  listPlans = (req, res) => {
    try {
      const data = this.store.list();
      const { org, planType } = req.query;
      
      let filteredData = data;
      
      if (org) {
        filteredData = filteredData.filter(plan => plan._org === org);
      }
      
      if (planType) {
        filteredData = filteredData.filter(plan => plan.planType === planType);
      }
      
      res.status(200)
         .header('Cache-Control', 'max-age=300')
         .json({
           plans: filteredData,
           count: filteredData.length,
           filters: { org, planType },
           timestamp: new Date().toISOString()
         });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = DataController;