const messageRepository = require('../repositories/MessageRepository');

const sendNotification = async (senderId, recipientId, content, category = 'system') => {
    try {
        const message = await messageRepository.create({
            sender: senderId,
            senderId: senderId,
            receiver: recipientId,
            receiverId: recipientId,
            content,
            category
        });
        return message;
    } catch (err) {
        console.error('Notification Error:', err.message);
    }
};

module.exports = { sendNotification };
