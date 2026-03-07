const surrogacyExpenseRepository = require('../repositories/SurrogacyExpenseRepository');
const surrogacyPaymentRepository = require('../repositories/SurrogacyPaymentRepository');
const userRepository = require('../repositories/UserRepository');

// Create a new expense (Doctor/Admin)
exports.createExpense = async (req, res) => {
    try {
        const { patientId, category, amount, description, dueDate } = req.body;

        // Check if patient exists
        const patient = await userRepository.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const expense = await surrogacyExpenseRepository.create({
            patient: patientId,
            patientId,
            category,
            amount,
            description,
            dueDate
        });

        res.status(201).json({ message: 'Expense created successfully', expense });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get expenses for a patient
exports.getPatientExpenses = async (req, res) => {
    try {
        const patientId = req.user.id;
        const expenses = await surrogacyExpenseRepository.findAll({ patientId });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all expenses for a patient (Doctor view)
exports.getDoctorPatientExpenses = async (req, res) => {
    try {
        const { patientId } = req.params;
        const expenses = await surrogacyExpenseRepository.findAll({ patientId });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Initiate payment (Mock for Patient)
exports.initiatePayment = async (req, res) => {
    try {
        const { expenseId, paymentMethod } = req.body;
        const expense = await surrogacyExpenseRepository.findById(expenseId);

        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        if (expense.status === 'Paid') return res.status(400).json({ message: 'Expense already paid' });

        // Simulate transaction ID
        const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const payment = await surrogacyPaymentRepository.create({
            expense: expenseId,
            expenseId,
            patient: req.user.id,
            patientId: req.user.id,
            amount: expense.amount,
            paymentMethod,
            transactionId,
            status: 'Success', // Mocking immediate success
            receiptUrl: `/receipts/${transactionId}.pdf`
        });

        // Update expense status
        await surrogacyExpenseRepository.update(expenseId, {
            status: 'Paid',
            disbursementStatus: 'Ready to Disburse'
        });

        res.json({ message: 'Payment successful', payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Disburse funds (Doctor/Admin)
exports.disburseExpense = async (req, res) => {
    try {
        const { expenseId } = req.body;
        const expense = await surrogacyExpenseRepository.findById(expenseId);

        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        if (expense.status !== 'Paid') return res.status(400).json({ message: 'Expense must be paid before disbursement' });

        const updatedExpense = await surrogacyExpenseRepository.update(expenseId, {
            disbursementStatus: 'Disbursed'
        });

        res.json({ message: 'Funds disbursed successfully', expense: updatedExpense });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
