import React from 'react';
import { CheckCircle } from 'lucide-react';
import PatientCard from './PatientCard';

// Priority scores logic based on requirements
const getPriorityConfig = (level) => {
    switch (level.toLowerCase()) {
        case 'emergency': return { score: 98, color: 'bg-red-500', barCol: 'bg-red-500' };
        case 'urgent': return { score: 75, color: 'bg-amber-500', barCol: 'bg-amber-500' };
        case 'routine':
        case 'normal': return { score: 30, color: 'bg-emerald-500', barCol: 'bg-emerald-500' };
        default: return { score: 10, color: 'bg-slate-400', barCol: 'bg-slate-400' };
    }
};

const QueueDashboard = ({ appointments, loading, onDischarge }) => {
    if (loading && appointments.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <div className="animate-pulse flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full delay-150"></div>
                </div>
                <p className="mt-4 text-sm font-medium">Loading Live Queue...</p>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center transition-all hover:shadow-md">
                <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle size={36} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Queue is Empty</h3>
                <p className="text-slate-500 mt-2 text-lg">All patients have been attended to.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                    Active Patient Queue
                    <span className="ml-3 bg-slate-100 text-slate-600 text-sm py-1 px-3 rounded-full font-bold">{appointments.length}</span>
                </h2>
                <div className="flex items-center text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Sync
                </div>
            </div>

            <div className="space-y-4">
                {appointments.map((appt, index) => {
                    const isEmergency = appt.triage_level.toLowerCase() === 'emergency';
                    const { score, barCol } = getPriorityConfig(appt.triage_level);

                    return (
                        <PatientCard
                            key={appt.id}
                            patient={appt}
                            index={index}
                            isEmergency={isEmergency}
                            score={score}
                            barCol={barCol}
                            onDischarge={onDischarge}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default QueueDashboard;
