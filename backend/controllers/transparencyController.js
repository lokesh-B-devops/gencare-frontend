const donorRepository = require('../repositories/DonorRepository');
const surrogateRepository = require('../repositories/SurrogateRepository');
const patientRepository = require('../repositories/PatientRepository');

exports.getPatientTransparencyData = async (req, res) => {
    try {
        const patientId = req.user.id;

        // Fetch published profiles for the patient
        const [donor, surrogate] = await Promise.all([
            donorRepository.findByPatient(patientId, true),
            surrogateRepository.findByPatient(patientId, true)
        ]);

        res.json({ donor, surrogate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorTransparencyData = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Fetch all profiles (published or not) for the patient
        const [donor, surrogate] = await Promise.all([
            donorRepository.findByPatient(patientId),
            surrogateRepository.findByPatient(patientId)
        ]);

        res.json({ donor, surrogate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTransparencyData = async (req, res) => {
    try {
        const { patientId, type, data } = req.body;

        if (type === 'donor') {
            let donor = await donorRepository.findByPatient(patientId);
            if (donor) {
                donor = await donorRepository.update(donor._id || donor.id, data);
            } else {
                donor = await donorRepository.create({ patient: patientId, ...data });
            }

            const profile = await patientRepository.findByUserId(patientId);
            if (profile) await patientRepository.update(profile._id || profile.id, { hasDonorInvolvement: true });

            return res.json({ message: 'Donor profile updated', donor });
        } else if (type === 'surrogate') {
            let surrogate = await surrogateRepository.findByPatient(patientId);
            if (surrogate) {
                surrogate = await surrogateRepository.update(surrogate._id || surrogate.id, data);
            } else {
                surrogate = await surrogateRepository.create({ patient: patientId, ...data });
            }

            const profile = await patientRepository.findByUserId(patientId);
            if (profile) await patientRepository.update(profile._id || profile.id, { hasSurrogateInvolvement: true });

            return res.json({ message: 'Surrogate profile updated', surrogate });
        }

        res.status(400).json({ message: 'Invalid transparency type' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
