import React, { useState, useEffect } from 'react';
import {
    Heart,
    Phone,
    MapPin,
    Clock,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    Bell,
    ChevronRight,
    Search,
    Video,
    Sparkles,
    Activity,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Timeline from '../components/Timeline';
import SchedulingCalendar from '../components/Calendar/SchedulingCalendar';

const GuardianDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedInfo, setActiveMedInfo] = useState(null);

    const MED_INFO = {
        'Gonal-F': {
            use: "Follicle stimulation",
            how: "Contains FSH (follicle-stimulating hormone) which mimics your body's natural hormones to encourage the ovaries to produce multiple eggs instead of just one.",
            tips: "Keep refrigerated. Use a new needle each time. Rotate injection sites around the belly button."
        },
        'Menopur': {
            use: "Egg development support",
            how: "Provides both FSH and LH (luteinizing hormone). It works alongside other meds to help the follicles reach the right size and maturity level.",
            tips: "Mix gently; do not shake. You might feel a slight sting—this is normal and passes quickly."
        },
        'Cetrotide': {
            use: "Prevents early ovulation",
            how: "Blocks the hormone that would normally cause you to release eggs early. This ensures the eggs stay in the follicles until the doctor is ready to retrieve them.",
            tips: "A small red bump at the injection site is very common and usually fades within an hour."
        },
        'Ganirelix': {
            use: "Prevents early ovulation",
            how: "Works as a GnRH antagonist to prevent a premature LH surge, giving the doctor control over the exact timing of your egg retrieval.",
            tips: "Wipe the needle tip before injecting to reduce skin irritation."
        },
        'Ovidrel': {
            use: "The 'Trigger' Shot",
            how: "Mimics a natural LH surge to induce final maturation of the eggs. It sets a 36-hour countdown for the egg retrieval procedure.",
            tips: "Timing is critical! Take this at the exact minute instructed by your care team."
        },
        'Progesterone': {
            use: "Uterine lining support",
            how: "Prepares the lining of the uterus for an embryo to implant and helps sustain an early pregnancy by mimicking natural hormone levels.",
            tips: "If using oil injections, warming the vial in your hands first can make the process smoother."
        },
        'Estradiol': {
            use: "Estrogen support",
            how: "Helps thicken the uterine lining and maintains the hormonal balance required for a successful embryo transfer.",
            tips: "Take with food if you experience mild nausea."
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/dashboard/guardian', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="min-h-screen nurture-gradient flex items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 bg-rose-200/50 rounded-full flex items-center justify-center text-rose-500 backdrop-blur-sm"
            >
                <Heart fill="currentColor" size={32} />
            </motion.div>
        </div>
    );

    if (!profile) return <div className="p-8 text-center text-rose-900 font-bold">Access Denied. Please log in.</div>;

    // Data Mapping
    const guardianName = profile.user?.name || "Guardian";
    const patientName = profile.linkedPatient?.user?.name || "Patient";
    const currentStage = profile.linkedPatient?.timeline?.phase || "Preparation";
    const day = "Day " + (profile.linkedPatient?.timeline?.currentDay || 1);
    const adherenceScore = profile.linkedPatient?.adherenceScore || 100;

    const alerts = [
        { type: "info", message: "Dr. Chen updated Sarah's medication plan.", time: "10:30 AM", icon: Sparkles, color: "text-teal-500 bg-teal-50" },
        { type: "reminder", message: "Evening injection (Gonal-F) due in 2 hours.", time: "Now", icon: Clock, color: "text-rose-500 bg-rose-50" }
    ];

    const hospital = {
        name: "Hope Fertility Center",
        address: "123 Wellness Ave, Medical District",
        contact: "+1 (555) 123-4567"
    };

    return (
        <div className="min-h-screen nurture-gradient font-sans text-slate-800 mobile-bottom-spacing">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="responsive-container"
            >
                <main className="py-6 space-y-8">
                    <motion.section
                        whileHover={{ y: -5 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/60 shadow-2xl shadow-rose-900/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/30 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                                    <Activity size={20} />
                                </div>
                                {patientName}'s Health Hub
                            </h2>
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${adherenceScore > 85 ? 'bg-teal-50 text-teal-500 border-teal-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                    Adherence: {adherenceScore}%
                                </span>
                            </div>
                        </div>

                        {/* Shared Timeline */}
                        <div className="mb-8 p-6 bg-white/40 rounded-[2rem] border border-white/60 shadow-inner overflow-x-auto">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 text-center">Shared Journey Path</p>
                            {profile.linkedPatient?.timeline?.config?.phases ? (
                                <Timeline
                                    currentDay={profile.linkedPatient.timeline.currentDay}
                                    currentPhase={profile.linkedPatient.timeline.phase}
                                    phases={profile.linkedPatient.timeline.config.phases}
                                />
                            ) : (
                                <p className="text-xs text-center text-slate-400 italic py-4">Timeline setup in progress...</p>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-rose-50 to-white rounded-[2rem] p-8 border border-rose-100 text-center shadow-inner relative z-10">
                            <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.3em] mb-2">Patient Stage</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">{currentStage}</h3>
                            <div className="inline-block bg-white px-6 py-2 rounded-2xl text-rose-500 font-black text-sm shadow-xl shadow-rose-900/5 border border-rose-50">
                                {day}
                            </div>
                            <p className="mt-6 text-slate-500 text-sm font-medium italic leading-relaxed">
                                {adherenceScore > 90 ? "Sarah is doing amazingly. Every medication dose for the last 48h has been logged precisely on time." : "Sarah might need a little extra encouragement today with her afternoon hydration goals."}
                            </p>
                        </div>

                        {/* Guardian View of Calendar */}
                        <div className="mt-12">
                            <SchedulingCalendar role="guardian" doctorId={profile.linkedPatient?.assignedDoctor} />
                        </div>
                    </motion.section>

                    {/* Updates Section */}
                    <section className="space-y-4">
                        <h2 className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-[0.2em]">Latest Care Milestones</h2>
                        <div className="space-y-3">
                            {profile.linkedPatient?.missedDoses?.length > 0 && (
                                <motion.div
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="p-5 bg-rose-500 text-white rounded-[1.5rem] shadow-xl shadow-rose-200 flex gap-4 items-center"
                                >
                                    <AlertTriangle size={24} className="shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-black text-sm">Action Needed: Missed Dose</p>
                                        <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">{patientName} missed an injection. Please check in.</p>
                                    </div>
                                    <button className="bg-white text-rose-500 font-bold px-4 py-2 rounded-xl text-xs">Call Now</button>
                                </motion.div>
                            )}
                            {alerts.map((alert, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card rounded-[1.5rem] p-5 border-white/50 shadow-lg shadow-rose-900/5 flex gap-4 items-center group cursor-pointer hover:bg-white"
                                >
                                    <div className={`p-3 rounded-2xl ${alert.color} group-hover:scale-110 transition-transform`}>
                                        <alert.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 font-black tracking-tight">{alert.message}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest italic">{alert.time}</p>
                                    </div>
                                    <ChevronRight className="text-slate-200 group-hover:text-rose-300 transition-colors" size={18} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Guardian Medication Education */}
                        {profile.linkedPatient?.ivfDetails?.medications?.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-[0.2em] mb-4">Medication Insight</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {profile.linkedPatient.ivfDetails.medications.map((med, idx) => {
                                        const info = Object.entries(MED_INFO).find(([key]) => med.name.includes(key))?.[1];
                                        if (!info) return null;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveMedInfo(info)}
                                                className="glass-card rounded-[1.5rem] p-4 border-white/50 shadow-md flex items-center justify-between group hover:bg-white transition-all text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
                                                        <Sparkles size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700">{med.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{info.use}</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Learn Why
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Medication Info Modal (Shared logic with Patient) */}
                    <AnimatePresence>
                        {activeMedInfo && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
                                onClick={() => setActiveMedInfo(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-teal-50"
                                >
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 bg-teal-50 text-teal-600 rounded-[1.5rem] shadow-sm">
                                                <Sparkles size={32} />
                                            </div>
                                            <button
                                                onClick={() => setActiveMedInfo(null)}
                                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                            >
                                                <XCircle size={20} className="text-slate-300 hover:text-rose-400" />
                                            </button>
                                        </div>

                                        <h3 className="text-xs font-black text-teal-500 uppercase tracking-[0.3em] mb-2">Caregiver's Guide</h3>
                                        <p className="text-xl font-black text-slate-800 tracking-tight mb-4">{activeMedInfo.use}</p>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
                                                    How this helps {patientName}
                                                </p>
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
                                                    "{activeMedInfo.how}"
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-rose-400 rounded-full"></div>
                                                    Support Tips
                                                </p>
                                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                                    {activeMedInfo.tips}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setActiveMedInfo(null)}
                                            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02]"
                                        >
                                            Support with Confidence
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Support Actions */}
                    <section className="grid grid-cols-2 gap-4">
                        <motion.button
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-br from-rose-400 to-rose-500 text-white p-6 rounded-[2rem] shadow-xl shadow-rose-200 flex flex-col items-center gap-3 transition-all border border-rose-300"
                        >
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Phone size={28} />
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">Call {patientName}</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-br from-teal-400 to-teal-500 text-white p-6 rounded-[2rem] shadow-xl shadow-teal-200 flex flex-col items-center gap-3 transition-all border border-teal-300"
                        >
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Video size={28} />
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">Team Connect</span>
                        </motion.button>
                    </section>

                    {/* Emergency Clinic Info */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin size={120} />
                        </div>
                        <h3 className="font-black text-rose-400 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                            Clinic Headquarters
                        </h3>
                        <div className="space-y-2 relative z-10">
                            <p className="font-black text-xl tracking-tight">{hospital.name}</p>
                            <p className="text-slate-400 text-xs font-medium italic">{hospital.address}</p>
                            <div className="pt-4 flex items-center gap-4">
                                <p className="font-black text-teal-400 text-lg tracking-widest">{hospital.contact}</p>
                                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                            </div>
                        </div>
                    </motion.section>
                </main>
            </motion.div>
        </div>
    );
};

export default GuardianDashboard;
