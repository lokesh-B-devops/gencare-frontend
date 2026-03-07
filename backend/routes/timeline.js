const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { verifyToken } = require('../middleware/auth');

router.post('/templates', verifyToken, timelineController.createTimelineTemplate);
router.get('/templates', verifyToken, timelineController.getTimelineTemplates);
router.post('/assign', verifyToken, timelineController.assignTimelineToPatient);
router.post('/update-progress', verifyToken, timelineController.updatePatientDay);

module.exports = router;
