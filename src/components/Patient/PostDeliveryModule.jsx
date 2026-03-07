import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Baby,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    ChevronRight,
    Search,
    ShieldAlert
} from 'lucide-react';

const PostDeliveryModule = ({ data, onToggleChecklist }) => {
    const [selectedCategory, setSelectedCategory] = React.useState(null);

    const categories = [
        { id: 'Recovery', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'Feeding', icon: Baby, color: 'text-sky-500', bg: 'bg-sky-50' },
        { id: 'Hygiene', icon: Sparkles, color: 'text-teal-500', bg: 'bg-teal-50' },
        { id: 'Emergency', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-100' }
    ];

    const filteredGuidance = data.guidance || [];

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Intro */}
            <div className="glass-card rounded-3xl p-8 border-white/50 shadow-xl shadow-rose-900/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-rose-200">
                            <Baby size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Post-Delivery Guidance</h2>
                            <p className="text-sm font-bold text-rose-400 uppercase tracking-widest mt-1">Baby Born: {new Date(data.deliveryDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/40 px-4 py-2 rounded-2xl border border-white/60">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                            <p className="text-lg font-black text-indigo-600">{Object.keys(data.checklistProgress || {}).filter(k => data.checklistProgress[k]).length} Tasks Done</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Alert (Danger Signs) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 relative overflow-hidden group"
            >
                <div className="relative z-10 flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2 uppercase tracking-tight">
                            Safety First: Guidance vs Diagnosis
                        </h3>
                        <p className="opacity-95 leading-relaxed font-medium text-sm">
                            This module provides doctor-approved guidance to support your recovery. It is NOT a substitute for professional medical advice.
                            <span className="block mt-2 font-black underline">Consult your doctor immediately if any danger signs appear.</span>
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
            </motion.div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-4">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedCategory === cat.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm'
                            }`}
                    >
                        <cat.icon size={16} />
                        {cat.id}
                    </button>
                ))}
            </div>

            {/* Guidance Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredGuidance
                    .filter(g => !selectedCategory || g.category === selectedCategory)
                    .map((item, idx) => (
                        <motion.div
                            key={idx}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-[2.5rem] p-8 border-white/50 shadow-xl shadow-rose-900/5 group hover:shadow-2xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${categories.find(c => c.id === item.category)?.bg} ${categories.find(c => c.id === item.category)?.color} shadow-sm group-hover:rotate-12 transition-transform`}>
                                        {React.createElement(categories.find(c => c.id === item.category)?.icon || FileText, { size: 24 })}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{item.title}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                                {item.description}
                            </p>

                            <div className="space-y-6">
                                {/* Instructions / Steps */}
                                {item.steps?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-400 pl-3">Doctor's Steps</h4>
                                        {item.steps.map((step, sIdx) => (
                                            <div key={sIdx} className="flex gap-3 text-sm font-medium text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                                                <span className="text-indigo-400 font-black">{sIdx + 1}.</span>
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Checklist */}
                                {item.checklist?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-teal-400 pl-3">Daily Checklist</h4>
                                        {item.checklist.map((check) => (
                                            <button
                                                key={check.id}
                                                onClick={() => onToggleChecklist(check.id, !data.checklistProgress?.[check.id])}
                                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${data.checklistProgress?.[check.id]
                                                        ? 'bg-teal-50 border-teal-100'
                                                        : 'bg-white border-slate-100 hover:border-indigo-100'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg transition-all ${data.checklistProgress?.[check.id]
                                                        ? 'bg-teal-500 text-white'
                                                        : 'bg-slate-50 text-slate-300'
                                                    }`}>
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-bold text-sm ${data.checklistProgress?.[check.id] ? 'text-teal-900 line-through opacity-70' : 'text-slate-800'}`}>
                                                        {check.label}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{check.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Safety Disclaimer specific to card */}
                                {item.safetyDisclaimers?.length > 0 && (
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start">
                                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                                            <ShieldAlert size={16} />
                                        </div>
                                        <p className="text-[10px] text-amber-800 font-bold leading-relaxed italic">
                                            {item.safetyDisclaimers[0]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
            </div>

            {/* Vaccination Schedule (Placeholder / Mock) */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/50 shadow-xl shadow-rose-900/5">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl shadow-sm">
                            <Clock size={24} />
                        </div>
                        Newborn Vaccination Tracker
                    </h3>
                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">AI Managed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Birth', '2 Months', '4 Months'].map((age, i) => (
                        <div key={i} className="bg-slate-50/50 p-5 rounded-3xl border border-dashed border-slate-200 group hover:border-teal-200 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{age}</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                                    <p className="text-xs font-bold text-slate-700">BCG & Hepatitis B</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    <p className="text-xs font-bold text-slate-400 italic">Scheduled</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostDeliveryModule;
