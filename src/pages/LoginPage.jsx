import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import RoleSelector from '../components/RoleSelector';
import LoginForm from '../components/LoginForm';
import DnaAnimation from '../components/DnaAnimation';

const HERO_IMAGES = [
    '/hero_ivf_1.jpg',
    '/hero_ivf_2.jpg',
    'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=2070&auto=format&fit=crop'
];

const HERO_CAPTIONS = [
    { title: 'Every Needle, A Step Closer', sub: 'Your courage is our inspiration' },
    { title: 'Trust Us — Good Things Are Coming', sub: 'Combining science with heartfelt care' },
    { title: 'Your Journey to Parenthood', sub: 'We are with you every step of the way' }
];

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState('patient');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { scrollY } = useScroll();

    // Parallax effect for the background
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Carousel logic: change image every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFCFD] selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
            {/* DNA Animation fixed to background */}
            <div className="fixed inset-0 z-0 overflow-hidden text-black">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-screen opacity-40">
                    <DnaAnimation />
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-screen rotate-180 opacity-40">
                    <DnaAnimation />
                </div>
            </div>

            {/* Hero Section with Parallax Background & Carousel */}
            <div className="relative h-[65vh] md:h-[75vh] flex items-center justify-center overflow-hidden z-10">
                {/* Carousel Background Layer */}
                <motion.div
                    style={{ y: y1 }}
                    className="absolute inset-0 z-0"
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#FDFCFD] z-10 pointer-events-none"></div>
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={HERO_IMAGES[currentImageIndex]}
                            src={HERO_IMAGES[currentImageIndex]}
                            alt="GENCARE Journey"
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 1.4, ease: "easeInOut" }}
                            className="w-full h-[120%] object-cover object-center"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=2040&auto=format&fit=crop';
                            }}
                        />
                    </AnimatePresence>
                </motion.div>

                {/* Content Overlay */}
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    {/* Per-slide animated captions */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                            <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-tight drop-shadow-lg">
                                {HERO_CAPTIONS[currentImageIndex].title}
                            </h1>
                            <p className="text-base md:text-xl text-white/85 max-w-xl mx-auto leading-relaxed font-medium drop-shadow">
                                {HERO_CAPTIONS[currentImageIndex].sub}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Slide dot indicators */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        {HERO_IMAGES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={`transition-all duration-500 rounded-full ${i === currentImageIndex
                                    ? 'w-8 h-2.5 bg-white shadow-lg'
                                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Floating Aesthetic Elements */}
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-10 right-[10%] w-48 h-48 bg-pink-100/40 rounded-full blur-3xl z-0"
                ></motion.div>
                <motion.div
                    style={{ y: y1 }}
                    className="absolute top-20 left-[15%] w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl z-0"
                ></motion.div>
            </div>


            {/* ── Feature Cards Section ── */}
            <div className="relative z-20 px-4 pt-10 pb-4 max-w-7xl mx-auto">
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8"
                >
                    How We Support Your Journey
                </motion.p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        {
                            icon: '🤖',
                            color: 'from-indigo-500/20 to-violet-500/10',
                            border: 'border-indigo-200/40',
                            accent: 'text-indigo-600',
                            title: 'AI Companion',
                            desc: 'A gentle AI that answers your questions, tracks your health cycle, and offers emotional support around the clock.'
                        },
                        {
                            icon: '💊',
                            color: 'from-rose-400/20 to-pink-400/10',
                            border: 'border-rose-200/40',
                            accent: 'text-rose-500',
                            title: 'Smart Medication Alerts',
                            desc: 'Never miss a dose. Real-time push notifications remind you of every injection and pill — at exactly the right moment.'
                        },
                        {
                            icon: '📊',
                            color: 'from-teal-400/20 to-emerald-400/10',
                            border: 'border-teal-200/40',
                            accent: 'text-teal-600',
                            title: 'Adherence & Risk Score',
                            desc: 'Our AI calculates your daily adherence score and flags risk levels so your care team always stays one step ahead.'
                        },
                        {
                            icon: '📅',
                            color: 'from-amber-400/20 to-orange-300/10',
                            border: 'border-amber-200/40',
                            accent: 'text-amber-600',
                            title: 'Doctor Scheduling',
                            desc: 'Book appointments, join video consultations, and view your personalised health timeline — all in one place.'
                        }
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.6, delay: i * 0.12, ease: 'easeOut' }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className={`relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br ${card.color} backdrop-blur-xl border ${card.border} shadow-xl shadow-black/5 flex flex-col gap-4 cursor-default`}
                        >
                            {/* Blurred glow blob */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl bg-white/30 pointer-events-none" />

                            <div className="text-4xl">{card.icon}</div>
                            <div>
                                <h3 className={`font-black text-base tracking-tight ${card.accent} mb-1.5`}>
                                    {card.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    {card.desc}
                                </p>
                            </div>
                            {/* Bottom accent line */}
                            <div className={`h-0.5 w-10 rounded-full bg-current ${card.accent} opacity-40 mt-auto`} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Login Form Section */}
            <div className="relative z-30 mt-10 px-4 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-xl mx-auto bg-white/90 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-widest uppercase border border-indigo-100/50">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Secure Access
                        </div>
                        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 mt-3 text-lg font-light">Join us on your journey to motherhood</p>
                    </div>

                    <div className="space-y-10">
                        <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white/80 px-4 text-slate-400 font-semibold tracking-widest">Authentication</span>
                            </div>
                        </div>
                        <LoginForm role={selectedRole} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
