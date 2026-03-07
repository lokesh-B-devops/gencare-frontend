const emergencyRepository = require('../repositories/EmergencyRepository');
const patientRepository = require('../repositories/PatientRepository');

exports.triggerSOS = async (req, res) => {
    try {
        const { location, triggeredBy } = req.body;

        // Get Patient Profile ID
        const patientProfile = await patientRepository.findByUserId(req.user.id);
        if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

        const profileId = patientProfile._id || patientProfile.id;

        // Create Emergency Event
        const event = await emergencyRepository.create({
            patient: profileId,
            patientProfileId: profileId,
            triggeredBy,
            location,
            status: 'requested',
            logs: [{ message: 'Emergency triggered', timestamp: new Date() }]
        });

        // In a real app, trigger notifications here (SMS/Push)
        console.log(`[EMERGENCY] SOS from User ${req.user.id} at ${location.latitude}, ${location.longitude}`);

        res.status(201).json({ message: 'Emergency assistance requested', eventId: event._id || event.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEventStatus = async (req, res) => {
    try {
        const event = await emergencyRepository.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
