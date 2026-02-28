import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

const NotificationManager = ({ onClose, selectedPatientId = null }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(selectedPatientId);
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState('Status Update');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });
    const [recentNotifications, setRecentNotifications] = useState([]);

    const notificationTypes = [
        'Confirmation',
        'Status Update',
        'Reminder',
        'Appointment Reschedule',
        'General Message'
    ];

    useEffect(() => {
        fetchPatients();
        if (selectedPatient) {
            fetchPatientNotifications(selectedPatient);
        }
    }, [selectedPatient]);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const fetchPatientNotifications = async (patientId) => {
        try {
            const response = await api.get(`/notifications/patient/${patientId}?limit=10`);
            setRecentNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !message.trim()) {
            setStatus({ type: 'error', message: 'Please select a patient and enter a message' });
            return;
        }

        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const payload = {
                patient_id: parseInt(selectedPatient),
                message: message.trim(),
                notification_type: notificationType
            };

            await api.post('/notifications/send', payload);

            setStatus({
                type: 'success',
                message: `Notification sent to ${patients.find(p => p.id === parseInt(selectedPatient))?.name || 'patient'}!`
            });

            setMessage('');
            setNotificationType('Status Update');
            fetchPatientNotifications(selectedPatient);
        } catch (error) {
            console.error(error);
            setStatus({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to send notification'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Sent':
                return <CheckCircle size={16} className="text-emerald-600" />;
            case 'Pending':
                return <Clock size={16} className="text-yellow-600" />;
            case 'Failed':
                return <AlertCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sent':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Failed':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                    <MessageSquare size={24} strokeWidth={2.5} className="mr-3 text-purple-600" />
                    Notification Manager
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {status.message && (
                    <div className={`p-4 rounded-2xl flex items-start text-sm font-medium ${
                        status.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm shadow-emerald-100'
                            : 'bg-red-50 text-red-800 border border-red-200 shadow-sm shadow-red-100'
                    }`}>
                        {status.type === 'success' ? (
                            <CheckCircle className="mr-2.5 mt-0.5 shrink-0 text-emerald-600" size={18} />
                        ) : (
                            <AlertCircle className="mr-2.5 mt-0.5 shrink-0 text-red-600" size={18} />
                        )}
                        <span className="leading-snug">{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleSendNotification} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">
                            Select Patient
                        </label>
                        <select
                            value={selectedPatient || ''}
                            onChange={(e) => {
                                setSelectedPatient(parseInt(e.target.value) || null);
                                setRecentNotifications([]);
                            }}
                            required
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} (ID: {patient.id}) - {patient.contact}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">
                            Notification Type
                        </label>
                        <select
                            value={notificationType}
                            onChange={(e) => setNotificationType(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                        >
                            {notificationTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter notification message..."
                            rows={4}
                            required
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium resize-none placeholder:text-slate-400 placeholder:font-normal shadow-inner"
                        />
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                            {message.length}/160 characters
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} className="mr-2" />
                                Send Notification
                            </>
                        )}
                    </button>
                </form>

                {selectedPatient && recentNotifications.length > 0 && (
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Recent Notifications</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {recentNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-xl border ${getStatusColor(notification.status)} flex items-start justify-between`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(notification.status)}
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                {notification.notification_type}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {notification.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{notification.message}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationManager;
