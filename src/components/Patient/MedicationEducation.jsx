import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Info,
    ChevronDown,
    Sparkles,
    Target,
    Activity,
    AlertCircle,
    Lightbulb,
    ShieldCheck
} from 'lucide-react';

const MedicationEducation = ({ medName, dosage, stage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [education, setEducation] = useState(null);
    const [error, setError] = useState(null);

    const fetchEducation = async () => {
        if (education || loading) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/medical/medication-education?medName=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(dosage || '')}&stage=${encodeURIComponent(stage)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                setEducation(data);
            } else {
                throw new Error(data.details || data.error || 'Failed to load explanation');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !education) {
            fetchEducation();
        }
    }, [isOpen]);

    return (
        <div className="mt-4 pt-4 border-t border-slate-100/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 py-1.5 px-3 rounded-xl transition-all w-fit ${isOpen ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
            >
                {loading ? (
                    <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                    <Sparkles size={12} className={isOpen ? 'animate-pulse' : ''} />
                )}
                {isOpen ? 'Close Insight' : 'Why this medication?'}
                <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        {error ? (
                            <div className="mt-4 p-4 bg-rose-50 rounded-2xl text-[10px] text-rose-500 font-bold flex items-center gap-3 border border-rose-100/50">
                                <AlertCircle size={14} />
                                {error}. Please try again later.
                            </div>
                        ) : education ? (
                            <div className="mt-4 space-y-5 p-5 md:p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">

                                {/* Purpose */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                        <Target size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Medical Purpose</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-700 font-black leading-relaxed">
                                        {education.purpose}
                                    </p>
                                </div>

                                {/* How it Works */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-teal-600">
                                        <Activity size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Mechanism of Action</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed italic opacity-80">
                                        "{education.howItWorks}"
                                    </p>
                                </div>

                                {/* IVF Stage Context */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                                        <Info size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Clinical Context</span>
                                    </div>
                                    <p className="text-[11px] md:text-xs text-slate-600 font-bold leading-relaxed">
                                        {education.stageRelevance}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {/* Side Effects */}
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-rose-500">
                                            <AlertCircle size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Side Effects</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed whitespace-pre-line">
                                            {education.sideEffects}
                                        </p>
                                    </div>

                                    {/* Tips */}
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                            <Lightbulb size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Success Tips</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed whitespace-pre-line">
                                            {education.tips}
                                        </p>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="pt-4 border-t border-slate-100 flex items-start gap-3">
                                    <ShieldCheck size={14} className="text-slate-300 shrink-0" />
                                    <p className="text-[9px] text-slate-400 font-bold italic leading-snug tracking-tight">
                                        {education.disclaimer}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded-full"></div>
                                <div className="h-16 w-full bg-white animate-pulse rounded-2xl border border-slate-100"></div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicationEducation;
