const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Patient notification preferences
router.get('/preferences', verifyToken, checkRole(['patient']), notificationController.getPreferences);
router.put('/preferences', verifyToken, checkRole(['patient']), notificationController.updatePreferences);

// Notification delivery logs
router.get('/logs', verifyToken, checkRole(['patient', 'doctor']), notificationController.getLogs);

// Patient medication confirmation
router.post('/confirm-medication', verifyToken, checkRole(['patient']), notificationController.confirmMedication);

// Doctor escalation alerts
router.get('/doctor-alerts', verifyToken, checkRole(['doctor']), notificationController.getDoctorAlerts);
router.put('/doctor-alerts/:id/resolve', verifyToken, checkRole(['doctor']), notificationController.resolveAlert);
router.put('/doctor-alerts/:id/read', verifyToken, checkRole(['doctor']), notificationController.markAlertRead);

// Test notification (any authenticated user)
router.post('/test', verifyToken, notificationController.sendTest);

// System status
router.get('/status', verifyToken, notificationController.getStatus);

module.exports = router;
