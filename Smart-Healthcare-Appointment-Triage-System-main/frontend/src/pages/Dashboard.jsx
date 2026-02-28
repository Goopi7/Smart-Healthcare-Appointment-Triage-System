import React, { useState, useEffect } from 'react';
import { LayoutDashboard, UserPlus, ListOrdered, Settings, Activity, Edit3, History, MessageSquare, HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import QueueDashboard from '../components/QueueDashboard';
import StatsPanel from '../components/StatsPanel';
import PatientHistory from '../components/PatientHistory';
import NotificationManager from '../components/NotificationManager';
import NotificationHistory from '../components/NotificationHistory';
import api from '../api';

const Dashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Dr. Sarah Jenkins');
    const [profileRole, setProfileRole] = useState(() => localStorage.getItem('profileRole') || 'Head of Triage');

    useEffect(() => {
        localStorage.setItem('profileName', profileName);
    }, [profileName]);

    useEffect(() => {
        localStorage.setItem('profileRole', profileRole);
    }, [profileRole]);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Poll every 3 seconds for real-time queue updates
    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleDischarge = async (id) => {
        try {
            await api.delete(`/appointment/${id}`);
            fetchAppointments();
        } catch (error) {
            console.error("Error discharging patient:", error);
        }
    };

    const handleProfileEdit = () => {
        setActiveTab('settings');
    };

    const getInitials = (name) => {
        return name
            .replace(/^Dr\.?\s+/i, '')
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'DR';
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        {/* Stats Panel */}
                        <StatsPanel appointments={appointments} />

                        {/* Dashboard Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                            {/* Booking Form - Left Side (4 columns) */}
                            <div className="xl:col-span-4 sticky top-8">
                                <BookingForm onNewBooking={() => { fetchAppointments(); }} />
                            </div>

                            {/* Queue Dashboard - Right Side (8 columns) */}
                            <div className="xl:col-span-8">
                                <QueueDashboard appointments={appointments} loading={loading} onDischarge={handleDischarge} />
                            </div>
                        </div>
                    </div>
                );
            case 'admission':
                return (
                    <div className="max-w-2xl mx-auto mt-8">
                        <BookingForm onNewBooking={() => { fetchAppointments(); setActiveTab('queue'); }} />
                    </div>
                );
            case 'queue':
                return (
                    <div className="space-y-8 max-w-5xl mx-auto">
                        <StatsPanel appointments={appointments} />
                        <QueueDashboard appointments={appointments} loading={loading} onDischarge={handleDischarge} />
                    </div>
                );
            case 'history':
                return (
                    <div className="max-w-6xl mx-auto mt-2">
                        <PatientHistory />
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto mt-8">
                        <h3 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">Profile Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold tracking-wide text-slate-700 uppercase mb-2">Role / Title</label>
                                <input
                                    type="text"
                                    value={profileRole}
                                    onChange={(e) => setProfileRole(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                                />
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Changes are saved automatically.</p>
                                <button onClick={() => setActiveTab('overview')} className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all active:scale-95 shadow-md">
                                    Return to Overview
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="max-w-4xl mx-auto">
                        <NotificationManager onClose={() => setActiveTab('overview')} />
                    </div>
                );
            case 'notification-history':
                return (
                    <div className="max-w-7xl mx-auto">
                        <NotificationHistory />
                    </div>
                );
            default:
                return null;
        }
    };

    const navItemClass = (tabName) => {
        return `flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === tabName
            ? 'bg-blue-600/10 text-blue-500 font-bold'
            : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-white'
            }`;
    };

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">

            {/* Sidebar (Desktop) */}
            <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col hidden lg:flex fixed h-full z-20">
                {/* Logo Area */}
                <Link to="/" className="h-20 flex items-center px-8 border-b border-slate-800 text-white font-bold text-xl tracking-tight transition-opacity hover:opacity-80">
                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md mr-3">
                        <Activity size={24} />
                    </div>
                    SmartTriage
                </Link>

                {/* Nav Links */}
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Core Functions</div>

                    <button onClick={() => setActiveTab('overview')} className={navItemClass('overview')}>
                        <LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-blue-500' : ''} />
                        <span>Overview</span>
                    </button>
                    <button onClick={() => setActiveTab('admission')} className={navItemClass('admission')}>
                        <UserPlus size={20} className={activeTab === 'admission' ? 'text-blue-500' : ''} />
                        <span>Admission</span>
                    </button>
                    <button onClick={() => setActiveTab('queue')} className={navItemClass('queue')}>
                        <ListOrdered size={20} className={activeTab === 'queue' ? 'text-blue-500' : ''} />
                        <span>Live Queue</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'queue' ? 'bg-blue-200 text-blue-800' : 'bg-slate-800 text-slate-300'}`}>
                            {appointments.length}
                        </span>
                    </button>
                    <button onClick={() => setActiveTab('history')} className={navItemClass('history')}>
                        <History size={20} className={activeTab === 'history' ? 'text-blue-500' : ''} />
                        <span>Patient History</span>
                    </button>

                    <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-8">Notifications</div>
                    <button onClick={() => setActiveTab('notifications')} className={navItemClass('notifications')}>
                        <MessageSquare size={20} className={activeTab === 'notifications' ? 'text-purple-500' : ''} />
                        <span>Send Notification</span>
                    </button>
                    <button onClick={() => setActiveTab('notification-history')} className={navItemClass('notification-history')}>
                        <HistoryIcon size={20} className={activeTab === 'notification-history' ? 'text-purple-500' : ''} />
                        <span>Notification Log</span>
                    </button>

                    <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-8">System</div>
                    <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}>
                        <Settings size={20} className={activeTab === 'settings' ? 'text-blue-500' : ''} />
                        <span>Settings</span>
                    </button>
                </nav>

                {/* User Profile bottom */}
                <div className="p-4 border-t border-slate-800 pb-6 group">
                    <button
                        onClick={handleProfileEdit}
                        className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-left relative"
                        title="Click to edit profile name"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center font-bold text-white border border-slate-600 group-hover:border-blue-500 transition-colors">
                            {getInitials(profileName)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{profileName || "User"}</p>
                            <p className="text-xs text-slate-500 truncate">{profileRole || "Staff"}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-blue-400">
                            <Edit3 size={16} />
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header (Hidden on Desktop) */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between sticky top-0 z-30">
                    <Link to="/" className="flex items-center space-x-2 font-bold text-slate-900">
                        <Activity size={24} className="text-blue-600" />
                        <span>SmartTriage</span>
                    </Link>
                </header>

                {/* Topbar / Breadcrumbs */}
                <header className="h-20 bg-white shadow-sm border-b border-slate-200 flex items-center px-8 justify-between z-10 sticky top-0 md:static">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight capitalize">{activeTab} Dashboard</h2>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="hidden sm:flex items-center space-x-4">
                        <div className="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 flex items-center shadow-sm">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Updates Active
                        </div>
                    </div>
                </header>

                {/* Dashboard Canvas */}
                <main className="flex-1 p-6 md:p-8 xl:p-10 overflow-x-hidden">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
