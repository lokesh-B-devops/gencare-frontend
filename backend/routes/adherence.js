const router = require('express').Router();
const adherenceController = require('../controllers/adherenceController');
const { verifyToken, checkRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config for Symptom Photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/symptoms/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
});

router.post('/log-medication', verifyToken, checkRole(['patient']), adherenceController.logMedication);
router.post('/sync', verifyToken, checkRole(['patient']), adherenceController.syncMedications);
router.post('/log-symptom', verifyToken, checkRole(['patient']), upload.single('photo'), adherenceController.logSymptom);
router.get('/summary', verifyToken, checkRole(['patient', 'doctor', 'guardian']), adherenceController.getAdherenceSummary);

router.get('/check-ai', async (req, res) => {
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "No API Key" });
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        res.json({ status: "ok", reply: result.response.text() });
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

module.exports = router;
