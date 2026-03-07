const express = require('express');
const router = express.Router();
const surrogacyController = require('../controllers/surrogacyController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Patient specific routes
router.get('/patient-expenses', verifyToken, surrogacyController.getPatientExpenses);
router.post('/initiate-payment', verifyToken, surrogacyController.initiatePayment);

// Doctor / Admin routes
router.post('/create-expense', verifyToken, checkRole(['doctor']), surrogacyController.createExpense);
router.get('/doctor-patient-expenses/:patientId', verifyToken, checkRole(['doctor']), surrogacyController.getDoctorPatientExpenses);
router.post('/disburse-expense', verifyToken, checkRole(['doctor']), surrogacyController.disburseExpense);

module.exports = router;
