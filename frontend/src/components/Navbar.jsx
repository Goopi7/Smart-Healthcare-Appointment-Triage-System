import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo Area */}
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">SmartTriage</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 -mt-1">Healthcare System</p>
                    </div>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center font-semibold text-sm space-x-6 text-slate-600 pr-6 border-r border-slate-200">
                        <Link to="#" className="hover:text-slate-900 transition-colors">Features</Link>
                        <Link to="#" className="hover:text-slate-900 transition-colors">Security</Link>
                        <Link to="#" className="hover:text-slate-900 transition-colors">Demo</Link>
                    </div>

                    <Link
                        to="/dashboard"
                        className="group flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-xl"
                    >
                        <span>Login to Portal</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>
        </header>
    );
};

export default Navbar;
