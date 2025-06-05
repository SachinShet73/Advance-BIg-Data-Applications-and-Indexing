const express = require('express');
const DataController = require('../controllers/dataController');
const { validateData } = require('../middleware/validation');

const router = express.Router();
const dataController = new DataController();

router.post('/data', validateData, dataController.createData);

router.get('/data/:id', dataController.getData);

router.get('/data', dataController.listData);

router.delete('/data/:id', dataController.deleteData);

module.exports = router;