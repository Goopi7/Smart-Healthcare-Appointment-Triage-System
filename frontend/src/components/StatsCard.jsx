import React from 'react';

const StatsCard = ({ title, value, icon: Icon, colorClass, highlight = false }) => (
    <div className={`p-6 rounded-3xl flex items-center justify-between border ${highlight
        ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-[0_8px_30px_rgba(239,68,68,0.2)] relative overflow-hidden transform hover:-translate-y-1 transition-transform'
        : 'bg-white border-slate-100 shadow-sm hover:shadow-md transition-all'
        }`}>

        {/* Pulse effect background on highlight */}
        {highlight && (
            <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse pointer-events-none -mt-10 -mr-10"></div>
                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
            </>
        )}

        <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-sm font-bold tracking-wide text-slate-500 uppercase mb-2">{title}</p>
            <p className={`text-5xl font-black tracking-tight ${highlight ? 'text-red-600' : 'text-slate-900'}`}>
                {value}
            </p>
        </div>

        <div className={`p-4 rounded-2xl relative z-10 ${colorClass}`}>
            <Icon size={32} strokeWidth={2.5} className={highlight ? 'animate-pulse' : ''} />
        </div>
    </div>
);

export default StatsCard;
