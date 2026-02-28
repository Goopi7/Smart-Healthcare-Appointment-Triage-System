import React, { useMemo } from 'react';
import { Users, AlertOctagon, ActivitySquare } from 'lucide-react';
import StatsCard from './StatsCard';

const StatsPanel = ({ appointments }) => {
    // Calculate statistics over the appointments array
    const stats = useMemo(() => {
        let emergency = 0;
        let normal = 0;
        let urgent = 0;

        appointments.forEach(appt => {
            const level = appt.triage_level.toLowerCase();
            if (level === 'emergency') emergency++;
            else if (level === 'urgent') urgent++;
            else normal++;
        });

        return {
            total: appointments.length,
            emergency,
            normal: normal + urgent // Grouping non-emergencies as normal for the main stat, or can show separately
        };
    }, [appointments]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
                title="Total Patients Queued"
                value={stats.total}
                icon={Users}
                colorClass="bg-blue-50 text-blue-600"
            />
            <StatsCard
                title="Emergency Cases"
                value={stats.emergency}
                icon={AlertOctagon}
                colorClass="bg-red-500 text-white shadow-md shadow-red-500/20"
                highlight={stats.emergency > 0}
            />
            <StatsCard
                title="Routine/Urgent Cases"
                value={stats.normal}
                icon={ActivitySquare}
                colorClass="bg-emerald-50 text-emerald-600"
            />
        </div>
    );
};

export default StatsPanel;
