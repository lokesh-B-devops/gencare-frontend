const router = require('express').Router();
const emergencyController = require('../controllers/emergencyController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/sos', verifyToken, checkRole(['patient']), emergencyController.triggerSOS);
router.get('/:id', verifyToken, emergencyController.getEventStatus);

module.exports = router;
