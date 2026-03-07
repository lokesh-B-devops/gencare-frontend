import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X, Sparkles } from 'lucide-react';

const FloatingChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [assistantId, setAssistantId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Only show for logged in patients
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isPatient = user.role === 'patient';

    useEffect(() => {
        if (!isPatient) return;

        const fetchAssistant = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/search/users?role=doctor', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const users = await res.json();
                const assistant = users.find(u => u.email === 'assistant@gencare.com');
                if (assistant) setAssistantId(assistant._id);
            } catch (err) {
                console.error("Failed to find assistant:", err);
            }
        };
        fetchAssistant();
    }, [isPatient]);

    if (!isPatient || location.pathname === '/' || location.pathname === '/register') return null;

    const handleOpenChat = () => {
        // For now, redirect to communication page with assistant
        // In a future update, this could open a mini-window
        navigate('/communication', { state: { openAssistant: true, assistantId } });
    };

    return (
        <div className="fixed bottom-40 right-10 z-[9999]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl border border-teal-100 p-6 w-72 mb-4 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Sparkles size={60} className="text-teal-500" />
                        </div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-20 h-20 mb-4 rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                                <img src="/ai_assistant_logo.png" alt="AI Assistant" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 italic">Virtual Assistant</h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium px-4">
                                I'm here to help with your medical questions and GENCARE journey.
                            </p>

                            <button
                                onClick={handleOpenChat}
                                className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={18} />
                                Chat Now
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-400 transition-colors"
                            >
                                Not now, thanks
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 bg-white rounded-3xl shadow-2xl border-2 border-teal-50 flex items-center justify-center p-1 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src="/ai_assistant_logo.png" alt="AI Chat" className="w-full h-full object-contain rounded-2xl" />

                        {/* Notification Badge */}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingChatBot;
