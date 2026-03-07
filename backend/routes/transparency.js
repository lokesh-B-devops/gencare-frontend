const router = require('express').Router();
const transparencyController = require('../controllers/transparencyController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/patient', verifyToken, checkRole(['patient']), transparencyController.getPatientTransparencyData);
router.get('/doctor/:patientId', verifyToken, checkRole(['doctor']), transparencyController.getDoctorTransparencyData);
router.post('/update', verifyToken, checkRole(['doctor']), transparencyController.updateTransparencyData);

module.exports = router;
