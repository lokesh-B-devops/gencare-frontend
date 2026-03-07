const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class SurrogacyExpenseRepository extends BaseRepository {
    constructor() {
        super('surrogacyExpense', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        if (data.patient && !mapped.patientId) {
            mapped.patientId = data.patient.toString();
            delete mapped.patient;
        }

        return mapped;
    }
}

module.exports = new SurrogacyExpenseRepository();
