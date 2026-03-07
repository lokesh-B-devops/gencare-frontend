const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class GuardianRepository extends BaseRepository {
    constructor() {
        super('guardianProfile', prisma);
    }

    async findByUserId(userId) {
        try {
            return await this.prisma.guardianProfile.findUnique({
                where: { userId },
                include: {
                    user: {
                        include: {
                            patientProfile: {
                                include: {
                                    user: { select: { name: true, email: true } }
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error(`PostgreSQL findByUserId error in GuardianRepository: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new GuardianRepository();
