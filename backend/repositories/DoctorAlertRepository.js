const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class DoctorAlertRepository extends BaseRepository {
    constructor() {
        super('doctorAlert', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        // Map foreign keys if they are passed as 'doctor'/'patient' instead of 'doctorId'/'patientId'
        if (data.doctor && !mapped.doctorId) {
            mapped.doctorId = data.doctor.toString();
            delete mapped.doctor;
        }

        if (data.patient && !mapped.patientId) {
            mapped.patientId = data.patient.toString();
            delete mapped.patient;
        }

        if (data.resolvedBy && !mapped.resolvedById) {
            mapped.resolvedById = data.resolvedBy.toString();
            delete mapped.resolvedBy;
        }

        return mapped;
    }
}

module.exports = new DoctorAlertRepository();
