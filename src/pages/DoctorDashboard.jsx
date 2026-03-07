import React from 'react';
import {
    Users,
    AlertTriangle,
    Activity,
    Search,
    Video,
    MessageSquare,
    FileText,
    Bell,
    Clock,
    Heart,
    ChevronRight,
    Sparkles,
    Calendar as CalendarIcon,
    XCircle,
    Phone,
    Baby,
    ArrowRightLeft,
    CreditCard,
    Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SchedulingCalendar from '../components/Calendar/SchedulingCalendar';
import AdminExpenseManager from '../components/Doctor/AdminExpenseManager';
import EscalationAlerts from '../components/Doctor/EscalationAlerts';
import EmbryoTransferGuidance from '../components/Doctor/EmbryoTransferGuidance';

const DoctorDashboard = () => {
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedPatientId, setSelectedPatientId] = React.useState(null);
    const [selectedPatientData, setSelectedPatientData] = React.useState(null);
    const [timelineTemplates, setTimelineTemplates] = React.useState([]);
    const [showTimelineModal, setShowTimelineModal] = React.useState(false);
    const [patientReports, setPatientReports] = React.useState([]);
    const [isFetchingReports, setIsFetchingReports] = React.useState(false);
    const [showReportsModal, setShowReportsModal] = React.useState(false);
    const [activeReport, setActiveReport] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [showTransparencyModal, setShowTransparencyModal] = React.useState(false);
    const [transparencyForm, setTransparencyForm] = React.useState({ type: 'donor', data: {} });
    const [isSavingTransparency, setIsSavingTransparency] = React.useState(false);
    const [showPostDeliveryModal, setShowPostDeliveryModal] = React.useState(false);
    const [activationDeliveryDate, setActivationDeliveryDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [selectedPatientForExpense, setSelectedPatientForExpense] = React.useState(null);
    const [showEscalationModal, setShowEscalationModal] = React.useState(false);
    const [showEmbryoGuidanceModal, setShowEmbryoGuidanceModal] = React.useState(false);

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const [dashRes, timelineRes] = await Promise.all([
                    fetch('/api/dashboard/doctor', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/timeline/templates', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (dashRes.ok) setProfile(await dashRes.json());
                if (timelineRes.ok) setTimelineTemplates(await timelineRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleReviewReports = async (patientId) => {
        if (!patientId) {
            alert("Please select a patient first from the roster.");
            return;
        }
        // ... rest of the function remains the same but updated for context ...

        setIsFetchingReports(true);
        setShowReportsModal(true);
        setActiveReport(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/medical/reports/patient/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPatientReports(data);
                if (data.length > 0) setActiveReport(data[0]);
            } else {
                alert("Failed to fetch patient reports.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while fetching reports.");
        } finally {
            setIsFetchingReports(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen nurture-gradient flex items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center text-rose-500"
            >
                <Heart fill="currentColor" size={24} />
            </motion.div>
        </div>
    );

    if (!profile) return <div className="p-8 text-center text-rose-900 font-bold">Access Denied. Please log in.</div>;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = storedUser.name ? (storedUser.name.startsWith('Dr.') ? storedUser.name : `Dr. ${storedUser.name}`) : "Dr. Practitioner";
    const specialization = profile.specialization;

    const demoPatients = [
        { id: '507f191e810c19729de86005', name: 'Elena Rodriguez', age: 38, stage: 'Preparation', day: 'Day 12', score: 92, adherence: 'High', status: 'Monitor', lastSync: '2 hours ago', riskTrend: Array(7).fill({ score: 92 }) },
        { id: '507f191e810c19729de86006', name: 'Priya Sharma', age: 29, stage: 'Stimulation', day: 'Day 8', score: 98, adherence: 'High', status: 'Monitor', lastSync: '1 hour ago', riskTrend: Array(7).fill({ score: 98 }) },
        { id: '507f191e810c19729de86007', name: 'Chloe Dubois', age: 42, stage: 'Transfer', day: 'Day 3', score: 55, adherence: 'Low', status: 'Attention', lastSync: '30 mins ago', riskTrend: Array(7).fill({ score: 55 }) },
        { id: '507f191e810c19729de86008', name: 'Maya Gupta', age: 34, stage: 'Waiting Period', day: 'Day 10', score: 85, adherence: 'High', status: 'Monitor', lastSync: '5 hours ago', riskTrend: Array(7).fill({ score: 85 }) },
        { id: '507f191e810c19729de86002', name: 'Sarah Jenkins', age: 32, stage: 'Stimulation', day: 'Day 8', score: 45, adherence: 'Low', status: 'Attention', lastSync: '10 mins ago', riskTrend: Array(7).fill({ score: 45 }) }
    ];

    const patients = (profile.patients && profile.patients.length > 0)
        ? profile.patients
            .filter(p => p && p._id)
            .map((p, index) => {
                const score = p.adherenceScore || 100;
                let adherence = "High";
                let status = "Monitor";

                if (score < 60) {
                    adherence = "Low";
                    status = "Attention";
                } else if (score < 85) {
                    adherence = "Medium";
                    status = "Monitor";
                }

                return {
                    id: String(p._id),
                    name: p.user?.name || "Unknown",
                    age: 30 + index,
                    stage: p.ivfDetails?.stage || "Stimulation",
                    day: "Day " + (p.timeline?.currentDay || 1),
                    score: score,
                    adherence: adherence,
                    status: status,
                    lastSync: p.lastSync ? new Date(p.lastSync).toLocaleString() : "Never",
                    riskTrend: p.riskTrend?.length > 0 ? p.riskTrend : Array(7).fill({ score: 100 })
                };
            })
        : demoPatients;

    const stats = [
        { label: "Active Patients", value: patients.length, trend: "+3 this week", color: "from-rose-400 to-rose-500", icon: Users },
        { label: "High Attention", value: patients.filter(p => p.status === 'Attention').length || "2", trend: "Review needed", color: "from-amber-400 to-amber-500", icon: AlertTriangle },
        { label: "Total Procedures", value: "124", trend: "12 this month", color: "from-teal-400 to-teal-500", icon: Activity },
    ];

    const alerts = [
        { type: "emergency", patient: "Chloe Dubois", message: "Reported severe pain post-retrieval", time: "10 mins ago" },
        { type: "missed-med", patient: "Sarah Jenkins", message: "Missed evening Ganirelix injection", time: "2 hours ago" },
        { type: "low-adherence", patient: "Elena Rodriguez", message: "Progesterone adherence below 60%", time: "5 hours ago" },
    ];

    const handlePatientClick = (patient) => {
        setSelectedPatientId(patient.id);
        setSelectedPatientData(patient);
    };

    const handleAssignTimeline = async (templateId) => {
        // ... handled in original ...
    };

    const handleOpenTransparency = async (patientId) => {
        setSelectedPatientId(patientId);
        setShowTransparencyModal(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/transparency/doctor/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTransparencyForm({
                    type: 'donor',
                    donorData: data.donor || { ageRange: '', bloodGroup: '', geneticScreening: '', medicalFitness: '', infectiousDiseaseClearance: '', matchingScore: 0, doctorNotes: '', isPublished: false },
                    surrogateData: data.surrogate || { ageRange: '', bloodGroup: '', geneticScreening: '', medicalFitness: '', infectiousDiseaseClearance: '', matchingScore: 0, doctorNotes: '', isPublished: false }
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveTransparency = async (type) => { // type: 'donor' or 'surrogate'
        setIsSavingTransparency(true);
        try {
            const token = localStorage.getItem('token');
            const data = type === 'donor' ? transparencyForm.donorData : transparencyForm.surrogateData;
            const res = await fetch('/api/transparency/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ patientId: selectedPatientId, type, data })
            });
            if (res.ok) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} transparency data saved successfully!`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingTransparency(false);
        }
    };

    const handleActivatePostDelivery = async () => {
        if (!selectedPatientId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/post-delivery/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientId: selectedPatientId,
                    deliveryDate: activationDeliveryDate
                })
            });
            if (res.ok) {
                alert("Post-delivery care activated successfully!");
                setShowPostDeliveryModal(false);
                // Refresh profile to update patient status if needed
                const dashRes = await fetch('/api/dashboard/doctor', { headers: { Authorization: `Bearer ${token}` } });
                if (dashRes.ok) setProfile(await dashRes.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const adherenceAlerts = patients
        .filter(p => p.score < 60)
        .map(p => ({
            type: "low-adherence",
            patient: p.name,
            message: `Adherence score dropped to ${p.score}. Immediate follow-up required.`,
            time: "Just now"
        }));

    const allAlerts = [...adherenceAlerts, ...alerts];

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen nurture-gradient font-sans text-slate-800 mobile-bottom-spacing">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="responsive-container"
            >
                <main className="py-6 space-y-8 animate-in fade-in duration-700">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-rose-900/5">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg ring-4 ring-rose-50">
                                    <Sparkles size={20} />
                                </div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
                                    Welcome back, {doctorName}!
                                </h1>
                            </div>
                            <p className="text-slate-500 font-medium italic text-sm ml-12">
                                {specialization} • {profile.hospitalName || 'Main Clinic'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl border border-rose-100/50">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                                <Clock size={20} />
                            </div>
                            <div className="pr-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Status</p>
                                <p className="text-xs font-black text-orange-600 uppercase tracking-tighter italic">On Duty • Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 rounded-[2rem] border-white/60 shadow-xl shadow-rose-900/5 group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-rose-300 tracking-wider uppercase group-hover:text-rose-500 transition-colors">{stat.trend}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-4xl font-black mt-2 text-slate-800 tracking-tighter">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 glass-card rounded-[2.5rem] border-white/60 shadow-xl shadow-rose-900/5 overflow-hidden">
                            <div className="px-8 py-6 border-b border-rose-50/50 flex justify-between items-center bg-white/30">
                                <h2 className="font-black text-xl text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                                        <Users size={20} />
                                    </div>
                                    Patient Roster
                                </h2>
                                <button className="text-xs font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">History</button>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Mobile Search */}
                                <div className="md:hidden relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-4 h-4 group-focus-within:text-rose-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={`Dr. ${doctorName.replace('Dr. ', '')}, find patient...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 bg-white/50 border border-rose-100/50 rounded-2xl text-sm outline-none transition-all"
                                    />
                                </div>

                                {/* Desktop Search (Added for consistency) */}
                                <div className="hidden md:block relative group max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-4 h-4 group-focus-within:text-rose-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={`Dr. ${doctorName.replace('Dr. ', '')}, search your patient roster...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-rose-100/50 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    />
                                </div>

                                <div className="py-4">
                                    <SchedulingCalendar role="doctor" />
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto pb-4">
                                    <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                                        <thead className="text-slate-400 uppercase tracking-[0.2em] font-black text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4">Identity</th>
                                                <th className="px-6 py-4">Stage</th>
                                                <th className="px-6 py-4">Care Score</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Connect</th>
                                            </tr>
                                        </thead>
                                        <tbody className="space-y-4">
                                            {filteredPatients.map((patient) => (
                                                <motion.tr
                                                    key={patient.id}
                                                    whileHover={{ scale: 1.005 }}
                                                    onClick={() => handlePatientClick(patient)}
                                                    className={`group cursor-pointer transition-all ${selectedPatientId === patient.id ? 'bg-rose-50 shadow-inner' : 'bg-white/40 hover:bg-white hover:shadow-xl hover:shadow-rose-900/5'}`}
                                                    style={{ borderRadius: '1.5rem' }}
                                                >
                                                    <td className="px-6 py-5 first:rounded-l-2xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all ${selectedPatientId === patient.id ? 'bg-rose-500 text-white rotate-6' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500 group-hover:-rotate-3'}`}>
                                                                {patient.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-800 tracking-tight">{patient.name}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                    {patient.age}y • ID: {patient.id.slice(-4)} •
                                                                    <span className="text-teal-500 ml-1">Synced: {patient.lastSync}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="block font-black text-slate-700 tracking-tight">{patient.stage}</span>
                                                        <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{patient.day}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${patient.score}%` }}
                                                                    className={`h-full rounded-full ${patient.score < 60 ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]' : patient.score < 85 ? 'bg-amber-400' : 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'}`}
                                                                />
                                                            </div>
                                                            <span className="font-black text-slate-800 text-xs italic">{patient.score}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                                                        ${patient.status === 'Attention' ? 'bg-rose-50 border-rose-100 text-rose-500 animate-pulse' : 'bg-teal-50 border-teal-100 text-teal-500'}`}>
                                                            {patient.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right last:rounded-r-2xl">
                                                        <div className="flex items-center justify-end gap-1 px-4">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); window.location.href = '/communication'; }}
                                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                            >
                                                                <Video size={16} />
                                                            </button>
                                                            <button className="p-2 text-slate-300 hover:text-teal-500 hover:bg-teal-50 rounded-xl transition-all">
                                                                <MessageSquare size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {filteredPatients.map((patient) => (
                                        <motion.div
                                            key={patient.id}
                                            onClick={() => handlePatientClick(patient)}
                                            className={`p-5 rounded-3xl border transition-all ${selectedPatientId === patient.id ? 'bg-rose-50 border-rose-200 shadow-inner' : 'bg-white border-rose-50 hover:shadow-lg'}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedPatientId === patient.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-sm">{patient.name}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{patient.age}y • ID: {patient.id.slice(-4)}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${patient.status === 'Attention' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-teal-50 border-teal-100 text-teal-500'}`}>
                                                    {patient.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <div>
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Current Stage</span>
                                                    <span className="font-black text-slate-700">{patient.stage}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Care Score</span>
                                                    <span className={`font-black ${patient.score < 60 ? 'text-rose-500' : patient.score < 85 ? 'text-amber-500' : 'text-teal-500'}`}>{patient.score}%</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-rose-50 flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); window.location.href = '/communication'; }} className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                                                        <Video size={16} />
                                                    </button>
                                                    <button className="p-2 bg-teal-50 text-teal-500 rounded-xl">
                                                        <MessageSquare size={16} />
                                                    </button>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-[2rem] border-white/60 shadow-xl shadow-rose-900/5 overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-rose-50/50 bg-rose-50/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-rose-500" />
                                        <h3 className="font-black text-rose-900 text-[10px] uppercase tracking-widest">Priority Alerts</h3>
                                    </div>
                                    <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">{allAlerts.length}</span>
                                </div>
                                <div className="divide-y divide-rose-50/50 bg-white/10">
                                    {allAlerts.map((alert, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ x: 5 }}
                                            className="p-5 cursor-pointer transition-colors hover:bg-rose-50/30"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-black text-slate-800 text-xs tracking-tight">{alert.patient}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">{alert.time}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{alert.message}</p>
                                        </motion.div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowEscalationModal(true)}
                                    className="w-full py-4 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all border-t border-rose-100/50"
                                >
                                    View All Medication Escalations
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card rounded-[2rem] p-6 border-white/60 shadow-xl shadow-rose-900/5"
                            >
                                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-6">Patient Adherence Trend</h3>
                                {selectedPatientData ? (
                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between h-20 gap-1 px-1">
                                            {selectedPatientData.riskTrend.map((day, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${day.score}%` }}
                                                        className={`w-full rounded-t-lg ${day.score < 60 ? 'bg-rose-400' : day.score < 85 ? 'bg-amber-400' : 'bg-teal-400'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase italic">
                                            <span>7 Days Ago</span>
                                            <span>Today</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">Select a patient to view trend.</p>
                                )}
                            </motion.div>

                            {/* Video Consultation Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 shadow-xl shadow-teal-900/20 text-white"
                            >
                                <div className="absolute top-0 right-0 opacity-10">
                                    <Video size={120} strokeWidth={1} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner">
                                            <Video size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Telehealth</p>
                                            <h3 className="font-black text-white text-base tracking-tight">Video Consultation</h3>
                                        </div>
                                    </div>
                                    <p className="text-emerald-100 text-xs font-medium mb-5 leading-relaxed">
                                        Start a secure video call{selectedPatientData ? ` with ${selectedPatientData.name}` : ' with a patient'}. Review reports and adjust treatment in real-time.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/communication'}
                                        className="w-full flex items-center justify-center gap-2 bg-white text-emerald-700 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-emerald-50 hover:-translate-y-0.5 transition-all active:scale-95"
                                    >
                                        <Phone size={14} />
                                        Start Video Call
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card rounded-[2rem] p-6 border-white/60 shadow-xl shadow-rose-900/5"
                            >
                                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-6">Quick Clinical Portal</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowTimelineModal(true)}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-indigo-100 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                            <Activity size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Manage Timeline</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-500" />
                                    </button>
                                    <button
                                        onClick={() => handleReviewReports(selectedPatientId)}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                                            <FileText size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Lab Analysis</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-rose-500" />
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/communication'}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-emerald-100 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                            <MessageSquare size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Message Patient</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-500" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenTransparency(selectedPatientId)}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-amber-100 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                                            <Sparkles size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Transparency Control</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-amber-500" />
                                    </button>
                                    <button
                                        onClick={() => setShowPostDeliveryModal(true)}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-rose-200 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                            <Baby size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Activate Post-Delivery</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-orange-500" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedPatientForExpense(patients.find(p => p.id === selectedPatientId));
                                            setShowExpenseModal(true);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-indigo-200 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                            <CreditCard size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Surrogacy Expenses</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-500" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!selectedPatientId) return alert("Select a patient first.");
                                            setShowEmbryoGuidanceModal(true);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 text-xs font-black text-slate-700 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-rose-300 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                                            <Brain size={18} />
                                        </div>
                                        <span className="flex-1 text-left uppercase tracking-widest">Embryo Transfer Guide</span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-orange-500" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </main>

                <AnimatePresence>
                    {showReportsModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-900/20 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-white"
                            >
                                <div className="p-6 border-b border-rose-50 flex justify-between items-center bg-rose-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg ring-4 ring-rose-50">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Lab Clinical Review</h2>
                                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mt-1">
                                                AI-Assisted Diagnostics • Patient ID: {selectedPatientId?.slice(-6)}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowReportsModal(false)} className="bg-white/50 p-3 rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-slate-400 font-black text-xs uppercase tracking-widest shadow-sm">
                                        Dismiss
                                    </button>
                                </div>

                                <div className="flex-1 flex overflow-hidden">
                                    <div className="w-80 border-r border-rose-50 flex flex-col bg-rose-50/10">
                                        <div className="p-6">
                                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em]">Patient Records</p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {isFetchingReports ? (
                                                <div className="text-center py-20">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block"><Sparkles className="text-rose-300" /></motion.div>
                                                    <p className="text-[10px] font-black text-rose-300 uppercase mt-4 tracking-widest">Fetching Assets...</p>
                                                </div>
                                            ) : patientReports.length > 0 ? (
                                                patientReports.map((report) => (
                                                    <motion.button
                                                        key={report._id}
                                                        whileHover={{ x: 5 }}
                                                        onClick={() => setActiveReport(report)}
                                                        className={`w-full text-left p-4 rounded-[1.5rem] transition-all border ${activeReport?._id === report._id ? 'bg-white border-rose-200 shadow-xl shadow-rose-900/5' : 'border-transparent hover:bg-white/50'}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${activeReport?._id === report._id ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-400'}`}>
                                                                <FileText size={14} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-black text-slate-800 text-xs truncate tracking-tight">{report.originalName}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{new Date(report.uploadedAt).toLocaleDateString()} • {report.mimetype}</p>
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <div className="text-center py-20 text-rose-300 text-[10px] font-black uppercase tracking-widest">Zero findings recorded.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-white p-10">
                                        {activeReport ? (
                                            <motion.div
                                                key={activeReport._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="max-w-3xl mx-auto space-y-10"
                                            >
                                                <div className="flex items-center justify-between border-b border-rose-50 pb-8">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-teal-50 text-teal-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-100">Validated</span>
                                                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">{activeReport.mimetype} • {Math.round(activeReport.size / 1024)}KB</span>
                                                        </div>
                                                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{activeReport.originalName}</h3>
                                                        <p className="text-xs text-slate-400 mt-1 font-medium italic">Clinical asset refined on {new Date(activeReport.uploadedAt).toLocaleString()}</p>
                                                    </div>
                                                    <button className="bg-white border border-rose-100 text-rose-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white shadow-sm transition-all flex items-center gap-2">
                                                        <Activity size={16} />
                                                        View Full
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="md:col-span-2 space-y-8">
                                                        <section>
                                                            <h4 className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-4">AI Clinical Synthesis</h4>
                                                            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-[2rem] p-8 relative overflow-hidden group shadow-inner">
                                                                <div className="absolute top-0 right-0 p-4 text-rose-100 group-hover:text-rose-200 transition-colors">
                                                                    <Sparkles size={32} />
                                                                </div>
                                                                <p className="text-rose-900 leading-relaxed font-black text-lg italic tracking-tight relative z-10 transition-transform group-hover:translate-x-1">
                                                                    "{activeReport.aiAnalysis?.summary || 'No synthesis available.'}"
                                                                </p>
                                                            </div>
                                                        </section>

                                                        <section>
                                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Detailed Clinical Evidence</h4>
                                                            <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 text-slate-600 leading-relaxed font-medium whitespace-pre-wrap shadow-inner text-sm italic">
                                                                {activeReport.aiAnalysis?.details || 'No evidence available.'}
                                                            </div>
                                                        </section>
                                                    </div>

                                                    <div className="space-y-8">
                                                        <section>
                                                            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-4">Next Steps</h4>
                                                            <div className="space-y-3">
                                                                {activeReport.aiAnalysis?.recommendations?.map((rec, i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        whileHover={{ x: 3 }}
                                                                        className="bg-teal-50/50 border border-teal-100 p-5 rounded-[1.5rem] flex gap-3 shadow-sm"
                                                                    >
                                                                        <div className="w-6 h-6 bg-teal-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm">{i + 1}</div>
                                                                        <p className="text-teal-900 text-xs font-bold leading-relaxed">{rec}</p>
                                                                    </motion.div>
                                                                )) || <p className="text-xs text-slate-400 font-bold italic">No recommended path.</p>}
                                                            </div>
                                                        </section>

                                                        <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 shadow-inner">
                                                            <div className="flex items-center gap-2 mb-3 text-amber-700 font-black text-[10px] uppercase tracking-widest">
                                                                <AlertTriangle size={14} className="text-amber-500" />
                                                                Clinical Safety
                                                            </div>
                                                            <p className="text-amber-800 text-[11px] leading-relaxed font-medium italic">
                                                                AI synthesis is for optimization support. Always cross-verify with source lab metrics before diagnostic finalization.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-rose-100 space-y-6">
                                                <FileText size={80} strokeWidth={1} />
                                                <p className="text-lg font-black uppercase tracking-widest text-rose-200">Select Clinical Asset</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {showEmbryoGuidanceModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar"
                            >
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmbryoGuidanceModal(false)}
                                        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                    <EmbryoTransferGuidance
                                        patientId={selectedPatientId}
                                        onDecisionConfirmed={() => {
                                            // Optional: refresh dashboard data or just keep modal open to show status
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                    {showTransparencyModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/20 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white"
                            >
                                <div className="p-6 border-b border-amber-50 flex justify-between items-center bg-amber-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Donor & Surrogate Transparency</h2>
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">
                                                Manage Anonymized Clinical Disclosures for {selectedPatientData?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowTransparencyModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Donor Management */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                                        <Sparkles size={16} />
                                                    </div>
                                                    Donor Profile
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Published</span>
                                                    <button
                                                        onClick={() => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, isPublished: !prev.donorData.isPublished } }))}
                                                        className={`w-10 h-5 rounded-full transition-all relative ${transparencyForm.donorData?.isPublished ? 'bg-teal-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${transparencyForm.donorData?.isPublished ? 'right-1' : 'left-1'}`}></div>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Age Range</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 25-30"
                                                        value={transparencyForm.donorData?.ageRange || ''}
                                                        onChange={(e) => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, ageRange: e.target.value } }))}
                                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Blood Group</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. O+"
                                                        value={transparencyForm.donorData?.bloodGroup || ''}
                                                        onChange={(e) => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, bloodGroup: e.target.value } }))}
                                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Genetic Screening</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. All clear, Carrier for X"
                                                    value={transparencyForm.donorData?.geneticScreening || ''}
                                                    onChange={(e) => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, geneticScreening: e.target.value } }))}
                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Match Score (%)</label>
                                                    <input
                                                        type="number"
                                                        value={transparencyForm.donorData?.matchingScore || 0}
                                                        onChange={(e) => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, matchingScore: parseInt(e.target.value) } }))}
                                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Donor Type</label>
                                                    <select
                                                        value={transparencyForm.donorData?.type || 'Sperm'}
                                                        onChange={(e) => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, type: e.target.value } }))}
                                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    >
                                                        <option value="Sperm">Sperm</option>
                                                        <option value="Egg">Egg</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Doctor Notes</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Enter clinical observations..."
                                                    value={transparencyForm.donorData?.doctorNotes || ''}
                                                    onChange={(e) => setTransparencyForm(prev => ({ ...prev, donorData: { ...prev.donorData, doctorNotes: e.target.value } }))}
                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                                ></textarea>
                                            </div>

                                            <button
                                                onClick={() => handleSaveTransparency('donor')}
                                                disabled={isSavingTransparency}
                                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                {isSavingTransparency ? 'Synchronizing...' : 'Save Donor Data'}
                                            </button>
                                        </div>

                                        {/* Surrogate Management */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                                                        <Heart size={16} />
                                                    </div>
                                                    Surrogate Profile
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Published</span>
                                                    <button
                                                        onClick={() => setTransparencyForm(prev => ({ ...prev, surrogateData: { ...prev.surrogateData, isPublished: !prev.surrogateData.isPublished } }))}
                                                        className={`w-10 h-5 rounded-full transition-all relative ${transparencyForm.surrogateData?.isPublished ? 'bg-teal-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${transparencyForm.surrogateData?.isPublished ? 'right-1' : 'left-1'}`}></div>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Age Range</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 21-28"
                                                        value={transparencyForm.surrogateData?.ageRange || ''}
                                                        onChange={(e) => setTransparencyForm(prev => ({ ...prev, surrogateData: { ...prev.surrogateData, ageRange: e.target.value } }))}
                                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Blood Group</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. B+"
                                                        value={transparencyForm.surrogateData?.bloodGroup || ''}
                                                        onChange={(e) => setTransparencyForm(prev => ({ ...prev, surrogateData: { ...prev.surrogateData, bloodGroup: e.target.value } }))}
                                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Infectious Disease Clearance</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. All screenings negative"
                                                    value={transparencyForm.surrogateData?.infectiousDiseaseClearance || ''}
                                                    onChange={(e) => setTransparencyForm(prev => ({ ...prev, surrogateData: { ...prev.surrogateData, infectiousDiseaseClearance: e.target.value } }))}
                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Medical Fitness</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Excellent reproductive health"
                                                    value={transparencyForm.surrogateData?.medicalFitness || ''}
                                                    onChange={(e) => setTransparencyForm(prev => ({ ...prev, surrogateData: { ...prev.surrogateData, medicalFitness: e.target.value } }))}
                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Doctor Notes</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Enter clinical observations..."
                                                    value={transparencyForm.surrogateData?.doctorNotes || ''}
                                                    onChange={(e) => setTransparencyForm(prev => ({ ...prev, surrogateData: { ...prev.surrogateData, doctorNotes: e.target.value } }))}
                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 outline-none resize-none"
                                                ></textarea>
                                            </div>

                                            <button
                                                onClick={() => handleSaveTransparency('surrogate')}
                                                disabled={isSavingTransparency}
                                                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                {isSavingTransparency ? 'Synchronizing...' : 'Save Surrogate Data'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                    {showTimelineModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/20 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-white"
                            >
                                <div className="p-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Manage Treatment Timeline</h2>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                                                Assign Optimized Paths for {selectedPatientData?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowTimelineModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-4">
                                    {timelineTemplates.length > 0 ? (
                                        timelineTemplates.map((template) => (
                                            <div key={template._id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all">
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-lg tracking-tight">{template.name}</h4>
                                                    <p className="text-xs text-slate-400 font-medium italic">{template.phases.length} Phases • Optimized for {template.name.split(' ')[0]}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignTimeline(template._id)}
                                                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                                >
                                                    Assign Path
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-400 italic">No templates found. Please create one in the database.</div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                    {showPostDeliveryModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-orange-900/20 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-white"
                            >
                                <div className="p-6 border-b border-orange-50 flex justify-between items-center bg-orange-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg">
                                            <Baby size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Activate Post-Delivery</h2>
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">
                                                Finalize Care for {selectedPatientData?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPostDeliveryModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                        <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                                        <p className="text-[10px] text-amber-800 font-bold leading-relaxed italic">
                                            Activating this mode will switch the patient's dashboard to Newborn Care Guidance. This action is typically performed after successful delivery.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Delivery Date</label>
                                        <input
                                            type="date"
                                            value={activationDeliveryDate}
                                            onChange={(e) => setActivationDeliveryDate(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 focus:bg-white outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                    <button
                                        onClick={handleActivatePostDelivery}
                                        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                                    >
                                        Confirm & Activate Care
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {showExpenseModal && selectedPatientForExpense && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900/20 backdrop-blur-md p-4"
                        >
                            <AdminExpenseManager
                                patientId={selectedPatientForExpense.id}
                                patientName={selectedPatientForExpense.name}
                                onClose={() => setShowExpenseModal(false)}
                            />
                        </motion.div>
                    )}

                    {showEscalationModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-rose-900/20 backdrop-blur-md p-4"
                        >
                            <EscalationAlerts
                                doctorId={profile._id}
                                onClose={() => setShowEscalationModal(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default DoctorDashboard;
