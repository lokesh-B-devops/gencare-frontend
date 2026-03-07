import React, { useState, useEffect } from 'react';
import { Brain, ShieldCheck, CheckCircle, Info, AlertTriangle, Users } from 'lucide-react';

const EmbryoTransferGuidance = ({ patientId, onDecisionConfirmed }) => {
    const [guidance, setGuidance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [decision, setDecision] = useState({
        finalEmbryoCount: 1,
        doctorNotes: '',
        doctorConfirmation: false
    });

    useEffect(() => {
        if (patientId) {
            fetchLatestGuidance();
        }
    }, [patientId]);

    const MOCK_GUIDANCE = {
        '507f191e810c19729de86005': {
            singleTransferProb: 35,
            doubleTransferProb: 55,
            outcomes: {
                single: 'Single embryo transfer (eSET) is recommended to minimize maternal complications given history of endometriosis.',
                double: 'Double transfer significantly increases live birth probability but carries high risk of multiples and pre-eclampsia.',
                tripletRisk: 'Low (<1%)'
            },
            maternalRisks: ['Advanced Maternal Age (38)', 'History of Endometriosis', 'Increased risk of gestational hypertension'],
            neonatalRisks: ['Moderate risk of preterm delivery', 'Higher probability of NICU admission with DET'],
            pretermBirthRisk: 'Increased (15%)',
            uncertainty: 'Moderate (Based on previous 3 cycles)',
            aiRationale: 'Given the patient\'s age and endometriosis history, a double embryo transfer (DET) increases live birth chance but carries significant maternal risk.',
            clinicalGuidance: 'Strongly consider eSET to mitigate hypertensive disorders. If DET is chosen, monitor uterine inflammatory markers closely.',
            disclaimer: 'AI insights are probabilistic and for clinical decision support only.'
        },
        '507f191e810c19729de86006': {
            singleTransferProb: 65,
            doubleTransferProb: 58,
            outcomes: {
                single: 'Elective SET is highly recommended. Patient has optimal endometrial thickness and high-grade blastocysts.',
                double: 'Minimal success gain ( < 2%) compared to SET, but 40x risk of twin pregnancy.',
                tripletRisk: 'Very Low (<0.1%)'
            },
            maternalRisks: ['Low overall risk', 'Standard pregnancy monitoring recommended'],
            neonatalRisks: ['Ideal neonatal prognosis with eSET', 'Standard risk profiles'],
            pretermBirthRisk: 'Low (<5%)',
            uncertainty: 'Low (Consistent laboratory metrics)',
            aiRationale: 'Patient is an ideal candidate for elective single embryo transfer (eSET). High quality day 5 blastocysts suggest excellent outcomes.',
            clinicalGuidance: 'Elective single embryo transfer (eSET) is the recommended path. DET offers no significant statistical advantage.',
            disclaimer: 'AI insights are probabilistic and for clinical decision support only.'
        },
        '507f191e810c19729de86007': {
            singleTransferProb: 15,
            doubleTransferProb: 32,
            outcomes: {
                single: 'Low probability of implantation due to advanced age and thin uterine lining.',
                double: 'Highest probability of achieving at least one live birth, despite elevated risks.',
                tripletRisk: 'Moderate (3%)'
            },
            maternalRisks: ['Advanced Maternal Age (42)', 'Thinned endometrial lining (<7mm)', 'Risk of uterine artery resistance'],
            neonatalRisks: ['High risk of preterm birth', 'Elevated risk of low birth weight'],
            pretermBirthRisk: 'High (25%)',
            uncertainty: 'High (Variable endometrial receptivity)',
            aiRationale: 'Compromised endometrial environment and advanced age suggest low implantation rates. DET might be necessary.',
            clinicalGuidance: 'Consider DET after discussing neonatal intensive care possibilities. Pre-transfer PRP might improve outcome.',
            disclaimer: 'AI insights are probabilistic and for clinical decision support only.'
        },
        '507f191e810c19729de86008': {
            singleTransferProb: 48,
            doubleTransferProb: 52,
            outcomes: {
                single: 'Good prognosis for eSET. Balanced hormonal profile.',
                double: 'Slightly higher immediate success but significant risk of multiple gestation complications.',
                tripletRisk: 'Low (1.5%)'
            },
            maternalRisks: ['PCOS history', 'Elevated baseline AMH', 'Increased risk of OHSS if twins occur'],
            neonatalRisks: ['Moderate risk profile', 'Standard twin-pregnancy neonatal risks'],
            pretermBirthRisk: 'Moderate (12%)',
            uncertainty: 'Low (Stable clinical history)',
            aiRationale: 'Normal standard case. PCOS history slightly increases risk of gestational diabetes.',
            clinicalGuidance: 'eSET is preferred. Success rates are comparable between SET and DET in this specific patient profile.',
            disclaimer: 'AI insights are probabilistic and for clinical decision support only.'
        },
        '507f191e810c19729de86002': {
            singleTransferProb: 42,
            doubleTransferProb: 45,
            outcomes: {
                single: 'Stable prognosis. Standard stimulation response.',
                double: 'Marginal success increase with elevated risk of multiples.',
                tripletRisk: 'Low (1%)'
            },
            maternalRisks: ['Standard maternal risk profile', 'No significant contraindications'],
            neonatalRisks: ['Standard neonatal risks'],
            pretermBirthRisk: 'Standard (8%)',
            uncertainty: 'Low',
            aiRationale: 'Standard clinic case with normal response parameters.',
            clinicalGuidance: 'Proceed with eSET as per standard protocol.',
            disclaimer: 'AI insights are probabilistic and for clinical decision support only.'
        }
    };

    const fetchLatestGuidance = async () => {
        if (MOCK_GUIDANCE[patientId]) {
            setGuidance({ ...MOCK_GUIDANCE[patientId], id: 'mock-' + patientId });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/embryo-transfer/latest/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGuidance(data);
                if (data.doctorConfirmation) {
                    setDecision({
                        finalEmbryoCount: data.finalEmbryoCount,
                        doctorNotes: data.doctorNotes,
                        doctorConfirmation: data.doctorConfirmation
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch guidance:", err);
        }
    };

    const generateGuidance = async () => {
        setLoading(true);
        if (MOCK_GUIDANCE[patientId]) {
            // Simulate AI delay
            setTimeout(() => {
                setGuidance({ ...MOCK_GUIDANCE[patientId], id: 'mock-' + patientId });
                setLoading(false);
            }, 1500);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/embryo-transfer/generate/${patientId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setGuidance(data);
        } catch (err) {
            console.error("Failed to generate guidance:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveDecision = async () => {
        if (!guidance) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/embryo-transfer/decision/${guidance._id || guidance.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...decision,
                    doctorConfirmation: true
                })
            });
            if (res.ok) {
                const data = await res.json();
                setGuidance(data);
                setDecision(prev => ({ ...prev, doctorConfirmation: true }));
                if (onDecisionConfirmed) onDecisionConfirmed(data);
            }
        } catch (err) {
            console.error("Failed to save decision:", err);
        } finally {
            setSaving(false);
        }
    };

    if (!patientId) return (
        <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Select a patient to access Embryo Transfer Guidance</p>
        </div>
    );

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 font-sans">
            {/* Header */}
            <div className="bg-slate-900 p-6 md:p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Brain size={120} />
                </div>
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-rose-500 p-2 rounded-xl">
                        <Brain size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter italic">AI-Assisted Embryo Transfer Guidance</h2>
                </div>
                <p className="text-slate-400 text-xs md:text-sm font-medium">Doctor-assist decision support module • Non-binding recommendations</p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
                {/* Generation Area */}
                {!guidance ? (
                    <div className="text-center py-12">
                        <button
                            onClick={generateGuidance}
                            disabled={loading}
                            className={`bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Analyzing Patient Data...' : 'Generate AI Guidance'}
                        </button>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">Analyzing Age, History, and Uterine Health</p>
                    </div>
                ) : (
                    <>
                        {/* Probabilities Output */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100">
                                <h3 className="text-indigo-900 font-black text-xs uppercase tracking-widest mb-4">Single Embryo Transfer</h3>
                                <div className="text-4xl font-black text-indigo-600 mb-2 italic">{guidance.singleTransferProb || 0}% <span className="text-xs not-italic font-bold text-slate-400 uppercase tracking-tight">Prob. Range</span></div>
                                <p className="text-indigo-800/70 text-sm font-medium leading-relaxed">{guidance.outcomes?.single || 'N/A'}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100">
                                <h3 className="text-rose-900 font-black text-xs uppercase tracking-widest mb-4">Double Embryo Transfer</h3>
                                <div className="text-4xl font-black text-rose-600 mb-2 italic">{guidance.doubleTransferProb || 0}% <span className="text-xs not-italic font-bold text-slate-400 uppercase tracking-tight">Prob. Range</span></div>
                                <p className="text-rose-800/70 text-sm font-medium leading-relaxed">{guidance.outcomes?.double || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Risk Visualization */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={18} className="text-amber-500" />
                                <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest">Risk & Clinical Indicators</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Triplet Risk</p>
                                    <p className="text-xs font-bold text-slate-700">{guidance.outcomes?.tripletRisk || 'Low'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Preterm Birth</p>
                                    <p className="text-xs font-bold text-slate-700">{guidance.pretermBirthRisk || 'Standard'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Certainty</p>
                                    <p className="text-xs font-bold text-slate-700">{guidance.uncertainty || 'High'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-amber-50/30 border border-amber-100">
                                    <h4 className="text-[10px] font-black text-amber-800 uppercase mb-2">Maternal Risks</h4>
                                    <ul className="text-xs font-medium text-amber-900/70 space-y-1">
                                        {(guidance.maternalRisks || []).map((r, i) => <li key={i} className="flex items-center gap-2 italic">• {r}</li>)}
                                    </ul>
                                </div>
                                <div className="p-5 rounded-2xl bg-amber-50/30 border border-amber-100">
                                    <h4 className="text-[10px] font-black text-amber-800 uppercase mb-2">Neonatal Risks</h4>
                                    <ul className="text-xs font-medium text-amber-900/70 space-y-1">
                                        {(guidance.neonatalRisks || []).map((r, i) => <li key={i} className="flex items-center gap-2 italic">• {r}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Control */}
                        <div className="pt-8 border-t border-slate-100 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Embryo Selection</label>
                                    <div className="flex gap-4">
                                        {[1, 2, 3].map(count => (
                                            <button
                                                key={count}
                                                disabled={guidance.doctorConfirmation}
                                                onClick={() => setDecision(prev => ({ ...prev, finalEmbryoCount: count }))}
                                                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all ${decision.finalEmbryoCount === count ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-[2] space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor Decision Notes</label>
                                    <textarea
                                        readOnly={guidance.doctorConfirmation}
                                        value={decision.doctorNotes}
                                        onChange={(e) => setDecision(prev => ({ ...prev, doctorNotes: e.target.value }))}
                                        placeholder="Enter justification or clinical observations..."
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-slate-900/5 outline-none min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {guidance.doctorConfirmation ? (
                                <div className="flex items-center justify-center gap-4 bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                                    <CheckCircle className="text-emerald-500" size={32} />
                                    <div>
                                        <p className="text-emerald-900 font-black text-sm uppercase tracking-widest">Decision Confirmed</p>
                                        <p className="text-emerald-700/70 text-xs font-bold">Logged at {new Date(guidance.confirmedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={saveDecision}
                                        disabled={saving}
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 duration-300"
                                    >
                                        {saving ? 'Saving Decision...' : 'Confirm & Finalize Transfer Plan'}
                                    </button>
                                    <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                        <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-rose-800 leading-normal italic">
                                            {guidance.disclaimer} Confirmation will log your final decision for audit trail and make results available for patient counseling.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer / Status */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Info size={14} className="text-slate-300" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Decision Support System v1.0</span>
                </div>
                {guidance && (
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Status: {guidance.doctorConfirmation ? 'Patient Access Enabled' : 'Awaiting Physician Approval'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default EmbryoTransferGuidance;
