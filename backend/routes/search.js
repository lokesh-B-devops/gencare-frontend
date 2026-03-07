const router = require('express').Router();
const userRepository = require('../repositories/UserRepository');
const { verifyToken } = require('../middleware/auth');

// GET /api/search/users?q=name&role=doctor|patient
router.get('/users', verifyToken, async (req, res) => {
    try {
        const { q, role } = req.query;
        const patientId = req.user.role === 'patient' ? req.user.id : null;
        const users = await userRepository.search(q, role, patientId);
        res.json(users);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ message: 'Server error during search' });
    }
});

module.exports = router;
