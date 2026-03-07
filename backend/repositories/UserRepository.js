const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class UserRepository extends BaseRepository {
    constructor() {
        super('user', prisma);
    }

    async findByEmail(email) {
        try {
            return await this.prisma.user.findUnique({ where: { email } });
        } catch (err) {
            console.error(`PostgreSQL findByEmail error: ${err.message}`);
            throw err;
        }
    }

    async search(query, role, patientId = null, limit = 20) {
        let normalizedQuery = query ? query.trim() : '';
        if (normalizedQuery) {
            // Remove "Dr.", "Dr ", "Mr.", "Mr ", "Ms.", "Ms ", "Mrs.", "Mrs " prefixes
            normalizedQuery = normalizedQuery.replace(/^(dr\.?\s+|mr\.?\s+|ms\.?\s+|mrs\.?\s+)/i, '');
        }

        try {
            const where = {};
            if (role) where.role = role;
            if (normalizedQuery) where.name = { contains: normalizedQuery, mode: 'insensitive' };

            const include = {};
            if (role === 'doctor') {
                include.doctorProfile = true;
            }

            let result = await this.prisma.user.findMany({
                where,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    profilePicture: true,
                    doctorProfile: true
                }
            });

            if (patientId && role === 'doctor') {
                const patient = await this.prisma.patientProfile.findUnique({
                    where: { userId: patientId },
                    select: { assignedDoctorId: true }
                });
                if (patient && patient.assignedDoctorId) {
                    result = result.map(u => ({
                        ...u,
                        isAssigned: u.id === patient.assignedDoctorId
                    })).sort((a, b) => (b.isAssigned ? 1 : 0) - (a.isAssigned ? 1 : 0));
                }
            }

            return result;
        } catch (err) {
            console.error(`PostgreSQL search error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new UserRepository();
