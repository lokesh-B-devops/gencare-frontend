import React from 'react';
import { motion } from 'framer-motion';

const DnaAnimation = () => {
    const dots = 20; // Number of dots in each strand
    const helixRadius = 40;
    const strandSpacing = 20;

    return (
        <div className="absolute inset-0 pointer-events-none opacity-60">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Left DNA Strand */}
                <div className="relative h-full flex flex-col justify-around py-20">
                    {[...Array(dots)].map((_, i) => (
                        <motion.div
                            key={`dot1-${i}`}
                            className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                            animate={{
                                x: [helixRadius, -helixRadius, helixRadius],
                                scale: [1, 0.5, 1],
                                opacity: [1, 0.3, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Connection Lines (Optional, but adds to the look) */}
                <div className="absolute h-full flex flex-col justify-around py-20">
                    {[...Array(dots)].map((_, i) => (
                        <motion.div
                            key={`line-${i}`}
                            className="h-0.5 bg-indigo-400/20"
                            animate={{
                                width: [helixRadius * 2, 0, helixRadius * 2],
                                x: [-helixRadius, helixRadius, -helixRadius],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Right DNA Strand */}
                <div className="relative h-full flex flex-col justify-around py-20 ml-[-4px]">
                    {[...Array(dots)].map((_, i) => (
                        <motion.div
                            key={`dot2-${i}`}
                            className="w-2 h-2 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.4)]"
                            animate={{
                                x: [-helixRadius, helixRadius, -helixRadius],
                                scale: [0.5, 1, 0.5],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DnaAnimation;
