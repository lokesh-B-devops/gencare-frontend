const router = require('express').Router();
const medicalController = require('../controllers/medicalController');
const { verifyToken, checkRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images and PDFs are allowed"));
    }
});

router.post('/notes', verifyToken, checkRole(['doctor']), medicalController.addMedicalNote);
router.get('/history/:id', verifyToken, checkRole(['doctor', 'patient', 'guardian']), medicalController.getPatientHistory);
router.post('/upload-report', verifyToken, checkRole(['patient']), upload.single('report'), medicalController.uploadReport);
router.put('/health-profile', verifyToken, checkRole(['patient']), medicalController.updateHealthProfile);
router.get('/reports', verifyToken, checkRole(['patient']), medicalController.getPatientReports);
router.get('/reports-doctor/:patientId', verifyToken, checkRole(['doctor']), medicalController.getReportsForDoctor);
router.get('/medication-education', verifyToken, checkRole(['patient', 'doctor', 'guardian']), medicalController.getMedicationEducation);

module.exports = router;
