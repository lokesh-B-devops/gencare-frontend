import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Wind, ShieldCheck, Info } from 'lucide-react';

const StressModeBanner = ({ phaseLabel, countdownDays, dosAndDonts }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-sky-400 to-indigo-500 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl -ml-24 -mb-24"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Wind className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Calm Mode Active</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-4 leading-tight">
                        You're in the {phaseLabel}. <br />
                        Take a deep breath.
                    </h2>
                    <p className="text-sky-50 text-sm font-medium leading-relaxed opacity-90 mb-6 italic">
                        "The hardest part is the waiting, but your body is doing incredible work right now. Honor this time by resting and staying positive."
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-black tracking-tighter">{countdownDays}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Days to Result</div>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Current Focus</div>
                            <div className="text-sm font-bold">Gentle movement & hydration</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={18} />
                        Do's & Don'ts
                    </h3>
                    <div className="space-y-3">
                        {dosAndDonts?.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-300 mt-1.5 shrink-0"></div>
                                <p className="text-sm font-medium">{item}</p>
                            </div>
                        )) || (
                                <>
                                    <p className="text-sm font-medium flex gap-2"><span className="text-sky-300 font-bold">Do:</span> Gentle walking, meditation, reading.</p>
                                    <p className="text-sm font-medium flex gap-2"><span className="text-rose-300 font-bold">Don't:</span> Heavy lifting, high-intensity cardio.</p>
                                </>
                            )}
                    </div>
                    <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 transition-colors">
                        View Care Guide
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StressModeBanner;
