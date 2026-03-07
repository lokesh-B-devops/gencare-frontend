const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class AdherenceRepository extends BaseRepository {
    constructor() {
        super('adherenceLog', prisma);
    }

    async findToday(patientId, targetDate) {
        const date = targetDate ? new Date(targetDate) : new Date();
        date.setHours(0, 0, 0, 0);

        try {
            return await this.prisma.adherenceLog.findFirst({
                where: {
                    patientId,
                    date: { gte: date }
                },
                include: { medicationLogs: true, symptomLogs: true }
            });
        } catch (err) {
            console.error(`PostgreSQL findToday error: ${err.message}`);
            throw err;
        }
    }

    async create(data) {
        try {
            const { medicationLogs, symptomLogs, ...rest } = data;
            const pgData = this._mapDataToPg(rest);

            return await this.prisma.adherenceLog.create({
                data: {
                    ...pgData,
                    medicationLogs: medicationLogs ? {
                        create: medicationLogs.map(m => {
                            const pg = this._mapDataToPg(m);
                            if (pg.id) delete pg.id;
                            return pg;
                        })
                    } : undefined,
                    symptomLogs: symptomLogs ? {
                        create: symptomLogs.map(s => {
                            const pg = this._mapDataToPg(s);
                            if (pg.id) delete pg.id;
                            return pg;
                        })
                    } : undefined
                }
            });
        } catch (err) {
            console.error(`PostgreSQL AdherenceLog create error: ${err.message}`);
            throw err;
        }
    }

    async update(id, data) {
        try {
            const { medicationLogs, symptomLogs, ...rest } = data;
            const pgData = this._mapDataToPg(rest);

            // Strip primary keys and metadata before update to avoid constraint violations
            if (pgData.id) delete pgData.id;
            if (pgData.createdAt) delete pgData.createdAt;
            if (pgData.updatedAt) delete pgData.updatedAt;

            return await this.prisma.adherenceLog.update({
                where: { id },
                data: {
                    ...pgData,
                    medicationLogs: medicationLogs ? {
                        deleteMany: {},
                        create: medicationLogs.map(m => {
                            const pg = this._mapDataToPg(m);
                            if (pg.id) delete pg.id;
                            if (pg.adherenceLogId) delete pg.adherenceLogId;
                            return pg;
                        })
                    } : undefined,
                    symptomLogs: symptomLogs ? {
                        deleteMany: {},
                        create: symptomLogs.map(s => {
                            const pg = this._mapDataToPg(s);
                            if (pg.id) delete pg.id;
                            if (pg.adherenceLogId) delete pg.adherenceLogId;
                            return pg;
                        })
                    } : undefined
                }
            });
        } catch (err) {
            console.error(`PostgreSQL AdherenceLog update error: ${err.message}`);
            throw err;
        }
    }

    async findByPatient(patientId, limit = 7) {
        try {
            return await this.prisma.adherenceLog.findMany({
                where: { patientId },
                take: limit,
                orderBy: { date: 'desc' },
                include: { medicationLogs: true, symptomLogs: true }
            });
        } catch (err) {
            console.error(`PostgreSQL findByPatient error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new AdherenceRepository();
