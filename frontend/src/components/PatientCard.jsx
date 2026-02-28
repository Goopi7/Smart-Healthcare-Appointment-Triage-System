import React from 'react';
import { Clock, AlertTriangle, User, Activity, CheckCircle2 } from 'lucide-react';

const PatientCard = ({ patient, index, isEmergency, score, barCol, onDischarge }) => {
    return (
        <div className={`relative overflow-hidden group transition-all duration-300 rounded-3xl ${isEmergency
            ? 'bg-gradient-to-br from-red-50 to-white border-2 border-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.25)] z-10'
            : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg shadow-sm'
            }`}
        >
            {/* Emergency indicator pulse effect for background */}
            {isEmergency && (
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-500/10 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
            )}

            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

                {/* Info Section */}
                <div className="flex items-start space-x-5 flex-1 w-full">

                    {/* Position number or Emergency icon */}
                    <div className={`mt-1 flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${isEmergency ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse ml-0' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {isEmergency ? <AlertTriangle size={28} /> : `#${index + 1}`}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className={`font-black text-xl truncate ${isEmergency ? 'text-red-950' : 'text-slate-900'}`}>
                                {patient.patient?.name || `Patient #${patient.patient_id}`}
                            </h3>
                            {/* Badge */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isEmergency ? 'bg-red-600 text-white shadow-md' :
                                patient.triage_level.toLowerCase() === 'urgent' ? 'bg-amber-100 text-amber-800' :
                                    'bg-emerald-100 text-emerald-800'
                                }`}>
                                {patient.triage_level}
                            </span>
                        </div>

                        <p className={`text-base leading-relaxed mb-4 ${isEmergency ? 'text-red-900/80 font-medium' : 'text-slate-600'}`}>
                            {patient.symptoms}
                        </p>

                        <div className="flex flex-wrap items-center text-sm text-slate-400 gap-x-6 gap-y-2 font-medium">
                            <span className="flex items-center"><User size={16} className="mr-1.5 opacity-60" /> Age: <span className="text-slate-600 ml-1">{patient.patient?.age || 'N/A'}</span></span>
                            <span className="flex items-center"><Clock size={16} className="mr-1.5 opacity-60" /> Arrived: <span className="text-slate-600 ml-1">{new Date(patient.created_at).toLocaleDateString('en-GB')} {new Date(patient.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                        </div>
                    </div>
                </div>

                {/* Priority Visualization - Right Side */}
                <div className={`w-full md:w-56 rounded-2xl p-4 border flex-shrink-0 flex flex-col justify-between ${isEmergency ? 'bg-white/60 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <Activity size={12} className="mr-1" />
                                Priority Score
                            </span>
                            <span className={`text-2xl font-black leading-none ${isEmergency ? 'text-red-600' : 'text-slate-700'}`}>{score}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${barCol} transition-all duration-1000 ease-out`}
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={() => onDischarge && onDischarge(patient.id)}
                        className={`mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center active:scale-95 ${isEmergency
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                            }`}
                    >
                        <CheckCircle2 size={16} className="mr-1.5" />
                        Discharge
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PatientCard;
