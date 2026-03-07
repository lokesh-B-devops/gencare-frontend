const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class SurrogacyPaymentRepository extends BaseRepository {
    constructor() {
        super('surrogacyPayment', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        if (data.expense && !mapped.expenseId) {
            mapped.expenseId = data.expense.toString();
            delete mapped.expense;
        }

        if (data.patient && !mapped.patientId) {
            mapped.patientId = data.patient.toString();
            delete mapped.patient;
        }

        return mapped;
    }
}

module.exports = new SurrogacyPaymentRepository();
