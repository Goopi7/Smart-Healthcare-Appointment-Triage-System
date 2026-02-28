import React from 'react';
import { Activity, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px]"></div>
                </div>

                <div className="max-w-4xl mx-auto z-10">
                    <div className="inline-flex items-center space-x-2 bg-blue-100/50 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        <span>Live AI Triage Engine Active</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        AI-Powered Healthcare <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Triage System
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        Prioritize emergency patients instantly. Streamline medical workflows with intelligent, real-time queue management.
                    </p>

                    <Link
                        to="/dashboard"
                        className="group inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-black text-white text-lg font-medium px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <span>Start Admission</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Feature Cards Grid */}
                <div className="max-w-6xl mx-auto mt-24 mb-16 w-full grid grid-cols-1 md:grid-cols-3 gap-8 z-10 px-4">
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-lg shadow-slate-200/50 text-left transition-transform hover:-translate-y-2">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Activity size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Monitoring</h3>
                        <p className="text-slate-600 leading-relaxed">Live dashboards that instantly reflect patient influx and queue status across the facility.</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-lg shadow-slate-200/50 text-left transition-transform hover:-translate-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative z-10">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Emergency Detection</h3>
                        <p className="text-slate-600 leading-relaxed relative z-10">Natural language analysis automatically flags and elevates critical cases to the top.</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-lg shadow-slate-200/50 text-left transition-transform hover:-translate-y-2">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Clock size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Management</h3>
                        <p className="text-slate-600 leading-relaxed">Dynamic prioritization ensures resources are allocated to those who need them most.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <div className="flex items-center space-x-2 font-medium mb-4 md:mb-0">
                        <Activity size={18} className="text-blue-600" />
                        <span className="text-slate-900">SmartTriage Pro</span>
                    </div>
                    <p>© {new Date().getFullYear()} Modern Healthcare Solutions. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
