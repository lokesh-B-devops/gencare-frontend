const messageRepository = require('../repositories/MessageRepository');
const userRepository = require('../repositories/UserRepository');
const aiGuidanceService = require('../services/aiGuidanceService');

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content, category } = req.body;
        const senderId = req.user.id;

        if (!recipientId || !content) {
            return res.status(400).json({ message: 'recipientId and content are required' });
        }

        // 1. Validate both users exist to avoid foreign key violations
        const [sender, recipient] = await Promise.all([
            userRepository.findById(senderId),
            userRepository.findById(recipientId)
        ]);

        if (!sender) {
            console.error(`[sendMessage] Sender not found: ${senderId}`);
            return res.status(404).json({ message: 'Sender user not found' });
        }
        if (!recipient) {
            console.error(`[sendMessage] Recipient not found: ${recipientId}`);
            return res.status(404).json({ message: 'Recipient user not found' });
        }

        // 2. Save the message
        const message = await messageRepository.create({
            senderId,
            receiverId: recipientId,
            content,
        });

        // 3. Check if recipient is the Virtual Assistant and trigger AI reply
        if (recipient.email === 'assistant@ivfcare.com' || recipient.name === 'Virtual Assistant') {
            // Fire and forget - don't block the response
            triggerAIResponse(senderId, recipientId, content, category);
        }

        res.status(201).json(message);
    } catch (err) {
        console.error('[sendMessage] Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

async function triggerAIResponse(userId, assistantId, userContent, category) {
    try {
        const aiResponse = await aiGuidanceService.generateChatResponse(userContent, category);

        await messageRepository.create({
            senderId: assistantId,
            receiverId: userId,
            content: aiResponse,
        });

        console.log('[AI] Response saved for user:', userId);
    } catch (err) {
        console.error('[AI] Response Generation Failed:', err.message);
    }
}

exports.getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const messages = await messageRepository.findConversation(req.user.id, otherUserId);
        res.json(messages);
    } catch (err) {
        console.error('[getMessages] Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        await messageRepository.update(messageId, { isRead: true });
        res.json({ message: 'Message marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const messages = await messageRepository.findConversation(req.user.id, otherUserId);
        for (const msg of messages) {
            await messageRepository.delete(msg.id);
        }
        res.json({ message: 'Chat history deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
