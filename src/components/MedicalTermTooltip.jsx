import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const MedicalTermTooltip = ({ term, definition }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span className="relative inline-block group">
            <span
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="underline decoration-dotted decoration-teal-400 underline-offset-4 cursor-help font-bold text-teal-600 hover:text-teal-700 transition-colors"
            >
                {term}
            </span>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-800 text-white rounded-2xl shadow-2xl z-50 text-left pointer-events-none"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-teal-500 rounded-lg shrink-0">
                                <Info size={14} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">Simplified Explanation</h4>
                                <p className="text-xs font-medium leading-relaxed italic">
                                    {definition}
                                </p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-800"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

export default MedicalTermTooltip;
