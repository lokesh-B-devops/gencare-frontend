const router = require('express').Router();
const embryoTransferController = require('../controllers/embryoTransferController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Generate guidance (Doctor only)
router.post('/generate/:patientId', verifyToken, checkRole(['doctor']), embryoTransferController.generateGuidance);

// Get latest guidance (Doctor or Patient)
router.get('/latest/:patientId', verifyToken, embryoTransferController.getLatestGuidance);

// Update doctor decision (Doctor only)
router.put('/decision/:id', verifyToken, checkRole(['doctor']), embryoTransferController.updateDecision);

// Patient acknowledgment (Patient only)
router.put('/acknowledge/:id', verifyToken, checkRole(['patient']), embryoTransferController.patientAcknowledge);

module.exports = router;
