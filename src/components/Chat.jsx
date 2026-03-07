import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const Chat = ({ recipientId, recipientName, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (!recipientId) {
            setLoading(false);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/message/chat/${recipientId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                setMessages([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setMessages([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [recipientId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleDeleteChat = async () => {
        if (!window.confirm('Are you sure you want to clear your chat history with the Virtual Assistant? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/message/chat/${recipientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMessages([]);
            } else {
                alert('Failed to delete chat history');
            }
        } catch (error) {
            console.error('Failed to delete chat:', error);
            alert('An error occurred while deleting chat');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/message/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId,
                    content: newMessage,
                    category: 'general'
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="flex flex-col h-[75vh] md:h-[70vh] bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 bg-white border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {recipientName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-sm md:text-base">{recipientName}</h3>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live Now
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    <button
                        onClick={handleDeleteChat}
                        title="Delete Conversation"
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <span className="material-icons text-xl">delete_sweep</span>
                    </button>
                    <button onClick={onBack} className="p-2.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                        <span className="material-icons text-xl">close</span>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/30">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : Array.isArray(messages) && messages.length === 0 ? (
                    <div className="text-center text-slate-300 mt-20">
                        <span className="material-icons text-5xl mb-3 opacity-10">forum</span>
                        <p className="font-bold text-xs uppercase tracking-widest opacity-50">Deeply secure channel</p>
                    </div>
                ) : Array.isArray(messages) ? (
                    messages.map((msg) => {
                        const isSelf = msg.senderId === (currentUser.id || currentUser._id);
                        return (
                            <motion.div
                                key={msg.id || msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-[1.5rem] shadow-sm ${isSelf
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                        }`}
                                >
                                    <p className="text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
                                    <div className={`text-[9px] mt-2 font-black uppercase tracking-tighter flex items-center gap-1 opacity-50 ${isSelf ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        <Clock size={10} />
                                        {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : null}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-white border-t border-slate-50 flex gap-2 md:gap-3 items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3.5 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 text-sm md:text-base font-medium"
                />
                <button
                    type="submit"
                    className="bg-slate-900 text-white p-3.5 md:p-4 rounded-2xl md:rounded-3xl hover:bg-slate-800 transition-all active:scale-90 shadow-xl shadow-slate-100 shrink-0"
                >
                    <span className="material-icons text-xl">send</span>
                </button>
            </form>
        </div>
    );
};

export default Chat;
