import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchUsers from '../components/SearchUsers';
import VideoCall from '../components/VideoCall';
import Chat from '../components/Chat';

const CommunicationPage = () => {
    const [activeCall, setActiveCall] = useState(null);
    const [activeChat, setActiveChat] = useState(null);

    const { state } = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = user.role === 'doctor' ? (user.name?.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : user.name;

    const startCall = (user) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const participant1 = currentUser.id || currentUser._id;
        const participant2 = user.id || user._id;
        const roomName = `GENCARE-${[participant1, participant2].sort().join('-')}`;
        setActiveCall({ roomName, user });
        setActiveChat(null);
    };

    const startChat = (user) => {
        setActiveChat(user);
        setActiveCall(null);
    };

    useEffect(() => {
        const fetchAndStartAssistant = async () => {
            if (state?.openAssistant) {
                if (state?.assistantId) {
                    startChat({ _id: state.assistantId, name: 'Virtual Assistant' });
                } else {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/search/users?role=doctor', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const users = await res.json();
                            const assistant = users.find(u => u.email === 'assistant@gencare.com' || u.name === 'Virtual Assistant');
                            if (assistant) {
                                startChat(assistant);
                                return;
                            }
                        }
                        console.error("AI Assistant not found in database. Please log out and back in to refresh the session.");
                    } catch (err) {
                        console.error("Failed to fetch assistant:", err);
                    }
                }
            }
        };
        fetchAndStartAssistant();
    }, [state]);

    const endCall = () => {
        setActiveCall(null);
    };

    const backToSearch = () => {
        setActiveChat(null);
        setActiveCall(null);
    };

    return (
        <div className="min-h-screen nurture-gradient mobile-bottom-spacing">
            {!activeCall && !activeChat ? (
                <div className="responsive-container py-8">
                    <header className="mb-8 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 font-display italic">
                                GENCARE <span className="text-rose-500">Communication</span>
                            </h1>
                            <p className="text-gray-500 mt-1 md:mt-2 text-xs md:text-base font-medium">
                                {doctorName ? `Welcome, ${doctorName}. ` : ''}Connect with your medical team instantly via chat or video.
                            </p>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl text-gray-600 hover:text-rose-500 flex items-center gap-2 transition-all border border-white/20 shadow-sm text-xs font-bold"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                    </header>

                    <div className="space-y-6 md:space-y-8">
                        <SearchUsers onCallUser={startCall} onMessageUser={startChat} />

                        <div className="bg-rose-50/50 border border-rose-100 p-5 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-sm">
                            <h3 className="text-rose-800 font-bold mb-3 flex items-center gap-2 text-sm md:text-base">
                                <span className="material-icons text-rose-500 text-lg">verified_user</span>
                                Secure Communication
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ul className="text-rose-700/80 text-xs md:text-sm space-y-2 list-none">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                                        Instant text messaging for quick queries.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                                        Real-time video consultations through Jitsi.
                                    </li>
                                </ul>
                                <ul className="text-rose-700/80 text-xs md:text-sm space-y-2 list-none">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                                        HIPAA compliant secure data transmission.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                                        Search and connect by name or role.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeCall ? (
                <div className="w-full h-full p-0">
                    <VideoCall
                        roomName={activeCall.roomName}
                        onEndCall={endCall}
                    />
                </div>
            ) : (
                <div className="responsive-container py-4 md:py-8">
                    <Chat
                        recipientId={activeChat.id || activeChat._id}
                        recipientName={activeChat.name}
                        onBack={backToSearch}
                    />
                </div>
            )}
        </div>
    );
};

export default CommunicationPage;
