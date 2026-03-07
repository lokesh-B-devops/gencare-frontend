const mongoose = require('mongoose');

const SurrogacyExpenseSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Medical Checkups', 'Medications', 'Nutrition Allowance', 'Insurance', 'Delivery & Postnatal Care', 'Legal Fees', 'Other']
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    disbursementStatus: {
        type: String,
        enum: ['Awaiting Funding', 'Ready to Disburse', 'Disbursed'],
        default: 'Awaiting Funding'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SurrogacyExpense', SurrogacyExpenseSchema);
