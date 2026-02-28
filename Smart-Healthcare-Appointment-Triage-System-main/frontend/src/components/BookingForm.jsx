import React, { useState } from 'react';
import { UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api';

const BookingForm = ({ onNewBooking }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Other',
        contact: '',
        symptoms: ''
    });

    const [status, setStatus] = useState({ type: null, message: '' }); // type: 'success' | 'error' | null
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        const payload = {
            patient: {
                name: formData.name,
                age: parseInt(formData.age),
                gender: formData.gender,
                contact: formData.contact || "N/A"
            },
            symptoms: formData.symptoms
        };

        try {
            const response = await api.post('/book', payload);
            const triageLevel = response.data.triage_level;
            const appointmentId = response.data.id;

            // Send confirmation notification if contact is available
            if (formData.contact && formData.contact !== "N/A") {
                try {
                    await api.post(`/notifications/send-confirmation/${appointmentId}`);
                    console.log('Confirmation notification sent');
                } catch (notifError) {
                    console.error('Failed to send notification:', notifError);
                    // Don't fail the booking if notification fails
                }
            }

            setStatus({
                type: 'success',
                message: `Patient admitted! Triage level: ${triageLevel}${formData.contact && formData.contact !== "N/A" ? ' - Confirmation sent' : ''}`
            });

            // Clear form
            setFormData({ name: '', age: '', gender: 'Other', contact: '', symptoms: '' });

            // Notify parent to refetch if needed (though interval handles this)
            if (onNewBooking) onNewBooking();
        } catch (error) {
            console.error(error);
            setStatus({
                type: 'error',
                message: 'Failed to book appointment. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                    <UserPlus size={24} strokeWidth={2.5} className="mr-3 text-blue-600" />
                    New Admission
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {status.message && (
                    <div className={`p-4 rounded-2xl flex items-start text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm shadow-emerald-100' : 'bg-red-50 text-red-800 border border-red-200 shadow-sm shadow-red-100'
                        }`}>
                        {status.type === 'success' ? <CheckCircle className="mr-2.5 mt-0.5 shrink-0 text-emerald-600" size={18} /> : <AlertCircle className="mr-2.5 mt-0.5 shrink-0 text-red-600" size={18} />}
                        <span className="leading-snug">{status.message}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Patient Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 placeholder:font-normal"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Age</label>
                            <input
                                type="number"
                                name="age"
                                required
                                min="0"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 placeholder:font-normal"
                                placeholder="Years"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Contact</label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 placeholder:font-normal"
                                placeholder="Phone (opt)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Reported Symptoms</label>
                        <textarea
                            name="symptoms"
                            required
                            rows={3}
                            value={formData.symptoms}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium resize-none placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                            placeholder="Describe the condition in detail..."
                        ></textarea>
                        <p className="mt-2 text-xs font-semibold text-slate-500 flex items-center">
                            <AlertCircle size={12} className="mr-1 inline text-blue-500" />
                            Keywords like <span className="text-red-500 mx-1">"chest pain"</span> or <span className="text-red-500 mx-1">"bleeding"</span> trigger emergency protocols.
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-blue-600"
                    >
                        {loading ? (
                            <><Loader2 size={24} className="animate-spin mr-3" /> Processing Engine...</>
                        ) : (
                            'Admit Patient'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;
