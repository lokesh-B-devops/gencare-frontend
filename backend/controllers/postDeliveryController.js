const newbornCareRepository = require('../repositories/NewbornCareRepository');
const patientRepository = require('../repositories/PatientRepository');

exports.getGuidance = async (req, res) => {
    try {
        const guidance = await newbornCareRepository.findAll();
        res.json(guidance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPatientPostDeliveryData = async (req, res) => {
    try {
        const patientId = req.user.id;
        const profile = await patientRepository.findByUserId(patientId);

        if (!profile || !profile.postDeliveryMode) {
            return res.status(403).json({ message: "Post-delivery mode not active" });
        }

        const guidance = await newbornCareRepository.findAll();
        res.json({
            deliveryDate: profile.deliveryDate,
            checklistProgress: profile.newbornChecklistProgress,
            guidance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateChecklistProgress = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { itemId, status } = req.body;

        const profile = await patientRepository.findByUserId(patientId);
        if (!profile) return res.status(404).json({ message: "Profile not found" });

        // Update Progress
        const progress = profile.newbornChecklistProgress || {};
        progress[itemId] = status;

        await patientRepository.update(profile._id || profile.id, {
            newbornChecklistProgress: progress
        });

        res.json({ message: "Progress updated", progress });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.activatePostDelivery = async (req, res) => {
    try {
        const { patientId, deliveryDate } = req.body;

        const profile = await patientRepository.findByUserId(patientId);
        if (!profile) return res.status(404).json({ message: "Patient profile not found" });

        const updatedProfile = await patientRepository.update(profile._id || profile.id, {
            postDeliveryMode: true,
            deliveryDate: deliveryDate || new Date(),
            newbornChecklistProgress: {}
        });

        res.json({ message: "Post-delivery mode activated", profile: updatedProfile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
