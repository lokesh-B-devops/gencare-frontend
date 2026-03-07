import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Activity,
    Heart,
    MessageCircle,
    FileText,
    Phone,
    AlertCircle,
    ChevronRight,
    Bell,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Upload,
    Sparkles,
    Stethoscope,
    CreditCard,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveRobot from '../components/InteractiveRobot';
import Timeline from '../components/Timeline';
import StressModeBanner from '../components/StressModeBanner';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SchedulingCalendar from '../components/Calendar/SchedulingCalendar';
import HealthProfileForm from '../components/Patient/HealthProfileForm';
import PostDeliveryModule from '../components/Patient/PostDeliveryModule';
import SurrogacyExpenseDashboard from '../components/Patient/SurrogacyExpenseDashboard';
import NotificationSettings from '../components/Patient/NotificationSettings';
import MedicationEducation from '../components/Patient/MedicationEducation';
import useNetworkStatus from '../hooks/useNetworkStatus';
import { offlineDB } from '../utils/db';
import { syncManager } from '../services/syncManager';
import EmbryoTransferCounseling from '../components/Patient/EmbryoTransferCounseling';

const DEMO_MEDICATIONS = [
    { name: "Gonal-F (rFSH)", dosage: "225 IU", time: "09:00 AM" },
    { name: "Cetrotide", dosage: "0.25 mg", time: "08:30 AM" },
    { name: "Menopur", dosage: "75 IU", time: "07:00 PM" }
];

