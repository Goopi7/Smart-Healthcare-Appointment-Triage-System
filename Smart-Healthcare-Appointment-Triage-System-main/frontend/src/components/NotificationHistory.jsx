import React, { useState, useEffect } from 'react';
import { HistoryIcon, Filter, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../api';

const NotificationHistory = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = ['All', 'Sent', 'Pending', 'Failed'];
    const typeOptions = ['All', 'Confirmation', 'Status Update', 'Reminder', 'Appointment Reschedule', 'General Message'];

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?limit=100');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        const statusMatch = filterStatus === 'All' || notification.status === filterStatus;
        const typeMatch = filterType === 'All' || notification.notification_type === filterType;
        const searchMatch = searchTerm === '' ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.contact_number.includes(searchTerm);
        return statusMatch && typeMatch && searchMatch;
    });

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Sent':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Failed':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    const getTypeBadge = (type) => {
        const badges = {
            'Confirmation': 'bg-blue-100 text-blue-800 border-blue-300',
            'Status Update': 'bg-purple-100 text-purple-800 border-purple-300',
            'Reminder': 'bg-orange-100 text-orange-800 border-orange-300',
            'Appointment Reschedule': 'bg-pink-100 text-pink-800 border-pink-300',
            'General Message': 'bg-indigo-100 text-indigo-800 border-indigo-300'
        };
        return badges[type] || 'bg-slate-100 text-slate-800 border-slate-300';
    };

    const stats = {
        total: notifications.length,
        sent: notifications.filter(n => n.status === 'Sent').length,
        pending: notifications.filter(n => n.status === 'Pending').length,
        failed: notifications.filter(n => n.status === 'Failed').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <HistoryIcon size={28} strokeWidth={2} className="mr-3 text-blue-600" />
                        Notification History
                    </h2>
                    <button
                        onClick={fetchNotifications}
                        className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Total</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Sent</p>
                        <p className="text-3xl font-bold text-emerald-900">{stats.sent}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
                        <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1">Pending</p>
                        <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Failed</p>
                        <p className="text-3xl font-bold text-red-900">{stats.failed}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center">
                    <Filter size={16} className="mr-2" />
                    Filters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Search</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search message or phone..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-medium"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-medium"
                        >
                            {typeOptions.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
                        <p className="text-slate-600 font-medium">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
                        <p className="text-slate-600 font-medium">No notifications found</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusIcon(notification.status)}
                                        <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadge(notification.status)}`}>
                                            {notification.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getTypeBadge(notification.notification_type)}`}>
                                            {notification.notification_type}
                                        </span>
                                    </div>
                                    <p className="text-slate-900 font-medium mb-2">{notification.message}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                        <span>📱 {notification.contact_number}</span>
                                        <span>🆔 Patient #{notification.patient_id}</span>
                                        {notification.appointment_id && (
                                            <span>📋 Appointment #{notification.appointment_id}</span>
                                        )}
                                        <span>📅 {new Date(notification.created_at).toLocaleString()}</span>
                                        {notification.sent_at && (
                                            <span>✓ Sent: {new Date(notification.sent_at).toLocaleTimeString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationHistory;
