import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    MessageSquare,
    Phone,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Smartphone,
    ShieldCheck,
    History
} from 'lucide-react';

const NotificationSettings = ({ onCancel }) => {
    const [preferences, setPreferences] = useState({
        whatsappEnabled: false,
        smsEnabled: false,
        reminderMinutesBefore: 10,
        whatsappConsent: false,
        smsConsent: false
    });
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [timezone, setTimezone] = useState('Asia/Kolkata');
    const [logs, setLogs] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const token = localStorage.getItem('token');
                const [prefRes, logsRes] = await Promise.all([
                    fetch('/api/notifications/preferences', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/notifications/logs', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (prefRes.ok) {
                    const data = await prefRes.json();
                    setPreferences({
                        whatsappEnabled: data.preferences.whatsappEnabled,
                        smsEnabled: data.preferences.smsEnabled,
                        reminderMinutesBefore: data.preferences.reminderMinutesBefore,
                        whatsappConsent: data.preferences.whatsappConsent,
                        smsConsent: data.preferences.smsConsent
                    });
                    setWhatsappNumber(data.whatsappNumber || '');
                    setTimezone(data.timezone || 'Asia/Kolkata');
                }

                if (logsRes.ok) {
                    const logsData = await logsRes.json();
                    setLogs(logsData);
                }
            } catch (err) {
                console.error('Error fetching notification data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    whatsappEnabled: preferences.whatsappEnabled,
                    smsEnabled: preferences.smsEnabled,
                    reminderMinutesBefore: preferences.reminderMinutesBefore,
                    whatsappConsent: preferences.whatsappConsent,
                    smsConsent: preferences.smsConsent,
                    whatsappNumber,
                    timezone
                })
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Preferences updated successfully!' });
            } else {
                const error = await res.json();
                setStatus({ type: 'error', message: error.message || 'Failed to update preferences.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-rose-500"
                >
                    <Bell size={40} />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-rose-50 w-full max-w-4xl mx-auto"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-rose-100 text-rose-500 rounded-xl">
                                <Bell size={24} />
                            </div>
                            Notification Settings
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage how you receive your medication reminders.</p>
                    </div>
                    {onCancel && (
                        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="text-slate-400" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Settings Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Channels */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Smartphone size={12} /> Contact Channels
                            </label>

                            <div className="space-y-3">
                                {/* WhatsApp */}
                                <div className={`p-4 rounded-2xl border transition-all ${preferences.whatsappEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${preferences.whatsappEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <MessageSquare size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">WhatsApp Reminders</p>
                                                <p className="text-[10px] text-slate-400">Receive alerts via WhatsApp Business</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPreferences({ ...preferences, whatsappEnabled: !preferences.whatsappEnabled })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${preferences.whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.whatsappEnabled ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    {preferences.whatsappEnabled && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2 border-t border-emerald-100/50"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">WhatsApp Number</label>
                                                <input
                                                    type="text"
                                                    value={whatsappNumber}
                                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                                    placeholder="e.g. +919876543210"
                                                    className="w-full px-3 py-2 bg-white border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-200 text-xs font-bold"
                                                />
                                            </div>
                                            <label className="flex items-start gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.whatsappConsent}
                                                    onChange={(e) => setPreferences({ ...preferences, whatsappConsent: e.target.checked })}
                                                    className="mt-0.5"
                                                    required
                                                />
                                                <span className="text-[10px] text-slate-500 leading-tight">
                                                    I consent to receive medication reminders and escalation alerts via WhatsApp.
                                                </span>
                                            </label>
                                        </motion.div>
                                    )}
                                </div>

                                {/* SMS */}
                                <div className={`p-4 rounded-2xl border transition-all ${preferences.smsEnabled ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${preferences.smsEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">SMS Reminders</p>
                                                <p className="text-[10px] text-slate-400">Receive alerts via standard text message</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPreferences({ ...preferences, smsEnabled: !preferences.smsEnabled })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${preferences.smsEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.smsEnabled ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    {preferences.smsEnabled && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2 border-t border-indigo-100/50"
                                        >
                                            <label className="flex items-start gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.smsConsent}
                                                    onChange={(e) => setPreferences({ ...preferences, smsConsent: e.target.checked })}
                                                    className="mt-0.5"
                                                    required
                                                />
                                                <span className="text-[10px] text-slate-500 leading-tight">
                                                    I consent to receive medication reminders and escalation alerts via SMS.
                                                </span>
                                            </label>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timing & Timezone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={12} /> Lead Time
                                </label>
                                <select
                                    value={preferences.reminderMinutesBefore}
                                    onChange={(e) => setPreferences({ ...preferences, reminderMinutesBefore: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700 text-sm"
                                >
                                    <option value={5}>5 min before</option>
                                    <option value={10}>10 min before</option>
                                    <option value={15}>15 min before</option>
                                    <option value={30}>30 min before</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={12} /> Timezone
                                </label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700 text-sm"
                                >
                                    <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                                    <option value="America/New_York">EST (UTC-5)</option>
                                    <option value="America/Los_Angeles">PST (UTC-8)</option>
                                    <option value="Europe/London">GMT (UTC+0)</option>
                                    <option value="Asia/Dubai">GST (UTC+4)</option>
                                </select>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                <p className="text-sm font-bold">{status.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </form>

                    {/* Notification Logs */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <History size={12} /> Recent Reminders
                        </label>

                        <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 p-4 overflow-y-auto max-h-[500px] space-y-3">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <div key={log._id} className="bg-white p-4 rounded-2xl shadow-sm border border-white flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${log.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                                    }`}>
                                                    {log.channel}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-700">
                                                    {log.messageType.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-medium italic">
                                                {new Date(log.sentAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${log.status === 'delivered' ? 'bg-teal-50 text-teal-600' :
                                                log.status === 'sent' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 text-center">
                                    <Bell size={40} className="mb-4 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No notification logs yet</p>
                                    <p className="text-[10px] mt-1">Updates appear here as reminders are sent.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NotificationSettings;
