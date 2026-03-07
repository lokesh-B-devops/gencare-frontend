const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class TimelineRepository extends BaseRepository {
    constructor() {
        super('treatmentTimeline', prisma);
    }

    async create(data) {
        try {
            const { phases, ...rest } = data;
            const pgData = this._mapDataToPg(rest);

            return await this.prisma.treatmentTimeline.create({
                data: {
                    ...pgData,
                    phases: phases ? {
                        create: phases.map(p => this._mapDataToPg(p))
                    } : undefined
                }
            });
        } catch (err) {
            console.error(`PostgreSQL Timeline create error: ${err.message}`);
            throw err;
        }
    }

    async update(id, data) {
        try {
            const { phases, ...rest } = data;
            const pgData = this._mapDataToPg(rest);

            return await this.prisma.treatmentTimeline.update({
                where: { id },
                data: {
                    ...pgData,
                    phases: phases ? {
                        deleteMany: {},
                        create: phases.map(p => this._mapDataToPg(p))
                    } : undefined
                }
            });
        } catch (err) {
            console.error(`PostgreSQL Timeline update error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new TimelineRepository();
