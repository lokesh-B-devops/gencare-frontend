import React, { useEffect, useRef, useState } from 'react';

const VideoCall = ({ roomName, onEndCall }) => {
    const containerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const [sourceLang, setSourceLang] = useState('en-US');
    const [targetLang, setTargetLang] = useState('es-ES');
    const [isTranslating, setIsTranslating] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [translation, setTranslation] = useState('');

    const languages = [
        { code: 'en-US', label: 'English', target: 'en' },
        { code: 'es-ES', label: 'Spanish', target: 'es' },
        { code: 'fr-FR', label: 'French', target: 'fr' },
        { code: 'hi-IN', label: 'Hindi', target: 'hi' },
        { code: 'zh-CN', label: 'Chinese', target: 'zh' },
    ];

    useEffect(() => {
        // Dynamically load Jitsi script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
            const domain = 'meet.jit.si';
            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: containerRef.current,
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApiRef.current = api;

            api.addEventListener('videoConferenceLeft', () => {
                onEndCall();
            });

            // Listen for incoming translated messages from others
            api.addEventListener('endpointTextMessageReceived', (event) => {
                // event.data.text contains the message
                // event.data.senderId contains the sender
                try {
                    const data = JSON.parse(event.data.text);
                    if (data && data.isTranslation) {
                        handleIncomingTranslation(data.text);
                    }
                } catch (e) {
                    // Not a translation message or malformed JSON
                }
            });

            // Ensure voices are loaded
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        };

        document.body.appendChild(script);

        return () => {
            if (jitsiApiRef.current) jitsiApiRef.current.dispose();
            document.body.removeChild(script);
        };
    }, [roomName, onEndCall]);

    const handleIncomingTranslation = (text) => {
        setTranslation(text);
        const utterance = new SpeechSynthesisUtterance(text);
        // Find a voice for the target language if possible
        const voices = window.speechSynthesis.getVoices();
        const targetVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (targetVoice) utterance.voice = targetVoice;

        window.speechSynthesis.speak(utterance);
    };

    const startTranslation = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser doesn't support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = sourceLang;
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onresult = async (event) => {
            const text = event.results[event.results.length - 1][0].transcript;
            setTranscription(text);

            // Translate the text
            try {
                const targetCode = languages.find(l => l.code === targetLang)?.target || 'es';
                const sourceCode = languages.find(l => l.code === sourceLang)?.target || 'en';

                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`);
                const data = await response.json();
                const translatedText = data.responseData.translatedText;

                // Send to all participants in the room
                if (jitsiApiRef.current) {
                    const participants = jitsiApiRef.current.getParticipantsInfo();
                    const message = JSON.stringify({
                        text: translatedText,
                        isTranslation: true
                    });

                    participants.forEach(p => {
                        jitsiApiRef.current.executeCommand('sendEndpointTextMessage', p.participantId, message);
                    });
                }

                // Also show it locally for feedback
                setTranslation(`(Spanish) ${translatedText}`);
            } catch (error) {
                console.error("Translation error:", error);
            }
        };

        recognition.onstart = () => setIsTranslating(true);
        recognition.onend = () => setIsTranslating(false);
        recognition.onerror = () => setIsTranslating(false);

        recognition.start();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Secure Video Consultation: {roomName}</h2>
                    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                        <span className="text-xs text-gray-400">Translate:</span>
                        <select
                            className="bg-transparent text-xs outline-none"
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                        >
                            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                        <span className="text-xs text-gray-400">to</span>
                        <select
                            className="bg-transparent text-xs outline-none"
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                        >
                            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                        <button
                            onClick={startTranslation}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${isTranslating ? 'bg-green-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isTranslating ? 'Listening...' : 'Enable Live Translation'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {transcription && (
                        <div className="hidden md:block bg-gray-800 px-3 py-1 rounded-full text-xs max-w-[200px] truncate">
                            You: {transcription}
                        </div>
                    )}
                    <button
                        onClick={onEndCall}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                        End Call
                    </button>
                </div>
            </div>

            {/* Translation Subtitles Overlay */}
            {translation && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-2xl px-4">
                    <div className="bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl border border-white/10 text-center animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-sm font-medium opacity-60 mb-1">Incoming Translation</p>
                        <p className="text-xl font-bold">{translation}</p>
                    </div>
                </div>
            )}

            <div ref={containerRef} className="flex-1" />
        </div>
    );
};

export default VideoCall;
