const express = require('express');
const router = express.Router();
const availabilityRepository = require('../repositories/AvailabilityRepository');
const appointmentRepository = require('../repositories/AppointmentRepository');
const { verifyToken, checkRole } = require('../middleware/auth');
const { sendNotification } = require('../modules/notifications');

// --- Availability Endpoints ---

// Get doctor availability (Public or for specific doctor)
router.get('/availability/:doctorId', verifyToken, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const availability = await availabilityRepository.findByDoctor(doctorId);
        res.json(availability);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Set doctor availability (Doctor only)
router.post('/availability', verifyToken, checkRole(['doctor']), async (req, res) => {
    try {
        const { date, startTime, endTime, status, isRecurring, recurringDays } = req.body;
        const doctorId = req.user.id;

        // Check for overlaps
        const existing = await availabilityRepository.checkOverlap(doctorId, date, startTime, endTime);

        if (existing) {
            return res.status(400).json({ message: 'Availability slot overlaps with an existing one' });
        }

        const newAvailability = await availabilityRepository.create({
            doctor: doctorId,
            doctorId: doctorId,
            date: new Date(date),
            startTime,
            endTime,
            status,
            isRecurring,
            recurringDays
        });
        res.status(201).json(newAvailability);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete availability (Doctor only)
router.delete('/availability/:id', verifyToken, checkRole(['doctor']), async (req, res) => {
    try {
        await availabilityRepository.delete(req.params.id);
        res.json({ message: 'Availability slot deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Appointment Endpoints ---

// Book an appointment (Patient only)
router.post('/appointments', verifyToken, checkRole(['patient']), async (req, res) => {
    try {
        const { doctorId, date, time, appointmentType, notes } = req.body;
        const patientId = req.user.id;

        // Check for double booking
        const existing = await appointmentRepository.findAll({
            doctor: doctorId,
            doctorId: doctorId,
            date: new Date(date),
            time,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existing.length > 0) {
            return res.status(400).json({ message: 'This slot is already booked or pending' });
        }

        // IVF specific critical rules (Priority scheduling)
        const criticalTypes = ['egg-retrieval', 'embryo-transfer', 'scan'];
        const isCritical = criticalTypes.includes(appointmentType);

        const newAppointment = await appointmentRepository.create({
            doctor: doctorId,
            doctorId: doctorId,
            patient: patientId,
            patientId: patientId,
            date: new Date(date),
            time,
            appointmentType,
            isCritical,
            notes,
            status: 'pending'
        });

        // Notify Doctor
        await sendNotification(
            patientId,
            doctorId,
            `New appointment request from patient for ${date} at ${time}.`,
            'appointment'
        );

        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointments (Role based)
router.get('/appointments', verifyToken, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'doctor') query.doctor = req.user.id;
        if (req.user.role === 'patient') query.patient = req.user.id;

        if (req.user.role === 'guardian') {
            const guardianRepository = require('../repositories/GuardianRepository');
            const patientRepository = require('../repositories/PatientRepository');
            const guardian = await guardianRepository.findOne({ userId: req.user.id });
            if (guardian && guardian.linkedPatientId) {
                const patientProfile = await patientRepository.findById(guardian.linkedPatientId);
                if (patientProfile) {
                    query.patientId = patientProfile.userId;
                }
            }
        }

        const appointments = await appointmentRepository.findAll(query);
        // Note: Repository findAll for Mongoose might need population handled
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update appointment status (Doctor only)
router.patch('/appointments/:id', verifyToken, checkRole(['doctor']), async (req, res) => {
    try {
        const { status, suggestedTime, rejectionReason } = req.body;
        const appointment = await appointmentRepository.findById(req.params.id);

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        const updateData = { status };
        if (suggestedTime) updateData.suggestedTime = suggestedTime;
        if (rejectionReason) updateData.rejectionReason = rejectionReason;

        const updatedAppointment = await appointmentRepository.update(req.params.id, updateData);

        // Notify Patient
        const patientUserId = updatedAppointment.patient || updatedAppointment.patientId;
        await sendNotification(
            req.user.id,
            patientUserId,
            `Your appointment for ${new Date(updatedAppointment.date).toLocaleDateString()} at ${updatedAppointment.time} has been ${status}. ${suggestedTime ? 'Suggested time: ' + suggestedTime : ''}`,
            'appointment'
        );

        res.json(updatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/appointments/:id/cancel', verifyToken, checkRole(['patient']), async (req, res) => {
    try {
        const appointment = await appointmentRepository.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        const patientUserId = appointment.patient || appointment.patientId;
        if (patientUserId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }

        if (appointment.isCritical) {
            return res.status(400).json({ message: 'Critical procedures (Egg Retrieval, Embryo Transfer) cannot be cancelled via the app. Please contact your doctor directly.' });
        }

        const cancelledAppointment = await appointmentRepository.update(req.params.id, { status: 'cancelled' });

        const doctorUserId = cancelledAppointment.doctor || cancelledAppointment.doctorId;
        await sendNotification(
            req.user.id,
            doctorUserId,
            `Patient has cancelled their appointment for ${new Date(cancelledAppointment.date).toLocaleDateString()}.`,
            'appointment'
        );

        res.json(cancelledAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
