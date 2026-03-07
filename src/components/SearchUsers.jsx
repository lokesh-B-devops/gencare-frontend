import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const SearchUsers = ({ onCallUser, onMessageUser }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');
    const [assistant, setAssistant] = useState(null);

    // Determine current user role and fetch Virtual Assistant ID
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'patient') {
            setRoleFilter('doctor');
            fetchAssistant();
        }
        else if (user.role === 'doctor') setRoleFilter('patient');
    }, []);

    const fetchAssistant = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/search/users?role=doctor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const found = data.find(u => u.email === 'assistant@gencare.com');
            if (found) setAssistant(found);
        } catch (error) {
            console.error('Failed to fetch assistant:', error);
        }
    };

    const demoPatients = [
        { id: '507f191e810c19729de86005', _id: '507f191e810c19729de86005', name: 'Elena Rodriguez', role: 'patient', email: 'elena@demo.com', status: 'Online' },
        { id: '507f191e810c19729de86006', _id: '507f191e810c19729de86006', name: 'Priya Sharma', role: 'patient', email: 'priya@demo.com', status: 'Online' },
        { id: '507f191e810c19729de86007', _id: '507f191e810c19729de86007', name: 'Chloe Dubois', role: 'patient', email: 'chloe@demo.com', status: 'Away' },
        { id: '507f191e810c19729de86008', _id: '507f191e810c19729de86008', name: 'Maya Gupta', role: 'patient', email: 'maya@demo.com', status: 'Online' },
        { id: '507f191e810c19729de86002', _id: '507f191e810c19729de86002', name: 'Sarah Jenkins', role: 'patient', email: 'sarah@demo.com', status: 'Online' }
    ];

    const handleSearch = async () => {
        if (!query && !roleFilter) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/search/users?q=${query}&role=${roleFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            let data = await response.json();

            // Include demo patients if searching for patients as a doctor
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.role === 'doctor' && (roleFilter === 'patient' || !roleFilter)) {
                const demoMatches = demoPatients.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.email.toLowerCase().includes(query.toLowerCase())
                );

                // Avoid duplicates if any demo ID happens to exist in real data
                const realIds = new Set(data.map(u => String(u._id || u.id)));
                const uniqueDemoMatches = demoMatches.filter(p => !realIds.has(String(p.id)));

                data = [...data, ...uniqueDemoMatches];
            }

            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = user.role === 'doctor' ? (user.name?.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : user.name;

    return (
        <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl max-w-2xl mx-auto mt-6 md:mt-10 border border-slate-50">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 mb-6 md:mb-8 tracking-tighter italic">
                {doctorName ? <span className="block mb-2 text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest not-italic">Search for {doctorName}</span> : null}
                Find <span className="text-rose-500">Doctor</span> or <span className="text-indigo-500">Patient</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="flex-1 p-3.5 md:p-4 border border-slate-100 rounded-2xl md:rounded-3xl focus:ring-4 focus:ring-rose-500/10 outline-none transition-all placeholder:text-slate-400 text-sm md:text-base font-medium"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="flex gap-2">
                    <select
                        className="flex-1 sm:flex-none p-3.5 md:p-4 border border-slate-100 rounded-2xl md:rounded-3xl bg-slate-50 text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 text-xs md:text-sm font-bold uppercase tracking-wider"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="doctor">Doctors</option>
                        <option value="patient">Patients</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="bg-slate-900 text-white px-6 md:px-8 py-3.5 rounded-2xl md:rounded-3xl hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-100"
                    >
                        {loading ? 'Searching...' : 'Go'}
                    </button>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                {/* Pinned Virtual Assistant for Patients */}
                {JSON.parse(localStorage.getItem('user') || '{}').role === 'patient' && !query && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 border-2 border-rose-100 bg-rose-50/10 rounded-2xl md:rounded-[2.5rem] shadow-sm overflow-hidden relative group gap-4">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Sparkles size={60} className="text-rose-400" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 border border-rose-100 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                <img src="/ai_assistant_logo.png" alt="AI Agent" className="w-full h-full object-contain rounded-lg" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-800 tracking-tight italic text-base md:text-lg">Virtual Assistant</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Medical AI Companion • Online</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onMessageUser(assistant || { name: 'Virtual Assistant', email: 'assistant@gencare.com' });
                            }}
                            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-[10px] shadow-xl font-black uppercase tracking-wider relative z-10"
                        >
                            <span className="material-icons text-sm">chat</span>
                            Ask Assistant
                        </button>
                    </div>
                )}

                {results.length > 0 ? (
                    results.map((user) => (
                        <div key={user._id || user.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 border ${user.isAssigned ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'} rounded-2xl md:rounded-[2.5rem] hover:shadow-xl hover:border-white transition-all gap-4`}>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-inner shrink-0">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl font-black">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <h3 className="font-black text-slate-800 tracking-tight text-base md:text-lg truncate">
                                            {user.role === 'doctor' && !user.name.startsWith('Dr.') ? `Dr. ${user.name}` : user.name}
                                        </h3>
                                        {user.isAssigned && (
                                            <span className="bg-rose-500 text-white text-[8px] md:text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest whitespace-nowrap">My Doctor</span>
                                        )}
                                    </div>
                                    {user.role === 'doctor' && user.doctorProfile ? (
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-rose-600 truncate">{user.doctorProfile.specialization}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{user.doctorProfile.hospitalName} • {user.doctorProfile.experienceYears}Y Experience</p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{user.role} • {user.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => onMessageUser(user)}
                                    className="flex-1 sm:flex-none bg-slate-900 text-white px-5 md:px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                                >
                                    <span className="material-icons text-sm">chat</span>
                                    Chat
                                </button>
                                <button
                                    onClick={() => onCallUser(user)}
                                    className="flex-1 sm:flex-none bg-rose-500 text-white px-5 md:px-6 py-3 rounded-2xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95"
                                >
                                    <span className="material-icons text-sm">video_call</span>
                                    Call
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && query && (
                        <div className="text-center text-slate-300 py-16">
                            <span className="material-icons text-6xl mb-4 opacity-10">person_search</span>
                            <p className="font-bold text-sm uppercase tracking-widest opacity-50">No medical professionals found</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SearchUsers;
