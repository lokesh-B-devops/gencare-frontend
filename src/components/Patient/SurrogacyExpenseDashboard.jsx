import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Download,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Layers,
    DollarSign,
    ShieldCheck,
    X
} from 'lucide-react';

const SurrogacyExpenseDashboard = ({ expenses = [], onPay }) => {
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [isPaying, setIsPaying] = useState(false);

    const totalPaid = expenses
        .filter(e => e.status === 'Paid')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalPending = expenses
        .filter(e => e.status === 'Pending')
        .reduce((sum, e) => sum + e.amount, 0);

    const handlePayment = async () => {
        setIsPaying(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        await onPay(selectedExpense._id, paymentMethod);
        setIsPaying(false);
        setSelectedExpense(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex items-center justify-between"
                >
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <h3 className="text-4xl font-black text-emerald-600 tracking-tight">${totalPaid}</h3>
                    </div>
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl">
                        <CheckCircle2 size={32} />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex items-center justify-between"
                >
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pending</p>
                        <h3 className="text-4xl font-black text-indigo-600 tracking-tight">${totalPending}</h3>
                    </div>
                    <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl">
                        <Clock size={32} />
                    </div>
                </motion.div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 flex gap-4 items-start">
                <ShieldCheck className="text-amber-600 shrink-0" size={24} />
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Escrow & Compliance Protocol</h4>
                    <p className="text-xs text-amber-800/80 font-medium leading-relaxed mt-1">
                        All payments are processed through the hospital's central escrow account. Direct payments to surrogates are strictly prohibited to ensure legal compliance and professional mediation.
                    </p>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">Expense Ledger</h2>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                            Transparent Surrogacy Cost Breakdown
                        </p>
                    </div>
                    <Layers className="text-indigo-200 hidden sm:block" size={40} />
                </div>

                <div className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {expenses.length > 0 ? expenses.map((expense) => (
                                    <tr key={expense._id} className="group hover:bg-slate-50/30 transition-all">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${expense.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    <DollarSign size={16} />
                                                </div>
                                                <span className="text-sm font-black text-slate-800">{expense.category}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs text-slate-500 font-medium max-w-xs">{expense.description}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-base font-black text-slate-800">${expense.amount}</span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-300" />
                                                <span className="text-xs text-slate-500 font-bold">{new Date(expense.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            {expense.status === 'Paid' ? (
                                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all mx-auto">
                                                    <Download size={14} /> Receipt
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedExpense(expense)}
                                                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mx-auto"
                                                >
                                                    Pay Now <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-slate-400 font-medium italic">
                                            No expenses recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-50">
                        {expenses.length > 0 ? expenses.map((expense) => (
                            <div key={expense._id} className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${expense.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            <DollarSign size={16} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-slate-800 block">{expense.category}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Clock size={10} className="text-slate-300" />
                                                <span className="text-[10px] text-slate-400 font-bold">{new Date(expense.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-slate-800">${expense.amount}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                    {expense.description}
                                </p>
                                <div className="pt-2">
                                    {expense.status === 'Paid' ? (
                                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            <Download size={14} /> Download Receipt
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedExpense(expense)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                                        >
                                            Complete Payment <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-slate-400 font-medium italic">
                                No expenses recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {selectedExpense && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white"
                        >
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-600">
                                <div className="text-white">
                                    <h2 className="text-2xl font-black tracking-tighter">Settlement</h2>
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">
                                        Secure Hospital Escrow Payment
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedExpense(null)}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</p>
                                            <h4 className="text-lg font-black text-slate-800 tracking-tight">{selectedExpense.category}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                            <h4 className="text-2xl font-black text-indigo-600 tracking-tight">${selectedExpense.amount}</h4>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold border-t border-slate-200 pt-4 italic">
                                        {selectedExpense.description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Payment Method</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['UPI', 'Card', 'Net Banking'].map(method => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === method
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                    : 'border-slate-100 hover:bg-slate-50 text-slate-400'
                                                    }`}
                                            >
                                                <CreditCard size={20} />
                                                <span className="text-[8px] font-black uppercase">{method}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isPaying}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isPaying ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Confirm & Pay <ShieldCheck size={18} /></>
                                    )}
                                </button>

                                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                    SECURED BY MIRACLE HOSPITAL GATEWAY
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SurrogacyExpenseDashboard;
