class BaseRepository {
    constructor(modelName, prismaClient, mongooseModel) {
        this.modelName = modelName;
        this.prisma = prismaClient;
        this.dbMode = 'postgresql'; // Permanently set to PostgreSQL for Supabase migration
    }

    async findById(id) {
        try {
            return await this.prisma[this.modelName].findUnique({ where: { id } });
        } catch (err) {
            console.error(`PostgreSQL findById error in ${this.modelName}: ${err.message}`);
            throw err;
        }
    }

    async findAll(filter = {}) {
        try {
            return await this.prisma[this.modelName].findMany({ where: filter });
        } catch (err) {
            console.error(`PostgreSQL findAll error in ${this.modelName}: ${err.message}`);
            throw err;
        }
    }

    _mapDataToPg(data) {
        const mapped = { ...data };

        // Handle string IDs from Mongo migration if they exist in incoming data
        if (mapped._id && !mapped.id) {
            mapped.id = mapped._id.toString();
            delete mapped._id;
        }

        // Common field name adjustments
        if (mapped.user && !mapped.userId) {
            mapped.userId = mapped.user.toString();
        }

        return mapped;
    }

    async create(data) {
        try {
            const pgData = this._mapDataToPg(data);
            return await this.prisma[this.modelName].create({ data: pgData });
        } catch (err) {
            console.error(`PostgreSQL create error in ${this.modelName}: ${err.message}`);
            throw err;
        }
    }

    async update(id, data) {
        try {
            const pgData = this._mapDataToPg(data);
            return await this.prisma[this.modelName].update({ where: { id }, data: pgData });
        } catch (err) {
            console.error(`PostgreSQL update error in ${this.modelName}: ${err.message}`);
            throw err;
        }
    }

    async delete(id) {
        try {
            return await this.prisma[this.modelName].delete({ where: { id } });
        } catch (err) {
            console.error(`PostgreSQL delete error in ${this.modelName}: ${err.message}`);
            throw err;
        }
    }

    async count() {
        try {
            const pgCount = await this.prisma[this.modelName].count();
            return { postgresql: pgCount };
        } catch (err) {
            console.error(`PostgreSQL count error in ${this.modelName}: ${err.message}`);
            throw err;
        }
    }
}

module.exports = BaseRepository;
