import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

const SchedulingCalendar = ({ role, doctorId }) => {
    const [date, setDate] = useState(new Date());
    const [availability, setAvailability] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const fetchSchedulingData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            if (doctorId) {
                const availRes = await fetch(`/api/scheduling/availability/${doctorId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (availRes.ok) {
                    const availData = await availRes.json();
                    setAvailability(availData);
                }
            }

            const appRes = await fetch('/api/scheduling/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (appRes.ok) {
                const appData = await appRes.json();
                setAppointments(appData);
            }
        } catch (err) {
            console.error('Error fetching scheduling data:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSchedulingData();
    }, [doctorId]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };

    const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasAvailability = availability.some(a => isSameDay(new Date(a.date), date));
            const hasAppointment = appointments.some(a => isSameDay(new Date(a.date), date));

            if (hasAppointment) return 'has-appointment';
            if (hasAvailability) return 'has-availability';
        }
        return null;
    };

    const handleAddAvailability = async (e) => {
        e.preventDefault();
        const startTime = e.target.startTime.value;
        const endTime = e.target.endTime.value;

        try {
            const res = await fetch('/api/scheduling/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: format(date, 'yyyy-MM-dd'),
                    startTime,
                    endTime,
                    status: 'available'
                })
            });

            if (res.ok) {
                fetchSchedulingData();
                e.target.reset();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error('Error adding availability:', err);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        const type = e.target.type.value;
        const notes = e.target.notes.value;

        try {
            const res = await fetch('/api/scheduling/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctorId,
                    date: format(date, 'yyyy-MM-dd'),
                    time: selectedSlot.startTime,
                    appointmentType: type,
                    notes
                })
            });

            if (res.ok) {
                setShowBookingModal(false);
                fetchSchedulingData();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error('Error booking appointment:', err);
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/scheduling/appointments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchSchedulingData();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const dailySlots = availability.filter(a => isSameDay(new Date(a.date), date));
    const dailyAppointments = appointments.filter(a => isSameDay(new Date(a.date), date));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 p-0">
            {/* Calendar View */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 glass-card rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border-white/60 shadow-2xl shadow-rose-900/5"
            >
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-rose-50 text-rose-500 rounded-xl md:rounded-2xl shadow-inner">
                            <Clock size={20} className="md:w-[22px] md:h-[22px]" />
                        </div>
                        Journey Schedule
                    </h3>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm shadow-teal-100"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-100"></div>
                    </div>
                </div>

                <div className="calendar-container-premium">
                    <Calendar
                        onChange={handleDateChange}
                        value={date}
                        className="w-full border-none rounded-2xl md:rounded-3xl overflow-hidden custom-calendar-nurture"
                        tileClassName={getTileClassName}
                    />
                </div>

                <div className="mt-6 md:mt-8 flex gap-4 md:gap-6 justify-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-teal-400"></span>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-rose-500"></span>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Booked</span>
                    </div>
                </div>
            </motion.div>

            {/* Details & Actions View */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6"
            >
                <div className="glass-card rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border-white/60 shadow-xl shadow-rose-900/5 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6 md:mb-8">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 mb-1">Selected Date</p>
                            <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">
                                {format(date, 'MMMM d, yyyy')}
                            </h4>
                        </div>
                        <div className="bg-white/60 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-white shadow-sm">
                            <span className="text-[10px] md:text-xs font-bold text-slate-500">{dailySlots.length} Slots</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 md:space-y-8">
                        {/* Doctor View: Add Availability */}
                        {role === 'doctor' && (
                            <div className="bg-rose-50/30 rounded-2xl md:rounded-[2rem] p-4 md:p-6 border border-rose-100/50 shadow-inner">
                                <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-rose-400 mb-4 px-1">Set Availability</h5>
                                <form onSubmit={handleAddAvailability} className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <input name="startTime" type="time" required className="w-full pl-3 pr-2 py-3 rounded-xl md:rounded-2xl border-white bg-white/80 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all" />
                                        </div>
                                        <div className="relative">
                                            <input name="endTime" type="time" required className="w-full pl-3 pr-2 py-3 rounded-xl md:rounded-2xl border-white bg-white/80 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full sm:w-auto py-3 sm:py-0 sm:px-5 sm:aspect-square bg-rose-500 text-white rounded-xl md:rounded-2xl shadow-lg shadow-rose-200 flex items-center justify-center hover:bg-rose-600 hover:-translate-y-0.5 transition-all active:scale-95">
                                        <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                                        <span className="sm:hidden ml-2 font-black uppercase tracking-widest text-xs">Add Slot</span>
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Availability Section */}
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1 flex justify-between items-center">
                                    Open Slots
                                    {dailySlots.length > 0 && <span className="w-8 h-px bg-slate-100 italic ml-4 flex-1"></span>}
                                </h5>
                                {dailySlots.length === 0 && (
                                    <div className="bg-slate-50/50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 font-medium italic">No availability listed for this date.</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {dailySlots.map((slot, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -2 }}
                                            className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                                                <span className="text-sm font-bold text-slate-700">{slot.startTime} - {slot.endTime}</span>
                                            </div>
                                            {role === 'patient' && slot.status === 'available' && (
                                                <button
                                                    onClick={() => { setSelectedSlot(slot); setShowBookingModal(true); }}
                                                    className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95"
                                                >
                                                    Book
                                                </button>
                                            )}
                                            {role === 'doctor' && (
                                                <button
                                                    onClick={async () => {
                                                        await fetch(`/api/scheduling/availability/${slot._id}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        fetchSchedulingData();
                                                    }}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Appointments Section */}
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1 flex justify-between items-center">
                                    Booked Care
                                    {dailyAppointments.length > 0 && <span className="w-8 h-px bg-slate-100 italic ml-4 flex-1"></span>}
                                </h5>
                                {dailyAppointments.length === 0 && (
                                    <div className="bg-slate-50/50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 font-medium italic">No confirmed care sessions.</p>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {dailyAppointments.map((app, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ x: 4 }}
                                            className={`p-5 rounded-3xl border shadow-sm flex flex-col gap-3 transition-all ${app.status === 'confirmed' ? 'bg-teal-50/50 border-teal-100 text-teal-900' :
                                                app.status === 'pending' ? 'bg-rose-50/50 border-rose-100 text-rose-900' :
                                                    'bg-slate-50/50 border-slate-200 text-slate-400'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${app.status === 'confirmed' ? 'bg-teal-100' : 'bg-rose-100'}`}>
                                                        <Clock size={14} />
                                                    </div>
                                                    <span className="text-xs font-black tracking-tighter uppercase">{app.time}</span>
                                                </div>
                                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] ${app.status === 'confirmed' ? 'bg-teal-500/10 text-teal-600 border border-teal-200/50' :
                                                    app.status === 'pending' ? 'bg-rose-500/10 text-rose-600 border border-rose-200/50' :
                                                        'bg-slate-200 text-slate-500'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-black tracking-tight mb-0.5">
                                                        {role === 'doctor' ? `Patient: ${app.patient.name}` : `Consultation with ${app.doctor.name}`}
                                                    </p>
                                                    <p className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1.5">
                                                        <CheckCircle size={10} />
                                                        {app.appointmentType}
                                                    </p>
                                                </div>

                                                {role === 'doctor' && app.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateAppointmentStatus(app._id, 'confirmed')}
                                                            className="p-2.5 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-600 hover:-translate-y-0.5 transition-all"
                                                        >
                                                            <CheckCircle size={16} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppointmentStatus(app._id, 'cancelled')}
                                                            className="p-2.5 bg-rose-100 text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-200 hover:-translate-y-0.5 transition-all"
                                                        >
                                                            <XCircle size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-rose-900/10 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 30 }}
                            className="bg-white/95 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 max-w-md w-full shadow-2xl border border-white"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Plan Appointment</h3>
                                <button onClick={() => setShowBookingModal(false)} className="p-2 rounded-2xl hover:bg-rose-50 transition-colors">
                                    <XCircle className="text-rose-200 hover:text-rose-500 w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-rose-50/50 rounded-3xl p-6 mb-8 border border-rose-100 flex items-center gap-4">
                                <div className="bg-white p-3 rounded-2xl shadow-sm text-rose-500">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-0.5">Selected Slot</p>
                                    <p className="font-black text-slate-800 tracking-tight">{format(date, 'MMM d')} • {selectedSlot?.startTime}</p>
                                </div>
                            </div>

                            <form onSubmit={handleBookAppointment} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Appointment Type</label>
                                    <select name="type" className="w-full p-4 rounded-2xl border-rose-50 bg-rose-50/30 text-slate-700 font-bold text-sm shadow-inner focus:ring-2 focus:ring-rose-200 outline-none">
                                        <option value="consultation">General Consultation</option>
                                        <option value="procedure">GENCARE Procedure</option>
                                        <option value="scan">Ultrasound Scan</option>
                                        <option value="egg-retrieval">Egg Retrieval</option>
                                        <option value="embryo-transfer">Embryo Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Personal Notes</label>
                                    <textarea name="notes" className="w-full p-4 rounded-2xl border-rose-50 bg-rose-50/30 font-medium text-sm shadow-inner focus:ring-2 focus:ring-rose-200 outline-none h-28 resize-none" placeholder="Share any specific details..."></textarea>
                                </div>
                                <button type="submit" className="w-full py-4 bg-rose-500 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all hover:-translate-y-1 active:scale-95">
                                    Finalize Request
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .calendar-container-premium {
                    background: rgba(255, 255, 255, 0.4);
                    padding: 4px;
                    border-radius: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }
                .custom-calendar-nurture {
                    width: 100% !important;
                    background: transparent !important;
                    font-family: inherit;
                }
                .custom-calendar-nurture .react-calendar__navigation {
                    display: flex;
                    height: 56px;
                    margin-bottom: 24px;
                    background: white;
                    border-radius: 1.5rem;
                    padding: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .custom-calendar-nurture .react-calendar__navigation button {
                    min-width: 44px;
                    background: none;
                    font-size: 14px;
                    font-weight: 800;
                    color: #1e293b;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    border-radius: 1rem;
                }
                .custom-calendar-nurture .react-calendar__navigation button:hover {
                    background-color: #f8fafc;
                }
                .custom-calendar-nurture .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: 800;
                    font-size: 10px;
                    letter-spacing: 0.1em;
                    color: #94a3b8;
                    margin-bottom: 12px;
                }
                .custom-calendar-nurture .react-calendar__tile {
                    padding: 18px 10px;
                    font-weight: 700;
                    font-size: 14px;
                    color: #334155;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 1.25rem !important;
                    margin: 2px 0;
                }
                .custom-calendar-nurture .react-calendar__tile:hover {
                    background: #f1f5f9 !important;
                    transform: scale(0.95);
                    color: #4f46e5;
                }
                .custom-calendar-nurture .react-calendar__tile--active {
                    background: #f43f5e !important;
                    color: white !important;
                    box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.3);
                }
                .custom-calendar-nurture .react-calendar__tile--now {
                    background: #fff1f2 !important;
                    color: #e11d48 !important;
                    border: 1.5px solid #fecdd3 !important;
                }
                .has-availability {
                    background: #ecfdf5 !important;
                    color: #059669 !important;
                    position: relative;
                }
                .has-availability::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background: #10b981;
                    border-radius: 50%;
                }
                .has-appointment {
                    background: #fff1f2 !important;
                    color: #e11d48 !important;
                    position: relative;
                }
                .has-appointment::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background: #f43f5e;
                    border-radius: 50%;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    color: #cbd5e1 !important;
                }
            `}</style>
        </div>
    );
};

export default SchedulingCalendar;
