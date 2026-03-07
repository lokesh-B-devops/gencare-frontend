import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

const Timeline = ({ currentDay, currentPhase, phases }) => {
    if (!phases || phases.length === 0) return null;

    const currentPhaseIndex = phases.findIndex(p => p.label === currentPhase);

    return (
        <div className="w-full py-8 overflow-x-auto no-scrollbar">
            <div className="relative flex items-center justify-between min-w-[600px] px-8">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div
                    className="absolute top-1/2 left-8 h-0.5 bg-rose-400 -translate-y-1/2 z-0 transition-all duration-1000"
                    style={{ width: `calc(${(currentPhaseIndex / (phases.length - 1)) * 100}% - 0px)` }}
                ></div>

                {phases.map((phase, idx) => {
                    const isCompleted = idx < currentPhaseIndex;
                    const isActive = idx === currentPhaseIndex;

                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center group">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: isActive ? 1.2 : 1, opacity: 1 }}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                                    ${isCompleted ? 'bg-rose-500 border-rose-100 text-white' :
                                        isActive ? 'bg-white border-rose-400 text-rose-500 shadow-lg shadow-rose-200' :
                                            'bg-white border-slate-100 text-slate-300'}
                                `}
                            >
                                {isCompleted ? <CheckCircle2 size={18} /> :
                                    isActive ? <Clock size={18} className="animate-pulse" /> :
                                        <Circle size={18} />}
                            </motion.div>

                            <div className="absolute top-12 flex flex-col items-center w-32">
                                <span className={`text-[9px] font-black uppercase tracking-widest text-center transition-colors ${isActive ? 'text-rose-600' : 'text-slate-400'}`}>
                                    {phase.label}
                                </span>
                                {isActive && (
                                    <span className="text-[9px] text-rose-400 font-bold mt-0.5">
                                        Day {currentDay}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Phase Advice / Message */}
            {phases[currentPhaseIndex]?.advice && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-20 p-5 md:p-6 bg-rose-50/50 border border-rose-100 rounded-2xl md:rounded-3xl text-center"
                >
                    <p className="text-rose-800 text-xs md:text-sm italic font-medium leading-relaxed">
                        "{phases[currentPhaseIndex].advice}"
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default Timeline;
