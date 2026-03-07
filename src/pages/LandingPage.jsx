import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, Activity, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    // Assets from previous task (generated image)
    const heroImage = "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=2070&auto=format&fit=crop";
    // Wait, I should use my generated one. But I can't directly refer to the local path in React without importing it or moving it to public.
    // I'll use a high-quality placeholder for now that looks premium, or assume I can use the local path if I move it.
    // Let's use a beautiful Unsplash image that matches the "joyful/hopeful" vibe.

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500/30">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background Image with Dark Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1559839734-2b71f1e3c770?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                <Sparkles size={14} /> Next-Gen GENCARE
                            </span>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                                Build your <br />
                                <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-rose-200 bg-clip-text text-transparent">future family</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mt-8 leading-relaxed">
                                AI-first medical companion powering your fertility journey. Precision protocol, real-time insights, and expert care in one platform.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link to="/register" className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2 group">
                                Start Journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                                Sign In
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Content - Floating Insight Cards */}
                    <div className="relative hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="relative z-20"
                        >
                            {/* Main Floating Card (Similar to "Cashflow" in reference) */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_32px_128px_-16px_rgba(255,100,100,0.2)] text-slate-950 w-full max-w-sm ml-auto">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Success Score</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Based on current protocol</p>
                                    </div>
                                    <div className="px-3 py-1 bg-teal-500/10 text-teal-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Activity size={12} /> +12%
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Abstract Chart Representation */}
                                    <div className="flex items-end gap-2 h-32">
                                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                                                className={`flex-1 rounded-t-xl ${i === 5 ? 'bg-slate-900 shadow-xl' : 'bg-slate-100'}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase italic">
                                        <span>Baseline</span>
                                        <span>Current Status</span>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Mini Card */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                                className="absolute -bottom-10 -left-10 bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl w-56 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                    <Heart fill="white" size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Protocol Safe</p>
                                    <p className="font-black text-white text-lg tracking-tight mt-1">100% Secure</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Background Decorative Blurs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
                        <div className="absolute top-[20%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -z-10" />
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] block mb-4 italic">Core Expertise</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Advanced Medical <br /> Infrastructure</h2>
                    </div>
                    <p className="text-slate-500 font-medium max-w-sm mb-2 text-sm leading-relaxed">
                        We combine cutting-edge technology with human empathy to provide the most advanced fertility care experience globally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Precision Protocol", icon: Activity, desc: "Personalized medication schedules tailored to your unique biological response." },
                        { title: "Real-time Insights", icon: Sparkles, desc: "AI-driven analysis of your medical reports and symptoms for immediate feedback." },
                        { title: "Expert Support", icon: Heart, desc: "Direct access to world-class fertility specialists whenever you need them." }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-8 group hover:bg-white transition-all hover:shadow-2xl duration-500"
                        >
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-slate-900 group-hover:scale-110 transition-all">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-slate-950 transition-colors mb-4">{feature.title}</h3>
                            <p className="text-slate-400 group-hover:text-slate-600 font-medium text-sm leading-relaxed transition-colors">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Verification Section (Trust Badges) */}
            <section className="py-20 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-wrap justify-between items-center gap-12 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700">
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">
                        <Star className="text-amber-400 fill-amber-400" /> ClinicPartner
                    </div>
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">
                        <CheckCircle2 className="text-teal-400" /> LabVerified
                    </div>
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-rose-500">
                        <Heart fill="currentColor" /> BioShield
                    </div>
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">
                        <Activity className="text-indigo-400" /> HealthSync
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
