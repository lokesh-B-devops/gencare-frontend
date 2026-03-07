import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    CheckCircle2,
    AlertCircle,
    Clock,
    MessageSquare,
    TrendingUp,
    Settings,
    Trash2
} from 'lucide-react';

const DEMO_NOTIFICATIONS = [
    {
        id: 1,
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Time for Gonal-F (225 IU). Please log after taking.',
        time: '5 mins ago',
        icon: <Clock size={16} />,
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        isRead: false
    },
    {
        id: 2,
        type: 'alert',
        title: 'Hydration Alert',
        message: "Don't forget to drink 2L of water today for optimal health.",
        time: '2 hours ago',
        icon: <AlertCircle size={16} />,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        isRead: false
    },
    {
        id: 3,
        type: 'message',
        title: 'New Message',
        message: 'Dr. Jenkins sent you a message regarding your last scan.',
        time: '5 hours ago',
        icon: <MessageSquare size={16} />,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        isRead: true
    },
    {
        id: 4,
        type: 'update',
        title: 'Cycle Update',
        message: 'Your adherence score is 92%. Keep up the great work!',
        time: 'Yesterday',
        icon: <TrendingUp size={16} />,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        isRead: true
    }
];

const NotificationDropdown = ({ onClose, onSettingsClick }) => {
    const [notifications, setNotifications] = React.useState(DEMO_NOTIFICATIONS);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 mt-4 w-[380px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-50 overflow-hidden z-[120]"
        >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-500 text-white rounded-lg shadow-sm">
                        <Bell size={14} />
                    </div>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">Notifications</h3>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {notifications.filter(n => !n.isRead).length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                        Mark all as read
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                className={`p-5 flex gap-4 transition-colors hover:bg-slate-50/50 relative group ${!notif.isRead ? 'bg-rose-50/20' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-2xl ${notif.bgColor} ${notif.color} flex items-center justify-center shrink-0 shadow-sm border border-white/50`}>
                                    {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800 text-xs truncate pr-4">{notif.title}</h4>
                                        <span className="text-[9px] font-black text-slate-300 uppercase italic whitespace-nowrap">{notif.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        {notif.message}
                                    </p>
                                    {!notif.isRead && (
                                        <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                            Action Required
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="absolute right-4 bottom-4 p-1.5 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                            <Bell size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
                        <p className="text-[11px] text-slate-300 mt-1">No new notifications at the moment.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <button
                    onClick={onSettingsClick}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <Settings size={12} /> Bell Settings
                </button>
                <button
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 disabled:opacity-30 flex items-center gap-2 transition-colors"
                >
                    <Trash2 size={12} /> Clear all
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;
