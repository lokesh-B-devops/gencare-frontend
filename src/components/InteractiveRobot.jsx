import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveRobot = ({ name, medications }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentText, setCurrentText] = useState("");

    const handleRobotClick = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentText("");
            return;
        }

        const medNames = medications.map(m => m.name).join(", ");
        const text = `Hi Mommy! I'm your helper baby! ${medNames ? `Your vitamins are ${medNames}.` : "No meds now, let's play!"} You're doing the best job! Tee-hee!`;
        setCurrentText(text);

        const msg = new SpeechSynthesisUtterance(text);
        msg.rate = 1.3; // Faster for a smaller, cuter sound
        msg.pitch = 2.0; // Maximum cute pitch
        msg.volume = 1;

        msg.onstart = () => setIsSpeaking(true);
        msg.onend = () => {
            setIsSpeaking(false);
            setCurrentText("");
        };
        msg.onerror = () => {
            setIsSpeaking(false);
            setCurrentText("");
        };

        const voices = window.speechSynthesis.getVoices();
        // Priority search for childish/girl voices
        const babyVoice = voices.find(v => (v.name.toLowerCase().includes('child') || v.name.toLowerCase().includes('girl') || v.name.toLowerCase().includes('kid')) && v.lang.startsWith('en')) ||
            voices.find(v => v.name.includes('Google US English') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.includes('Female') && v.lang.startsWith('en'));

        if (babyVoice) msg.voice = babyVoice;

        msg.rate = 1.4; // Faster for a smaller, child-like sound
        msg.pitch = 2.0; // Maximum cute/childish pitch
        msg.volume = 1;

        window.speechSynthesis.speak(msg);
    };

    return (
        <div className="relative group cursor-pointer" onClick={handleRobotClick}>
            {/* Speech Bubble */}
            <AnimatePresence>
                {isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
                        className="absolute -top-16 left-1/2 z-50 bg-white border-2 border-indigo-100 px-4 py-2 rounded-2xl shadow-xl min-w-[150px] text-center"
                    >
                        <p className="text-xs font-bold text-indigo-600 leading-tight">
                            {currentText}
                        </p>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-100 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Baby Container */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
            >
                {/* Floating Glow */}
                <div className={`absolute inset-0 bg-pink-400/20 blur-xl rounded-full transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                <img
                    src="/baby_assistant.png"
                    alt="AI Baby Assistant"
                    className={`w-24 h-24 object-contain relative z-10 transition-all duration-500 ${isSpeaking ? 'animate-bounce drop-shadow-xl' : 'group-hover:drop-shadow-lg'}`}
                />

                {/* Status Indicator (Sound Waves) */}
                {isSpeaking && (
                    <div className="absolute -top-2 -right-2 z-20 flex gap-0.5 items-end h-6">
                        <motion.div
                            animate={{ height: [4, 16, 4] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
                            className="w-1 bg-pink-500 rounded-full"
                        />
                        <motion.div
                            animate={{ height: [8, 20, 8] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                            className="w-1 bg-pink-500 rounded-full"
                        />
                        <motion.div
                            animate={{ height: [4, 14, 4] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                            className="w-1 bg-pink-500 rounded-full"
                        />
                    </div>
                )}
            </motion.div>

            {/* Tap to Talk Badge */}
            <AnimatePresence>
                {!isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        TAP TO TALK
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InteractiveRobot;
