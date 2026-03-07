const router = require('express').Router();
const postDeliveryController = require('../controllers/postDeliveryController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/guidance', verifyToken, postDeliveryController.getGuidance);
router.get('/patient-data', verifyToken, checkRole(['patient', 'guardian']), postDeliveryController.getPatientPostDeliveryData);
router.post('/toggle-checklist', verifyToken, checkRole(['patient']), postDeliveryController.updateChecklistProgress);
router.post('/activate', verifyToken, checkRole(['doctor']), postDeliveryController.activatePostDelivery);

module.exports = router;