const MED_INFO = {
    'Gonal-F': {
        use: "Follicle stimulation",
        how: "Contains FSH (follicle-stimulating hormone) which mimics your body's natural hormones to encourage the ovaries to produce multiple eggs instead of just one.",
        tips: "Keep refrigerated. Use a new needle each time. Rotate injection sites around the belly button."
    },
    'Menopur': {
        use: "Egg development support",
        how: "Provides both FSH and LH (luteinizing hormone). It works alongside other meds to help the follicles reach the right size and maturity level.",
        tips: "Mix gently; do not shake. You might feel a slight sting—this is normal and passes quickly."
    },
    'Cetrotide': {
        use: "Prevents early ovulation",
        how: "Blocks the hormone that would normally cause you to release eggs early. This ensures the eggs stay in the follicles until the doctor is ready to retrieve them.",
        tips: "A small red bump at the injection site is very common and usually fades within an hour."
    },
    'Ganirelix': {
        use: "Prevents early ovulation",
        how: "Works as a GnRH antagonist to prevent a premature LH surge, giving the doctor control over the exact timing of your egg retrieval.",
        tips: "Wipe the needle tip before injecting to reduce skin irritation."
    },
    'Ovidrel': {
        use: "The 'Trigger' Shot",
        how: "Mimics a natural LH surge to induce final maturation of the eggs. It sets a 36-hour countdown for the egg retrieval procedure.",
        tips: "Timing is critical! Take this at the exact minute instructed by your care team."
    },
    'Progesterone': {
        use: "Uterine lining support",
        how: "Prepares the lining of the uterus for an embryo to implant and helps sustain an early pregnancy by mimicking natural hormone levels.",
        tips: "If using oil injections, warming the vial in your hands first can make the process smoother."
    },
    'Estradiol': {
        use: "Estrogen support",
        how: "Helps thicken the uterine lining and maintains the hormonal balance required for a successful embryo transfer.",
        tips: "Take with food if you experience mild nausea."
    }
};

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [adherenceData, setAdherenceData] = React.useState(null);
    const [isLogging, setIsLogging] = React.useState(false);
    const [reports, setReports] = React.useState([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadResult, setUploadResult] = React.useState(null);
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const [showSymptomModal, setShowSymptomModal] = React.useState(false);
    const [isAnalyzingSymptom, setIsAnalyzingSymptom] = React.useState(false);
    const [symptomDescription, setSymptomDescription] = React.useState("");
    const [symptomPhoto, setSymptomPhoto] = React.useState(null);
    const [symptomAnalysisResult, setSymptomAnalysisResult] = React.useState(null);
    const [dueMedications, setDueMedications] = React.useState([]);
    const [activeMedInfo, setActiveMedInfo] = React.useState(null);
    const [timeLeft, setTimeLeft] = React.useState(43129); // 11:58:49 in seconds

    // Countdown Timer Logic
    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const [showCostDashboard, setShowCostDashboard] = React.useState(false);
    const [showCalendarModal, setShowCalendarModal] = React.useState(false);
    const [showHealthForm, setShowHealthForm] = React.useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = React.useState(false);
    const [transparencyData, setTransparencyData] = React.useState({ donor: null, surrogate: null });
    const [postDeliveryData, setPostDeliveryData] = React.useState(null);
    const [surrogacyExpenses, setSurrogacyExpenses] = React.useState([]);
    const { isOnline } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = React.useState(false);

    const fileInputRef = React.useRef(null);
    const symptomPhotoRef = React.useRef(null);

    React.useEffect(() => {
        // Request Notification Permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [profileRes, adherenceRes, reportsRes] = await Promise.all([
                    fetch('/api/dashboard/patient', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/adherence/summary', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/medical/reports', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/transparency/patient', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                let profileData = null;
                if (profileRes.ok) {
                    profileData = await profileRes.json();
                    setProfile(profileData);
                }

                if (adherenceRes.ok) {
                    const data = await adherenceRes.json();
                    setAdherenceData(data);
                }

                if (reportsRes.ok) {
                    const data = await reportsRes.json();
                    setReports(data);
                }

                const transparencyRes = await (await Promise.allSettled([
                    fetch('/api/transparency/patient', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                ]))[0];

                if (transparencyRes.status === 'fulfilled' && transparencyRes.value.ok) {
                    const data = await transparencyRes.value.json();
                    setTransparencyData(data);
                }

                // Cache to Offline DB
                if (profileData) {
                    await offlineDB.saveMedications(profileData.ivfDetails?.medications || []);
                    // Cache MED_INFO if available? In this app it's hardcoded in some places, 
                    // but we can cache what we have.
                }

                // Fetch Post Delivery Data if profile has it active
                if (profileData?.postDeliveryMode) {
                    const postDeliveryRes = await fetch('/api/post-delivery/patient-data', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (postDeliveryRes.ok) {
                        const postData = await postDeliveryRes.json();
                        setPostDeliveryData(postData);
                    }
                }

                // Fetch Surrogacy Expenses if applicable
                if (profileData?.hasSurrogateInvolvement) {
                    const expenseRes = await fetch('/api/surrogacy/patient-expenses', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (expenseRes.ok) {
                        const expenseData = await expenseRes.json();
                        setSurrogacyExpenses(expenseData);
                    }
                }
            } catch (err) {
                console.error(err);
                // Fallback to Offline DB
                if (!isOnline) {
                    const cachedMeds = await offlineDB.getMedications();
                    if (cachedMeds.length > 0) {
                        setProfile(prev => ({
                            ...prev,
                            ivfDetails: { ...prev?.ivfDetails, medications: cachedMeds }
                        }));
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        if (isOnline) {
            fetchDashboardData();
        } else {
            // Load from cache immediately if offline
            offlineDB.getMedications().then(cachedMeds => {
                if (cachedMeds.length > 0) {
                    setProfile(prev => ({
                        ...prev,
                        ivfDetails: { ...prev?.ivfDetails, medications: cachedMeds }
                    }));
                }
                setLoading(false);
            });
        }
    }, [isOnline]);

    // Handle Sync when coming back online
    React.useEffect(() => {
        if (isOnline) {
            const handleSync = async () => {
                setIsSyncing(true);
                await syncManager.syncPendingLogs();
                setIsSyncing(false);
            };
            handleSync();
        }
    }, [isOnline]);

    // Medication Notification Scheduler
    React.useEffect(() => {
        if (!profile?.ivfDetails?.medications) return;

        const checkMedications = () => {
            const now = new Date();
            const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            profile.ivfDetails.medications.forEach(med => {
                // Check if med time matches current time
                if (med.time === currentTimeStr) {
                    // Avoid duplicate notifications in the same minute
                    const medKey = `${med.name}-${currentTimeStr}`;
                    const notifiedMeds = JSON.parse(sessionStorage.getItem('notifiedMeds') || '[]');

                    if (!notifiedMeds.includes(medKey)) {
                        // Desktop Notification
                        if (Notification.permission === "granted") {
                            new Notification("Medication Reminder", {
                                body: `It's time to take your ${med.name} (${med.dosage}).`,
                                icon: "/vite.svg"
                            });
                        }

                        // Add to due medications state for UI banner
                        setDueMedications(prev => {
                            if (!prev.find(m => m.name === med.name)) {
                                return [...prev, med];
                            }
                            return prev;
                        });

                        // Mark as notified for this minute
                        notifiedMeds.push(medKey);
                        sessionStorage.setItem('notifiedMeds', JSON.stringify(notifiedMeds));
                    }
                }
            });
        };

        const interval = setInterval(checkMedications, 60000); // Check every minute
        checkMedications(); // Initial check

        return () => clearInterval(interval);
    }, [profile]);

    // Click-away listener for notification dropdown
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!profile) return <div className="p-8">Access Denied. Please log in.</div>;

    // Map API data to UI
    const patientName = "Sarah Jenkins"; // In real app, fetch from user relation
    const currentStage = profile.ivfDetails?.stage || "Unknown Stage";

    const medications = profile.ivfDetails?.medications?.length > 0
        ? profile.ivfDetails.medications
        : DEMO_MEDICATIONS;

    const appointment = {
        title: "Ultrasound Scan",
        date: "Tomorrow, 09:30 AM",
        doctor: profile.assignedDoctor?.name || "Dr. Assigned"
    };

    const timelineSteps = [
        { label: "Consultation", status: "completed" },
        { label: "Stimulation", status: "active" },
        { label: "Egg Retrieval", status: "upcoming" },
        { label: "Fertilization", status: "upcoming" },
        { label: "Transfer", status: "upcoming" }
    ];

    const logMedication = async (medName, status) => {
        setIsLogging(true);
        const logData = { medName, status, actualTime: new Date().toISOString() };

        try {
            if (!isOnline) {
                await offlineDB.addPendingLog(logData);
                // Update local UI immediately
                setAdherenceData(prev => {
                    if (!prev) return null;
                    const newScore = Math.max(0, prev.currentScore - (status === 'missed' ? 15 : (status === 'late' ? 5 : 0)));
                    return { ...prev, currentScore: newScore };
                });
                return;
            }

            const token = localStorage.getItem('token');
            const res = await fetch('/api/adherence/log-medication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(logData)
            });
            if (res.ok) {
                // Refresh data
                const summaryRes = await fetch('/api/adherence/summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (summaryRes.ok) {
                    const data = await summaryRes.json();
                    setAdherenceData(data);
                }
            }
        } catch (err) {
            console.error(err);
            // Fallback to offline storage on error
            await offlineDB.addPendingLog(logData);
        } finally {
            setIsLogging(false);
        }
    };

    const handleSymptomSubmit = async (e) => {
        e.preventDefault();
        if (!symptomDescription) return;

        setIsAnalyzingSymptom(true);
        const formData = new FormData();
        formData.append('symptom', symptomDescription);
        formData.append('isAbnormal', true);
        if (symptomPhoto) {
            formData.append('photo', symptomPhoto);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/adherence/log-symptom', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSymptomAnalysisResult(data.analysis);
                // Refresh adherence data
                const summaryRes = await fetch('/api/adherence/summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (summaryRes.ok) {
                    const data = await summaryRes.json();
                    setAdherenceData(data);
                }
            } else {
                alert("Failed to log symptom. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while logging the symptom.");
        } finally {
            setIsAnalyzingSymptom(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setShowUploadModal(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('report', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/medical/upload-report', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setUploadResult(data.report);
                // Refresh list
                const listRes = await fetch('/api/medical/reports', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (listRes.ok) {
                    const listData = await listRes.json();
                    setReports(listData);
                }
            } else {
                alert("Upload failed. Please try again.");
                setShowUploadModal(false);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during upload.");
            setShowUploadModal(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaySurrogacyExpense = async (expenseId, method) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/surrogacy/initiate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ expenseId, method })
            });
            if (res.ok) {
                // Refresh expenses
                const expenseRes = await fetch('/api/surrogacy/patient-expenses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (expenseRes.ok) {
                    const expenseData = await expenseRes.json();
                    setSurrogacyExpenses(expenseData);
                }
            }
        } catch (err) {
            console.error('Payment error:', err);
        }
    };

    const handleToggleChecklist = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/post-delivery/toggle-checklist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ itemId })
            });
            if (res.ok) {
                const updatedData = await res.json();
                setPostDeliveryData(updatedData);
            }
        } catch (err) {
            console.error('Error toggling checklist:', err);
        }
    };

    return (
        <div className="min-h-screen nurture-gradient font-sans text-slate-800 mobile-bottom-spacing">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="responsive-container"
            >
                <main className="py-6 space-y-8 px-4 sm:px-6">
                    {profile.postDeliveryMode && postDeliveryData ? (
                        <PostDeliveryModule
                            data={postDeliveryData}
                            onToggleChecklist={handleToggleChecklist}
                        />
                    ) : (
                        <>
                            {/* Original IVF Dashboard Content */}

                            {/* Medication Due Alerts */}
                            {!isOnline && (
                                <div className="bg-amber-500 text-white px-4 py-2 rounded-2xl flex items-center justify-between mb-4 shadow-lg animate-pulse">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={18} />
                                        <span className="text-sm font-bold tracking-tight">Offline Mode Active – using last synced data</span>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-lg">Status: Local</div>
                                </div>
                            )}

                            {isSyncing && (
                                <div className="bg-teal-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 mb-4 shadow-lg">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span className="text-sm font-bold tracking-tight">Syncing your progress...</span>
                                </div>
                            )}

                            {dueMedications.length > 0 && (
                                <div className="space-y-3">
                                    {dueMedications.map((med, idx) => (
                                        <div key={idx} className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex items-center justify-between animate-bounce">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-rose-900">Medication Due Now!</p>
                                                    <p className="text-sm text-rose-700">Please take {med.name} ({med.dosage})</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    logMedication(med.name, 'on-time');
                                                    setDueMedications(prev => prev.filter(m => m.name !== med.name));
                                                }}
                                                className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors"
                                            >
                                                Log as Taken
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stress Reduction Mode Banner */}
                            {profile.stressMode && (
                                <StressModeBanner
                                    phaseLabel={profile.timeline?.phase}
                                    countdownDays={14 - (profile.timeline?.currentDay % 14)} // Dummy countdown logic
                                    dosAndDonts={profile.timeline?.config?.phases?.find(p => p.label === profile.timeline?.phase)?.dosAndDonts}
                                />
                            )}

                            {/* Health Profile Completion Banner */}
                            {!profile.age && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 border border-white/20 relative overflow-hidden flex items-center justify-between"
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                                Complete Your Health Profile
                                            </h3>
                                            <p className="opacity-95 leading-relaxed font-medium text-sm">
                                                Providing your age, weight, and medical history helps our AI provide more accurate recommendations for your GENCARE journey.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowHealthForm(true)}
                                        className="relative z-10 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg"
                                    >
                                        Start Now
                                    </button>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
                                </motion.div>
                            )}

                            {/* AI Companion Message */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 border border-white/20 relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            Your AI Companion
                                        </h3>
                                        <p className="opacity-95 leading-relaxed font-medium">
                                            "You're doing great, {patientName.split(' ')[0]}! Day {profile.timeline?.currentDay || 1} is a significant milestone. Remember to stay hydrated and take some time for yourself tonight. Your body is doing amazing work."
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-300 opacity-20 rounded-full blur-xl -ml-10 -mb-10"></div>
                            </motion.div>

                            {/* Adherence & Risk Score Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="md:col-span-1 glass-card rounded-3xl p-6 shadow-xl shadow-rose-900/5 flex flex-col items-center justify-center text-center border-white/50"
                                >
                                    <div className="relative mb-4">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <defs>
                                                <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                </filter>
                                            </defs>
                                            <circle
                                                cx="64" cy="64" r="54"
                                                className="fill-none stroke-rose-50 stroke-[8]"
                                            />
                                            <motion.circle
                                                initial={{ strokeDashoffset: 340 }}
                                                animate={{ strokeDashoffset: 340 * (1 - ((adherenceData?.currentScore || 88) / 100)) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                cx="64" cy="64" r="54"
                                                strokeDasharray="340"
                                                filter="url(#gauge-glow)"
                                                className={`fill-none stroke-[10] stroke-round transition-all duration-1000 ${(adherenceData?.currentScore || 88) < 60 ? 'stroke-rose-400' :
                                                    (adherenceData?.currentScore || 88) < 85 ? 'stroke-amber-400' : 'stroke-teal-400'
                                                    }`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-slate-800 tracking-tighter">
                                                {adherenceData?.currentScore || 88}%
                                            </span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Score</span>
                                        </div>
                                    </div>
                                    <h4 className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-2">Care Adherence</h4>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${(adherenceData?.riskStatus || 'Low') === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                        (adherenceData?.riskStatus || 'Low') === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                            'bg-teal-50 border-teal-100 text-teal-600'
                                        }`}>
                                        {adherenceData?.riskStatus || 'Low'} Risk
                                        {!adherenceData && (
                                            <span className="ml-1 opacity-60 text-[8px] font-bold"> (Sample)</span>
                                        )}
                                    </span>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="md:col-span-3 glass-card rounded-3xl p-6 shadow-xl shadow-rose-900/5 border-white/50 relative overflow-hidden flex flex-col items-center"
                                >
                                    {/* BabySteps Branding Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-teal-50/30 -z-10"></div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                                    {/* Header Section */}
                                    <div className="w-full flex justify-between items-start mb-8 z-10">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="p-1.5 bg-rose-500 rounded-lg text-white">
                                                    <Sparkles size={14} fill="currentColor" />
                                                </div>
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">GENCARE</span>
                                            </div>
                                            <h3 className="text-sm font-black text-slate-800 tracking-tight">Treatment Overview</h3>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{patientName}</span>
                                            <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 mt-1">GENCARE Cycle 2026</span>
                                        </div>
                                    </div>

                                    {/* Center Visual Area */}
                                    <div className="relative w-full flex flex-col items-center justify-center py-6">
                                        <div className="relative">
                                            {/* Milestone Outer Circle */}
                                            <svg className="w-64 h-64 transform -rotate-90">
                                                <circle
                                                    cx="128" cy="128" r="110"
                                                    className="fill-none stroke-slate-100 stroke-[4]"
                                                />
                                                <motion.circle
                                                    initial={{ strokeDashoffset: 690 }}
                                                    animate={{ strokeDashoffset: 690 * (1 - 0.75) }} // Demo progression at 75%
                                                    transition={{ duration: 2, ease: "easeInOut" }}
                                                    cx="128" cy="128" r="110"
                                                    strokeDasharray="690"
                                                    className="fill-none stroke-rose-400 stroke-[8] stroke-round"
                                                />
                                            </svg>

                                            {/* Center Cellular Visual */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.5, duration: 1 }}
                                                    className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl relative"
                                                >
                                                    <img
                                                        src="/embryo.png"
                                                        alt="Embryo Visual"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent"></div>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Milestone Info Overlay */}
                                        <div className="mt-8 text-center">
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-1">Next Milestone</p>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Egg Retrieval In</h2>
                                            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-2xl tracking-[0.2em] shadow-xl">
                                                {formatTime(timeLeft)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Info Cards (Mocking image layout) */}
                                    <div className="w-full grid grid-cols-2 gap-4 mt-8 z-10">
                                        <div className="bg-white/40 p-4 rounded-3xl border border-white/60">
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Period Start</p>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
                                                    <Calendar size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 uppercase">02 Sep, 2025</span>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-50/40 p-4 rounded-3xl border border-indigo-100/60">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">First Injection</p>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg">
                                                    <Clock size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 uppercase">03 Sep, 2025</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Donor & Surrogate Transparency Section */}
                            {(transparencyData.donor || transparencyData.surrogate) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card rounded-3xl p-6 shadow-xl shadow-rose-900/5 border-white/50"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                                <Users size={18} />
                                            </div>
                                            Donor & Surrogate Transparency
                                        </h3>
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                            Anonymized Data
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {transparencyData.donor && (
                                            <div className="bg-white/40 rounded-2xl p-5 border border-white/60 relative overflow-hidden group hover:bg-white hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                                        <Sparkles size={16} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">Donor Details ({transparencyData.donor.type})</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Medical & Eligibility Screening</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-slate-50/50 p-2 rounded-xl">
                                                            <p className="text-[9px] font-black uppercase text-slate-400">Age Range</p>
                                                            <p className="font-bold text-slate-700">{transparencyData.donor.ageRange}</p>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-2 rounded-xl">
                                                            <p className="text-[9px] font-black uppercase text-slate-400">Blood Group</p>
                                                            <p className="font-bold text-slate-700">{transparencyData.donor.bloodGroup}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50/50 p-2 rounded-xl">
                                                        <p className="text-[9px] font-black uppercase text-slate-400">Genetic Screening</p>
                                                        <p className="text-xs font-bold text-slate-700">{transparencyData.donor.geneticScreening}</p>
                                                    </div>
                                                    <div className="bg-slate-50/50 p-2 rounded-xl">
                                                        <p className="text-[9px] font-black uppercase text-slate-400">Medical Fitness</p>
                                                        <p className="text-xs font-bold text-slate-700">{transparencyData.donor.medicalFitness}</p>
                                                    </div>
                                                    <div className="bg-teal-50/50 p-2 rounded-xl border border-teal-100">
                                                        <p className="text-[9px] font-black uppercase text-teal-600">Matching Score</p>
                                                        <p className="font-black text-teal-700 text-lg">{transparencyData.donor.matchingScore}%</p>
                                                    </div>
                                                </div>

                                                {transparencyData.donor.doctorNotes && (
                                                    <div className="mt-4 p-3 bg-indigo-50/30 rounded-xl border border-indigo-50">
                                                        <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">Doctor's Clinical Note</p>
                                                        <p className="text-xs text-slate-600 italic">"{transparencyData.donor.doctorNotes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {transparencyData.surrogate && (
                                            <div className="bg-white/40 rounded-2xl p-5 border border-white/60 relative overflow-hidden group hover:bg-white hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                                                        <Heart size={16} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">Surrogate Details</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Screening & Compatibility</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-slate-50/50 p-2 rounded-xl">
                                                            <p className="text-[9px] font-black uppercase text-slate-400">Age Range</p>
                                                            <p className="font-bold text-slate-700">{transparencyData.surrogate.ageRange}</p>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-2 rounded-xl">
                                                            <p className="text-[9px] font-black uppercase text-slate-400">Blood Group</p>
                                                            <p className="font-bold text-slate-700">{transparencyData.surrogate.bloodGroup}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50/50 p-2 rounded-xl">
                                                        <p className="text-[9px] font-black uppercase text-slate-400">Medical Fitness</p>
                                                        <p className="text-xs font-bold text-slate-700">{transparencyData.surrogate.medicalFitness}</p>
                                                    </div>
                                                    <div className="bg-slate-50/50 p-2 rounded-xl">
                                                        <p className="text-[9px] font-black uppercase text-slate-400">Infectious Disease Clearance</p>
                                                        <p className="text-xs font-bold text-slate-700">{transparencyData.surrogate.infectiousDiseaseClearance}</p>
                                                    </div>
                                                    <div className="bg-teal-50/50 p-2 rounded-xl border border-teal-100">
                                                        <p className="text-[9px] font-black uppercase text-teal-600">Compatibility Score</p>
                                                        <p className="font-black text-teal-700 text-lg">{transparencyData.surrogate.matchingScore}%</p>
                                                    </div>
                                                </div>

                                                {transparencyData.surrogate.doctorNotes && (
                                                    <div className="mt-4 p-3 bg-rose-50/30 rounded-xl border border-rose-50">
                                                        <p className="text-[9px] font-black uppercase text-rose-400 mb-1">Doctor's Clinical Note</p>
                                                        <p className="text-xs text-slate-600 italic">"{transparencyData.surrogate.doctorNotes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">
                                            <AlertCircle size={12} className="inline mr-1 mb-0.5" />
                                            This information is strictly anonymized in compliance with ethical GENCARE and surrogacy guidelines. No personal identifying information (name, address, or contact details) is revealed. This data is for medical and matching purposes only.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Left Column: Schedule & Overview */}
                                <div className="md:col-span-2 space-y-6">

                                    {/* Embryo Transfer Counseling */}
                                    <EmbryoTransferCounseling patientId={profile._id || profile.id} />

                                    {/* Timeline */}
                                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="font-bold text-lg flex items-center gap-2">
                                                <Activity size={20} className="text-indigo-500" />
                                                Your GENCARE Timeline
                                                {!(profile.timeline?.config?.phases) && (
                                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 font-black uppercase tracking-widest">
                                                        Sample Journey
                                                    </span>
                                                )}
                                            </h2>
                                            <div className="hidden sm:block">
                                                <InteractiveRobot name={patientName} medications={medications} />
                                            </div>
                                        </div>

                                        {profile.timeline?.config?.phases ? (
                                            <Timeline
                                                currentDay={profile.timeline.currentDay}
                                                currentPhase={profile.timeline.phase}
                                                phases={profile.timeline.config.phases}
                                            />
                                        ) : (
                                            <Timeline
                                                currentDay={12}
                                                currentPhase="Stimulation"
                                                phases={[
                                                    { label: "Consultation", advice: "Initial diagnostic review and treatment planning." },
                                                    { label: "Stimulation", advice: "Ovarian stimulation focused on developing multiple follicles." },
                                                    { label: "Egg Retrieval", advice: "Surgical collection of mature eggs from follicles." },
                                                    { label: "Fertilization", advice: "Laboratory fertilization of eggs with sperm (IVF/ICSI)." },
                                                    { label: "Transfer", advice: "Placement of viable embryo into the uterus." }
                                                ]}
                                            />
                                        )}
                                    </section>

                                    {/* Health Snapshot */}
                                    {profile.age && (
                                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                                                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                                                    <Activity size={18} />
                                                </div>
                                                Health Snapshot
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-xl">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Age</p>
                                                    <p className="text-lg font-black text-slate-700">{profile.age} yrs</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">BMI</p>
                                                    <p className="text-lg font-black text-slate-700">
                                                        {profile.height && profile.weight
                                                            ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Conditions</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {profile.pastMedicalConditions?.slice(0, 2).map((c, i) => (
                                                            <span key={i} className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{c}</span>
                                                        )) || <span className="text-[10px] font-bold text-slate-400">Regular</span>}
                                                        {profile.pastMedicalConditions?.length > 2 && (
                                                            <span className="text-[10px] font-bold text-slate-400">+{profile.pastMedicalConditions.length - 2} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* Today's Overview */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Medications */}
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <Sparkles size={40} className="text-teal-500" />
                                            </div>
                                            <div className="flex justify-between items-center mb-4 relative z-10">
                                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                                    <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                                                        <Clock size={18} />
                                                    </div>
                                                    Medication Reminders
                                                </h3>
                                                <div className="flex gap-2">
                                                    {!(profile.ivfDetails?.medications?.length > 0) && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">Sample Schedule</span>
                                                    )}
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 px-3 py-1 rounded-full border border-teal-100">Daily Care</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 relative z-10">
                                                {medications.length > 0 ? medications.map((med, idx) => {
                                                    const info = Object.entries(MED_INFO).find(([key]) => med.name.includes(key))?.[1];
                                                    return (
                                                        <div key={idx} className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-teal-100">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center">
                                                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-teal-500 shadow-sm border border-slate-100 mr-3 group-hover:bg-teal-50 group-hover:scale-110 transition-all">
                                                                        <Heart size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800">{med.name}</p>
                                                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{med.dosage} • {med.time}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => logMedication(med.name, 'on-time')}
                                                                        disabled={isLogging}
                                                                        className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all shadow-sm hover:shadow-md" title="Log On-time"
                                                                    >
                                                                        <CheckCircle2 size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => logMedication(med.name, 'missed')}
                                                                        disabled={isLogging}
                                                                        className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-all shadow-sm hover:shadow-md" title="Log Missed"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <MedicationEducation
                                                                medName={med.name}
                                                                dosage={med.dosage}
                                                                stage={currentStage}
                                                            />
                                                        </div>
                                                    );
                                                }) : (
                                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                        <p className="text-xs text-slate-400 font-medium italic">No medications scheduled for today.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Appointment Booking Modal Trigger */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowCalendarModal(true)}
                                            className="fixed bottom-8 right-8 z-[100] p-5 bg-rose-500 text-white rounded-[2rem] shadow-2xl shadow-rose-900/40 border-4 border-white/20 backdrop-blur-md flex items-center justify-center group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Calendar size={28} strokeWidth={2.5} className="relative z-10" />
                                            <motion.span
                                                initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                                                whileHover={{ width: 'auto', opacity: 1, marginLeft: 12 }}
                                                className="text-sm font-black uppercase tracking-widest whitespace-nowrap pointer-events-none"
                                            >
                                                Care Calendar
                                            </motion.span>
                                        </motion.button>

                                        {/* Appointments Calendar Modal */}
                                        <AnimatePresence>
                                            {showCalendarModal && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-[150] bg-rose-950/20 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
                                                    onClick={() => setShowCalendarModal(false)}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.9, y: 40, opacity: 0 }}
                                                        animate={{ scale: 1, y: 0, opacity: 1 }}
                                                        exit={{ scale: 0.9, y: 40, opacity: 0 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-white/95 rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-white relative"
                                                    >
                                                        <button
                                                            onClick={() => setShowCalendarModal(false)}
                                                            className="absolute top-6 right-6 z-10 p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors shadow-sm"
                                                        >
                                                            <XCircle size={24} />
                                                        </button>

                                                        <div className="p-8 sm:p-12">
                                                            <div className="mb-8">
                                                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
                                                                    <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
                                                                        <Calendar size={32} />
                                                                    </div>
                                                                    Care Scheduling
                                                                </h2>
                                                                <p className="mt-3 text-slate-500 font-medium max-w-xl">
                                                                    Plan your appointments, procedures, and scans. Our GENCARE specialists are here to guide your journey.
                                                                </p>
                                                            </div>

                                                            <SchedulingCalendar role="patient" doctorId={profile.assignedDoctor?._id} />
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Health Profile Modal */}
                                        <AnimatePresence>
                                            {showHealthForm && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-[160] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
                                                    onClick={() => setShowHealthForm(false)}
                                                >
                                                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem]">
                                                        <HealthProfileForm
                                                            initialData={profile}
                                                            onSave={(updatedProfile) => {
                                                                setProfile(prev => ({ ...prev, ...updatedProfile }));
                                                                setTimeout(() => setShowHealthForm(false), 1500);
                                                            }}
                                                            onCancel={() => setShowHealthForm(false)}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Upcoming Appointment */}
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                                    <Calendar size={18} className="text-violet-500" />
                                                    Up Next
                                                </h3>
                                            </div>
                                            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100 h-full">
                                                <p className="text-sm font-bold text-violet-900 mb-1">{appointment.title}</p>
                                                <p className="text-xs text-violet-700 mb-3">{appointment.date}</p>
                                                <div className="flex items-center gap-2 text-xs text-violet-600">
                                                    <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center">D</div>
                                                    {appointment.doctor}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {profile.postDeliveryMode && postDeliveryData && (
                                        <PostDeliveryModule
                                            data={postDeliveryData}
                                            onToggleChecklist={handleToggleChecklist}
                                        />
                                    )}

                                    {/* Cost & Transparency Dashboard */}
                                    <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                                <TrendingUp size={18} className="text-emerald-500" />
                                                Cost Transparency
                                            </h3>
                                            <button
                                                onClick={() => setShowCostDashboard(!showCostDashboard)}
                                                className="text-xs font-bold text-indigo-600 hover:underline"
                                            >
                                                {showCostDashboard ? 'Show Less' : 'View Details'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Paid</p>
                                                <p className="text-xl font-black text-emerald-900">$4,250</p>
                                            </div>
                                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Pending</p>
                                                <p className="text-xl font-black text-amber-900">$1,800</p>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showCostDashboard && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 space-y-2 pt-4 border-t border-slate-50">
                                                        {profile.payments?.map((payment, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-sm py-1">
                                                                <span className="text-slate-600 font-medium">{payment.category}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-bold text-slate-800">${payment.amount}</span>
                                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                        {payment.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )) || <p className="text-xs text-slate-400 italic">No detailed records found.</p>}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </section>

                                    {profile.hasSurrogateInvolvement && (
                                        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-indigo-50/50">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                                        <CreditCard size={20} className="text-indigo-600" />
                                                        Surrogacy Ledger
                                                    </h3>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                                                        Secure Escrow Management
                                                    </p>
                                                </div>
                                            </div>
                                            <SurrogacyExpenseDashboard
                                                expenses={surrogacyExpenses}
                                                onPay={handlePaySurrogacyExpense}
                                            />
                                        </section>
                                    )}
                                </div>

                                {/* Right Column: Actions & Alerts */}
                                <div className="space-y-6">

                                    {/* Quick Actions */}
                                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                        <h2 className="font-bold text-slate-800 mb-4">Quick Actions</h2>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md hover:border-indigo-100 border border-transparent transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <span className="font-medium text-slate-700">Upload Report</span>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                            />

                                            <button
                                                onClick={() => setShowHealthForm(true)}
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md hover:border-indigo-100 border border-transparent transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        <Stethoscope size={20} />
                                                    </div>
                                                    <span className="font-medium text-slate-700">Update Health Profile</span>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500" />
                                            </button>

                                            <button
                                                onClick={() => window.location.href = '/communication'}
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md hover:border-indigo-100 border border-transparent transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        <MessageCircle size={20} />
                                                    </div>
                                                    <span className="font-medium text-slate-700">Contact Doctor (Video Call)</span>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSymptomAnalysisResult(null);
                                                    setSymptomDescription("");
                                                    setSymptomPhoto(null);
                                                    setShowSymptomModal(true);
                                                }}
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-orange-50 hover:bg-white hover:shadow-md hover:border-orange-100 border border-transparent transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-orange-100 text-orange-600 p-2 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <span className="font-medium text-slate-700">Report Abnormal Symptom</span>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500" />
                                            </button>
                                        </div>
                                    </section>

                                    {/* Recent Reports */}
                                    {reports.length > 0 && (
                                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <FileText size={18} className="text-blue-500" />
                                                Recent Reports
                                            </h2>
                                            <div className="space-y-3">
                                                {reports.slice(0, 3).map((report, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => { setUploadResult(report); setShowUploadModal(true); }}
                                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                                <FileText size={16} />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-sm font-semibold text-slate-700 truncate">{report.originalName}</p>
                                                                <p className="text-[10px] text-slate-400">
                                                                    {new Date(report.uploadedAt).toLocaleDateString()} • {report.aiAnalysis?.summary?.substring(0, 30)}...
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Alerts Panel */}
                                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Bell size={18} className="text-amber-500" /> Notifcations
                                        </h2>
                                        <div className="space-y-3">
                                            <div className="flex gap-3 items-start p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-amber-900">Hydration Alert</p>
                                                    <p className="text-xs text-amber-700 mt-1">Don't forget to drink 2L of water today.</p>
                                                </div>
                                            </div>
                                            {adherenceData?.currentScore < 60 && (
                                                <div className="flex gap-3 items-start p-3 bg-rose-50 rounded-xl border border-rose-100 animate-pulse">
                                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-rose-900">Critical: Adherence Score Low</p>
                                                        <p className="text-xs text-rose-700 mt-1">Your adherence has dropped below 60%. Please contact your doctor immediately for guidance.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>


                                    {/* SOS Button */}
                                    <button
                                        onClick={() => {
                                            // In a real app, this might fetch the assistant ID dynamically
                                            // For now we use the one we usually find
                                            navigate('/communication', { state: { openAssistant: true } });
                                        }}
                                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold py-4 rounded-2xl border-2 border-rose-200 border-dashed flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer group"
                                    >
                                        <Phone size={20} className="group-hover:animate-bounce" />
                                        SOS / Emergency GENCARE Chat
                                    </button>
                                    <p className="text-center text-xs text-slate-400">
                                        In case of medical emergency, valid only in registered locations.
                                    </p>

                                </div>
                            </div>
                        </>
                    )}
                </main>
                {/* AI Analysis Modal */}
                {
                    showUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-800">Report Analysis</h2>
                                    <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                            <p className="text-slate-600 font-medium">Analyzing your report with AI...</p>
                                            <p className="text-slate-400 text-xs mt-2 italic">This may take a few seconds</p>
                                        </div>
                                    ) : uploadResult ? (
                                        <div className="space-y-6">
                                            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                                                <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                                                    <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                                                        <FileText size={18} />
                                                    </div>
                                                    {uploadResult.originalName}
                                                </h3>
                                                <p className="text-indigo-800 leading-relaxed italic font-medium">
                                                    "{uploadResult.aiAnalysis.summary}"
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <Activity size={18} className="text-teal-500" />
                                                    Key Findings
                                                </h4>
                                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-600 leading-relaxed">
                                                    {uploadResult.aiAnalysis.details.split('\n').map((line, i) => (
                                                        <p key={i} className="mb-2 last:mb-0">{line}</p>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                                    Recommendations
                                                </h4>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {uploadResult.aiAnalysis.recommendations.map((rec, i) => (
                                                        <li key={i} className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-sm font-medium flex items-start gap-3">
                                                            <span className="bg-emerald-200 text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                                                                {i + 1}
                                                            </span>
                                                            {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <button
                                                onClick={() => setShowUploadModal(false)}
                                                className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-900 transition-colors"
                                            >
                                                Got it, thanks!
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Symptom Report Modal */}
                {
                    showSymptomModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <AlertTriangle size={22} className="text-orange-500" />
                                        Report Symptom
                                    </h2>
                                    <button onClick={() => setShowSymptomModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    {!symptomAnalysisResult ? (
                                        <form onSubmit={handleSymptomSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">What's wrong? (Describe your symptom)</label>
                                                <textarea
                                                    value={symptomDescription}
                                                    onChange={(e) => setSymptomDescription(e.target.value)}
                                                    placeholder="e.g., Redness at the injection site, mild cramping..."
                                                    className="w-full rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 min-h-[120px] p-4 bg-slate-50"
                                                    required
                                                ></textarea>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Upload a Photo (Optional but recommended)</label>
                                                <div
                                                    onClick={() => symptomPhotoRef.current?.click()}
                                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50"
                                                >
                                                    {symptomPhoto ? (
                                                        <div className="text-center">
                                                            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                                                            <p className="text-sm font-semibold text-slate-700">{symptomPhoto.name}</p>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setSymptomPhoto(null); }}
                                                                className="text-xs text-rose-500 mt-2 font-bold"
                                                            >
                                                                Remove Photo
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <div className="bg-white p-3 rounded-xl shadow-sm inline-block mb-3 text-slate-400">
                                                                <FileText size={24} />
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-medium">Click to select photo or drag & drop</p>
                                                            <p className="text-xs text-slate-400 mt-1">JPEG, JPG, PNG (Max 5MB)</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={symptomPhotoRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => setSymptomPhoto(e.target.files[0])}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isAnalyzingSymptom}
                                                className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isAnalyzingSymptom ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Analyzing with AI...
                                                    </>
                                                ) : (
                                                    "Log Symptom & Get AI Analysis"
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                                                <h3 className="text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                                    Symptom Logged
                                                </h3>
                                                <p className="text-emerald-800 text-sm">
                                                    Your report of "{symptomDescription}" has been recorded for your doctor.
                                                    The adherence score has been updated to reflect this abnormal symptom.
                                                </p>
                                            </div>

                                            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                                                        <Activity size={20} />
                                                    </div>
                                                    <h4 className="font-bold text-indigo-900">AI Visual Analysis</h4>
                                                </div>

                                                <p className="text-indigo-900 font-bold italic mb-3">
                                                    "{symptomAnalysisResult.summary}"
                                                </p>

                                                <div className="text-indigo-800 text-sm leading-relaxed mb-6 bg-white/50 p-4 rounded-xl">
                                                    {symptomAnalysisResult.details}
                                                </div>

                                                <div className="space-y-3">
                                                    <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Recommendations</h5>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {symptomAnalysisResult.recommendations.map((rec, i) => (
                                                            <div key={i} className="flex items-start gap-3 bg-white/80 p-3 rounded-xl border border-indigo-50 text-sm text-indigo-900 font-medium">
                                                                <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                                                                    {i + 1}
                                                                </span>
                                                                {rec}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowSymptomModal(false)}
                                                className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-900 transition-colors"
                                            >
                                                Close & Back to Dashboard
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Notification Settings Modal */}
                {
                    showNotificationSettings && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-rose-900/20 backdrop-blur-md p-4">
                            <div className="max-w-4xl w-full">
                                <NotificationSettings onCancel={() => setShowNotificationSettings(false)} />
                            </div>
                        </div>
                    )
                }
            </motion.div>
        </div>
    );
};

export default PatientDashboard;
