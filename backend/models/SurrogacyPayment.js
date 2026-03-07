const mongoose = require('mongoose');

const SurrogacyPaymentSchema = new mongoose.Schema({
    expense: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurrogacyExpense',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['UPI', 'Card', 'Net Banking']
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    receiptUrl: {
        type: String
    }
});

module.exports = mongoose.model('SurrogacyPayment', SurrogacyPaymentSchema);
