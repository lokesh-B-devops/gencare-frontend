import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AiWelcome = ({ onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const speak = () => {
            const msg = new SpeechSynthesisUtterance("Hi Mommy! I'm so happy you're here! Tee-hee!");
            const voices = window.speechSynthesis.getVoices();
            const babyVoice = voices.find(v => (v.name.toLowerCase().includes('child') || v.name.toLowerCase().includes('girl') || v.name.toLowerCase().includes('kid')) && v.lang.startsWith('en')) ||
                voices.find(v => v.name.includes('Google US English') && v.lang.startsWith('en')) ||
                voices.find(v => v.name.includes('Female') && v.lang.startsWith('en'));
            if (babyVoice) msg.voice = babyVoice;

            msg.rate = 1.4;
            msg.pitch = 2.0;
            msg.volume = 1;

            window.speechSynthesis.speak(msg);
        };

        const timer = setTimeout(speak, 1000);

        const dismissTimer = setTimeout(() => {
            setVisible(false);
            if (onComplete) setTimeout(onComplete, 800);
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
            window.speechSynthesis.cancel();
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[100] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* The Baby "moving here and there" */}
                    <motion.div
                        className="absolute bottom-20 left-1/2 flex flex-col items-center"
                        initial={{ x: "-50%", y: 200, scale: 0 }}
                        animate={{
                            x: ["-80%", "-20%", "-60%", "-40%", "-50%"],
                            y: [0, -20, 0, -30, 0],
                            scale: 1
                        }}
                        exit={{ y: 300, opacity: 0 }}
                        transition={{
                            duration: 6,
                            ease: "easeInOut",
                            times: [0, 0.25, 0.5, 0.75, 1]
                        }}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-pink-400/20 blur-3xl rounded-full scale-150 animate-pulse" />

                        <div className="w-80 h-80 relative">
                            <img
                                src="/baby_assistant.png"
                                alt="AI Baby"
                                className="w-full h-full object-contain"
                            />

                            {/* Speech Bubble */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-2xl shadow-xl border-2 border-pink-100 whitespace-nowrap"
                            >
                                <p className="text-pink-600 font-bold text-lg">Hi Mommy! 👶❤️</p>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-pink-100 rotate-45" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Fun particles */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-pink-300' : 'bg-sky-300'}`}
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: window.innerHeight + 10
                            }}
                            animate={{
                                y: -20,
                                x: "+=" + (Math.random() * 100 - 50)
                            }}
                            transition={{
                                duration: 3 + Math.random() * 4,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiWelcome;
