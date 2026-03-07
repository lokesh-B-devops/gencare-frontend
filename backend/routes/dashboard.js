const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/patient', verifyToken, checkRole(['patient']), dashboardController.getPatientDashboard);
router.get('/doctor', verifyToken, checkRole(['doctor']), dashboardController.getDoctorDashboard);
router.get('/guardian', verifyToken, checkRole(['guardian']), dashboardController.getGuardianDashboard);

module.exports = router;
