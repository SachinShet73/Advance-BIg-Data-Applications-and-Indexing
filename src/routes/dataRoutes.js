const express = require('express');
const DataController = require('../controllers/dataController');
const { validateInsurancePlan, validateDateFormat } = require('../middleware/validation');

const router = express.Router();
const dataController = new DataController();

router.post('/plans', validateDateFormat, validateInsurancePlan, dataController.createPlan);

router.get('/plans/:planId', dataController.getPlan);

router.get('/plans', dataController.listPlans);

router.delete('/plans/:planId', dataController.deletePlan);

router.get('/plans/:planId/cost-calculation', dataController.calculatePatientCost);

module.exports = router;