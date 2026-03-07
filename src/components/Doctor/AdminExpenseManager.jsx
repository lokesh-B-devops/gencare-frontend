import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    DollarSign,
    Calendar,
    FileText,
    X,
    CheckCircle2,
    Clock,
    ArrowRightLeft,
    ShieldAlert
} from 'lucide-react';

const AdminExpenseManager = ({ patientId, patientName, onClose }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: 'Medical Checkups',
        amount: '',
        description: '',
        dueDate: ''
    });

    const categories = ['Medical Checkups', 'Medications', 'Nutrition Allowance', 'Insurance', 'Delivery & Postnatal Care', 'Legal Fees', 'Other'];

    useEffect(() => {
        fetchExpenses();
    }, [patientId]);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/surrogacy/doctor-patient-expenses/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setExpenses(data);
        } catch (err) {
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/surrogacy/create-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newExpense, patientId })
            });
            if (res.ok) {
                setShowAddForm(false);
                setNewExpense({ category: 'Medical Checkups', amount: '', description: '', dueDate: '' });
                fetchExpenses();
            }
        } catch (err) {
            console.error('Error adding expense:', err);
        }
    };

    const handleDisburse = async (expenseId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/surrogacy/disburse-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ expenseId })
            });
            if (res.ok) fetchExpenses();
        } catch (err) {
            console.error('Error disbursing expense:', err);
        }
    };

    return (
        <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col border border-white">
            <div className="p-8 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100">
                        <ArrowRightLeft size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Expense Management</h2>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                            Secured Financial Ledger for {patientName}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                {/* disbursement disclaimer */}
                <div className="bg-indigo-900 text-white p-6 rounded-[2rem] shadow-lg flex gap-4 items-center">
                    <ShieldAlert className="text-indigo-300" size={32} />
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">Audit & Escrow Protocol</h4>
                        <p className="text-[10px] opacity-80 font-bold leading-relaxed mt-1">
                            Funds must be received in the hospital escrow account before disbursement. Review all transactions before marking as 'Disbursed'.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="ml-auto flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-indigo-950/20"
                    >
                        <Plus size={16} /> Add Expense
                    </button>
                </div>

                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200"
                    >
                        <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Amount ($)</label>
                                <input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    placeholder="Enter Amount"
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                    required
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                                <textarea
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="Detailed description of the expense..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[100px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Due Date</label>
                                <input
                                    type="date"
                                    value={newExpense.dueDate}
                                    onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                >
                                    Confirm Addition
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="space-y-4">
                    {expenses.length > 0 ? expenses.map((expense) => (
                        <div key={expense._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${expense.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 tracking-tight">{expense.category}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{expense.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                    <p className="text-lg font-black text-slate-800 tracking-tight">${expense.amount}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <div className={`text-[10px] font-black uppercase inline-block px-3 py-1 rounded-full mt-1 ${expense.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {expense.status}
                                    </div>
                                </div>

                                <div className="min-w-[150px]">
                                    {expense.status === 'Paid' && expense.disbursementStatus !== 'Disbursed' ? (
                                        <button
                                            onClick={() => handleDisburse(expense._id)}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                        >
                                            Disburse Funds
                                        </button>
                                    ) : (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement</p>
                                            <p className={`text-[10px] font-black uppercase mt-1 ${expense.disbursementStatus === 'Disbursed' ? 'text-emerald-600' : 'text-slate-400'
                                                }`}>
                                                {expense.disbursementStatus}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                            No expenses recorded for this patient.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminExpenseManager;
