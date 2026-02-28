import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, Activity, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

const PatientHistory = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/patients');
                setPatients(response.data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact.includes(searchTerm)
    );

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                        <History size={24} className="mr-3 text-blue-600" />
                        Patient Database
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Comprehensive record of all admitted patients and their history.</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-full sm:w-64"
                    />
                </div>
            </div>

            <div className="p-0 overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-medium">Loading records...</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium">No patients found.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-8 py-4">Patient Info</th>
                                <th className="px-8 py-4">Current/Last Condition</th>
                                <th className="px-8 py-4">Appointment History</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 align-top">
                                        <div className="font-bold text-slate-900">{patient.name}</div>
                                        <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-3">
                                            <span>Age: {patient.age}</span>
                                            <span>• {patient.gender}</span>
                                            <span>• {patient.contact}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 align-top">
                                        {patient.appointments && patient.appointments.length > 0 ? (
                                            <div>
                                                <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg inline-block break-words max-w-xs cursor-default">
                                                    {patient.appointments[patient.appointments.length - 1].symptoms}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">No records</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-3">
                                            {patient.appointments && patient.appointments.length > 0 ? (
                                                patient.appointments.map(apt => (
                                                    <div key={apt.id} className="flex items-start bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-bold text-slate-500 flex items-center">
                                                                    <Calendar size={12} className="mr-1" />
                                                                    {new Date(apt.created_at).toLocaleDateString('en-GB')}
                                                                </span>
                                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${apt.triage_level === 'Emergency' ? 'bg-red-100 text-red-700' :
                                                                        apt.triage_level === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                                    }`}>
                                                                    {apt.triage_level}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-600 line-clamp-1">{apt.symptoms}</div>
                                                            <div className="mt-2 flex items-center text-[10px] font-bold">
                                                                {apt.status === 'Completed' ? (
                                                                    <span className="text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded"><CheckCircle size={10} className="mr-1" /> Treated</span>
                                                                ) : (
                                                                    <span className="text-blue-600 flex items-center bg-blue-50 px-1.5 py-0.5 rounded"><Clock size={10} className="mr-1" /> Queued</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-sm text-slate-400">No appointments</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PatientHistory;
