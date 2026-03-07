import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Menu,
    X,
    Home,
    MessageSquare,
    Video,
    Calendar,
    User,
    LogOut,
    Bell,
    Settings,
    Heart,
    Activity,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import { useRef } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(userData);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleNotifications = () => setShowNotifications(!showNotifications);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (location.pathname === '/register') return null;

    const navLinks = [
        { name: 'Dashboard', path: user?.role === 'doctor' ? '/doctor' : user?.role === 'guardian' ? '/guardian' : '/patient', icon: Home },
        { name: 'Connect', path: '/communication', icon: MessageSquare },
    ];

    return (
        <>
            {/* Top Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-50 py-3 shadow-2xl shadow-slate-200/50' : (location.pathname === '/' ? 'bg-transparent py-8' : 'bg-transparent py-6')}`}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center text-center sm:text-left">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className={`w-10 h-10 md:w-12 md:h-12 ${location.pathname === '/' && !scrolled ? 'bg-white text-slate-900 border border-white/20' : 'bg-slate-900 text-white'} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                            <Heart fill={location.pathname === '/' && !scrolled ? 'black' : 'white'} size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className={`text-lg md:text-2xl font-black ${location.pathname === '/' && !scrolled ? 'text-white' : 'text-slate-800'} tracking-tighter`}>GEN<span className="text-rose-500 underline decoration-rose-200 decoration-4 underline-offset-4">CARE</span></span>
                            <span className={`text-[8px] md:text-[10px] font-black ${location.pathname === '/' && !scrolled ? 'text-slate-400' : 'text-slate-300'} uppercase tracking-[0.3em] mt-1`}>Advanced Protocol</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {user ? navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${location.pathname === link.path ? (location.pathname === '/' && !scrolled ? 'text-white' : 'text-slate-900') : (location.pathname === '/' && !scrolled ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600')}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-2 left-0 h-1 bg-indigo-500 transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
                            </Link>
                        )) : (
                            <>
                                <Link to="/register" className={`text-[10px] font-black uppercase tracking-[0.3em] ${location.pathname === '/' && !scrolled ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}>Services</Link>
                                <Link to="/register" className={`text-[10px] font-black uppercase tracking-[0.3em] ${location.pathname === '/' && !scrolled ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}>Research</Link>
                                <Link to="/register" className={`text-[10px] font-black uppercase tracking-[0.3em] ${location.pathname === '/' && !scrolled ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}>Security</Link>
                            </>
                        )}
                        <div className={`flex items-center gap-6 pl-10 border-l ${location.pathname === '/' && !scrolled ? 'border-white/10' : 'border-slate-100'}`}>
                            {!user ? (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className={`text-[11px] font-black uppercase tracking-widest ${location.pathname === '/' && !scrolled ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Login</Link>
                                    <Link to="/register" className="px-6 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all">Join Platform</Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <div className="relative" ref={notificationsRef}>
                                        <button
                                            onClick={toggleNotifications}
                                            className={`p-2 transition-colors relative ${showNotifications ? 'text-rose-500 bg-rose-50 rounded-xl' : 'text-slate-300 hover:text-rose-500'}`}
                                        >
                                            <Bell size={20} />
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                                        </button>
                                        <AnimatePresence>
                                            {showNotifications && (
                                                <NotificationDropdown
                                                    onClose={() => setShowNotifications(false)}
                                                    onSettingsClick={() => {
                                                        setShowNotifications(false);
                                                        navigate(user?.role === 'patient' ? '/patient' : '/');
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="group relative">
                                        <button className="w-11 h-11 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-xl hover:scale-110 transition-transform duration-500">
                                            {user?.profilePicture ? (
                                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </button>
                                        <div className="absolute right-0 mt-4 w-56 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-50 py-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-4 group-hover:translate-y-0 z-[110]">
                                            <button onClick={handleLogout} className="w-[90%] mx-auto my-1 px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-2xl flex items-center gap-3 transition-colors">
                                                <LogOut size={16} /> Logout Securely
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center gap-3">
                        <button
                            onClick={toggleNotifications}
                            className={`p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-rose-50 text-rose-500' : 'text-slate-300 hover:bg-slate-50'}`}
                        >
                            <Bell size={22} />
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-90 transition-all"
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className="fixed top-2 right-2 bottom-2 w-[300px] bg-white z-[120] md:hidden shadow-2xl rounded-[3rem] flex flex-col p-8 border border-white"
                        >
                            <div className="flex flex-col items-center text-center mb-12 p-8 bg-slate-50 rounded-[2.5rem]">
                                <div className="w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-slate-900 border border-slate-100 shadow-xl mb-4">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div className="w-full">
                                    <p className="font-black text-slate-800 text-lg tracking-tighter truncate leading-tight">{user?.name}</p>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">{user?.role} Tier</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-5 p-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${location.pathname === link.path ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <div className={`p-2 rounded-xl ${location.pathname === link.path ? 'bg-white/20' : 'bg-slate-100'}`}>
                                            <link.icon size={20} />
                                        </div>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-auto flex items-center justify-center gap-5 p-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] text-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-all border border-rose-100/50"
                            >
                                <LogOut size={20} />
                                Exit Portal
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Navigation */}
            {user?.role === 'patient' && (
                <div className="fixed bottom-6 left-6 right-6 z-[100] md:hidden bg-white/90 backdrop-blur-2xl border border-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-3 flex justify-around items-center animate-in slide-in-from-bottom-4 duration-700">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-[1.8rem] transition-all duration-500 ${isActive ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{link.name}</span>
                            </Link>
                        );
                    })}
                    <button className="flex-1 flex flex-col items-center gap-1.5 p-3 text-slate-400 hover:bg-slate-50 rounded-[1.8rem] transition-all">
                        <User size={20} strokeWidth={2} />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Identity</span>
                    </button>
                </div>
            )}
        </>
    );
};

export default Navbar;
