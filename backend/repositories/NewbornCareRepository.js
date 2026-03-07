const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class NewbornCareRepository extends BaseRepository {
    constructor() {
        super('newbornCareGuidance', prisma);
    }
}

module.exports = new NewbornCareRepository();
