import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    X,
    Clock,
    User,
    ShieldAlert,
    ChevronRight,
    Search
} from 'lucide-react';

const EscalationAlerts = ({ doctorId, onClose }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications/doctor-alerts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setAlerts(data);
        } catch (err) {
            console.error('Error fetching doctor alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (alertId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/notifications/doctor-alerts/${alertId}/resolve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, isResolved: true } : a));
            }
        } catch (err) {
            console.error('Error resolving alert:', err);
        }
    };

    const filteredAlerts = alerts.filter(alert =>
        !alert.isResolved &&
        (alert.patient?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.message?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-rose-500 text-white shadow-rose-200';
            case 'high': return 'bg-orange-500 text-white shadow-orange-200';
            case 'medium': return 'bg-amber-500 text-white shadow-amber-200';
            default: return 'bg-blue-500 text-white shadow-blue-200';
        }
    };

    return (
        <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col border border-white">
            <div className="p-8 border-b border-rose-50 flex justify-between items-center bg-rose-50/30">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-rose-600 text-white rounded-3xl shadow-xl shadow-rose-100">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Medication Escalations</h2>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">
                            Urgent adherence tracking and clinical alerts
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8 min-h-[500px]">
                {/* Search & Stats */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Filter alerts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                            <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Unresolved</p>
                            <p className="text-xl font-black text-rose-600">{filteredAlerts.length}</p>
                        </div>
                        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Today</p>
                            <p className="text-xl font-black text-slate-600">{alerts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="text-center py-20 text-slate-300">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block"><Clock /></motion.div>
                                <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Monitoring schedules...</p>
                            </div>
                        ) : filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert) => (
                                <motion.div
                                    key={alert._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-2xl shrink-0 shadow-lg ${getSeverityStyles(alert.severity)}`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-800 tracking-tight">{alert.patient?.user?.name}</h4>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Escalated</span>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                                            <div className="flex items-center gap-3 pt-1">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                    <Clock size={12} />
                                                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                    <User size={12} />
                                                    ID: {alert.patient?._id?.slice(-6)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                                        <button
                                            onClick={() => window.location.href = `/communication?patientId=${alert.patient?._id}`}
                                            className="px-6 py-3 bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all focus:ring-4 focus:ring-rose-500/10"
                                        >
                                            Contact Patient
                                        </button>
                                        <button
                                            onClick={() => handleResolve(alert._id)}
                                            className="px-6 py-3 bg-teal-500 text-white hover:bg-teal-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-teal-100 focus:ring-4 focus:ring-teal-500/10 flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={14} />
                                            Resolve
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">All Clear</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">No pending medication escalations for your patients.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default EscalationAlerts;
