const timelineRepository = require('../repositories/TimelineRepository');
const patientRepository = require('../repositories/PatientRepository');
// Removed model imports
const supabaseService = require('../services/supabaseService');

exports.createTimelineTemplate = async (req, res) => {
    try {
        const { name, phases } = req.body;
        const timeline = await timelineRepository.create({
            name,
            phases,
            createdBy: req.user.id
        });
        res.status(201).json(timeline);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Alias for route compatibility
exports.getTimelineTemplates = async (req, res) => {
    try {
        const timelines = await timelineRepository.findAll();
        res.json(timelines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTimelines = exports.getTimelineTemplates;

exports.assignTimelineToPatient = async (req, res) => {
    try {
        const { timelineId, startDate } = req.body;
        const patientId = req.user.id;

        const timeline = await timelineRepository.findById(timelineId);
        if (!timeline) return res.status(404).json({ message: 'Timeline not found' });

        await patientRepository.update(patientId, {
            timelineId: timelineId,
            timeline: timelineId,
            startDate: new Date(startDate),
            currentDay: 1
        });

        // Supabase Parallel Sync: Timeline Assignment
        if (supabaseService.enabled) {
            supabaseService.upsertProfile('patients', {
                id: patientId,
                user_id: patientId,
                current_phase: timeline.phases && timeline.phases[0] ? timeline.phases[0].label : 'Stimulation',
                current_day: 1
            });
            // Also log the specific event
            supabaseService.upsertProfile('timeline_events', {
                id: `assign-${patientId}-${Date.now()}`,
                patient_id: patientId,
                event_type: 'Timeline Started',
                event_date: new Date(startDate),
                description: `Assigned timeline: ${timeline.name}`,
                created_at: new Date()
            });
        }

        res.json({ message: 'Timeline started successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePatientDay = async (req, res) => {
    try {
        const { patientId, day, phase } = req.body;
        await patientRepository.updateByUserId(patientId, {
            currentDay: day,
            phase: phase
        });

        // Supabase Parallel Sync: Progress Update
        if (supabaseService.enabled) {
            supabaseService.upsertProfile('patients', {
                id: patientId,
                user_id: patientId,
                current_day: day,
                current_phase: phase
            });
        }

        res.json({ message: 'Patient progress updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
