const express = require('express');
const { viewLaborDetails, handlePayment, getViewStatus } = require('../controllers/viewLabor');

const router = express.Router();

router.get('/labor/:phone', viewLaborDetails);
router.post('/labor/:phone/pay', handlePayment);
router.get('/status/:phone', getViewStatus);


module.exports = router;