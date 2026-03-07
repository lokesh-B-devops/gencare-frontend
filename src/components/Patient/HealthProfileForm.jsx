import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Ruler,
    Weight,
    Activity,
    Moon,
    Zap,
    Stethoscope,
    CheckCircle2,
    AlertCircle,
    X,
    Sparkles
} from 'lucide-react';

const HealthProfileForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        age: initialData?.age || '',
        height: initialData?.height || '',
        weight: initialData?.weight || '',
        pastMedicalConditions: initialData?.pastMedicalConditions || [],
        lifestyle: {
            sleepHours: initialData?.lifestyle?.sleepHours || 8,
            activityLevel: initialData?.lifestyle?.activityLevel || 'Moderate',
            stressLevel: initialData?.lifestyle?.stressLevel || 'Moderate'
        },
        hormoneLevels: {
            amh: initialData?.hormoneLevels?.amh || '',
            fsh: initialData?.hormoneLevels?.fsh || '',
            lh: initialData?.hormoneLevels?.lh || '',
            estradiol: initialData?.hormoneLevels?.estradiol || '',
            progesterone: initialData?.hormoneLevels?.progesterone || ''
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    const commonConditions = [
        'PCOS', 'Endometriosis', 'Thyroid', 'Diabetes', 'Anemia', 'Fibroids', 'None'
    ];

    const handleConditionToggle = (condition) => {
        setFormData(prev => {
            if (condition === 'None') {
                return { ...prev, pastMedicalConditions: ['None'] };
            }
            let newConditions = prev.pastMedicalConditions.includes(condition)
                ? prev.pastMedicalConditions.filter(c => c !== condition)
                : [...prev.pastMedicalConditions.filter(c => c !== 'None'), condition];
            return { ...prev, pastMedicalConditions: newConditions };
        });
    };

    const handleLifestyleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            lifestyle: { ...prev.lifestyle, [field]: value }
        }));
    };

    const handleHormoneChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            hormoneLevels: { ...prev.hormoneLevels, [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/medical/health-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                setStatus({ type: 'success', message: 'Profile updated successfully!' });
                if (onSave) onSave(data.profile);
            } else {
                setStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-rose-50 w-full"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-rose-100 text-rose-500 rounded-xl">
                                <Stethoscope size={24} />
                            </div>
                            Health Profile
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Help us personalize your GENCARE journey with accurate data.</p>
                    </div>
                    {onCancel && (
                        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="text-slate-400" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} /> Age
                            </label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
                                placeholder="e.g. 32"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Ruler size={12} /> Height (cm)
                            </label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
                                placeholder="e.g. 165"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Weight size={12} /> Weight (kg)
                            </label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
                                placeholder="e.g. 60"
                                required
                            />
                        </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle size={12} /> Past Medical Conditions
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {commonConditions.map(condition => (
                                <button
                                    key={condition}
                                    type="button"
                                    onClick={() => handleConditionToggle(condition)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.pastMedicalConditions.includes(condition)
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200'
                                        : 'bg-white text-slate-600 border-slate-100 hover:border-rose-200'
                                        }`}
                                >
                                    {condition}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lifestyle */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Moon size={12} /> Sleep (Hrs)
                            </label>
                            <input
                                type="number"
                                value={formData.lifestyle.sleepHours}
                                onChange={(e) => handleLifestyleChange('sleepHours', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} /> Activity
                            </label>
                            <select
                                value={formData.lifestyle.activityLevel}
                                onChange={(e) => handleLifestyleChange('activityLevel', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
                            >
                                <option>Sedentary</option>
                                <option>Light</option>
                                <option>Moderate</option>
                                <option>Active</option>
                                <option>Very Active</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} /> Stress Level
                            </label>
                            <select
                                value={formData.lifestyle.stressLevel}
                                onChange={(e) => handleLifestyleChange('stressLevel', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
                            >
                                <option>Low</option>
                                <option>Moderate</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>

                    {/* Hormone Levels */}
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Sparkles size={12} /> Hormone Levels (Optional)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['amh', 'fsh', 'lh', 'estradiol', 'progesterone'].map(h => (
                                <div key={h} className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{h.toUpperCase()}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.hormoneLevels[h]}
                                        onChange={(e) => handleHormoneChange(h, e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-200 text-xs font-bold"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <p className="text-sm font-bold">{status.message}</p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Updating...' : 'Save Health Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default HealthProfileForm;
