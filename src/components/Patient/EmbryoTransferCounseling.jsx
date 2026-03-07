import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, Info, ArrowRight } from 'lucide-react';

const EmbryoTransferCounseling = ({ patientId }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (patientId) {
            fetchPlan();
        }
    }, [patientId]);

    const fetchPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/embryo-transfer/latest/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.doctorConfirmation) {
                    setPlan(data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch plan:", err);
        } finally {
            setLoading(false);
        }
    };

    const acknowledgePlan = async () => {
        if (!plan) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/embryo-transfer/acknowledge/${plan._id || plan.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPlan(data);
            }
        } catch (err) {
            console.error("Failed to acknowledge plan:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;
    if (!plan) return null;

    return (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden font-sans">
            <div className="bg-indigo-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-1">
                    <ShieldCheck size={20} />
                    <h3 className="text-lg font-black tracking-tight">Embryo Transfer Counseling</h3>
                </div>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Personalized Education & Consent</p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                        <Info size={18} className="text-indigo-500" />
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        Your doctor has reviewed your clinical history and AI-assisted patterns to finalize your transfer plan.
                        Below is a visualization of the considerations for your upcoming procedure.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Success Probability Visualization</h4>
                    <div className="space-y-6 pt-2">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-700">Single Embryo Transfer</span>
                                <span className="text-xs font-black text-indigo-600 italic">~{plan.singleTransferProb}% success range</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${plan.singleTransferProb}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-700">Double Embryo Transfer</span>
                                <span className="text-xs font-black text-rose-500 italic">~{plan.doubleTransferProb}% success range</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${plan.doubleTransferProb}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" />
                        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Important Risk Warnings</h4>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <li className="text-[10px] font-bold text-amber-800 flex items-center gap-2 italic">• {plan.pretermBirthRisk}</li>
                        <li className="text-[10px] font-bold text-amber-800 flex items-center gap-2 italic">• Increased twin pregnancy chance</li>
                        <li className="text-[10px] font-bold text-amber-800 flex items-center gap-2 italic">• Post-transfer care adherence required</li>
                    </ul>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <div className="bg-slate-900 text-white p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                            <CheckCircle size={80} />
                        </div>
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Doctor's Final Decision</p>
                        <h3 className="text-2xl font-black italic tracking-tighter mb-4 capitalize">{plan.finalEmbryoCount} Embryo Transfer Selected</h3>

                        {plan.patientAcknowledged ? (
                            <div className="flex items-center gap-3 bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30">
                                <CheckCircle size={20} className="text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-100">You have acknowledged this plan on {new Date(plan.acknowledgedAt).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[10px] font-medium text-slate-400 italic mb-4">
                                    By clicking below, you acknowledge that you have reviewed the transfer plan and discussed the risks with your doctor.
                                </p>
                                <button
                                    onClick={acknowledgePlan}
                                    disabled={saving}
                                    className="w-full bg-white text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {saving ? 'Processing...' : 'I Acknowledge & Understand the Plan'}
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 px-8 py-3 flex items-center gap-2">
                <Info size={12} className="text-slate-300" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Clinical non-binding guidance provided for educational support only.</span>
            </div>
        </div>
    );
};

export default EmbryoTransferCounseling;
