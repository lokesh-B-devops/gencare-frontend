const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class MessageRepository extends BaseRepository {
    constructor() {
        super('message', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        if (mapped.recipient && !mapped.receiverId) {
            mapped.receiverId = mapped.recipient.toString();
            delete mapped.recipient;
        }

        if (mapped.sender && !mapped.senderId) {
            mapped.senderId = mapped.sender.toString();
            delete mapped.sender;
        }

        return mapped;
    }

    async findConversation(userId1, userId2) {
        try {
            return await this.prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: userId1, receiverId: userId2 },
                        { senderId: userId2, receiverId: userId1 }
                    ]
                },
                orderBy: { createdAt: 'asc' }
            });
        } catch (err) {
            console.error(`PostgreSQL findConversation error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new MessageRepository();
