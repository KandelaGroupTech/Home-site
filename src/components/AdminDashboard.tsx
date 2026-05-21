import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Users, FileText, Megaphone } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, docs: 0, announcements: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [u, d, a] = await Promise.all([
                    getCountFromServer(collection(db, 'users')),
                    getCountFromServer(collection(db, 'documents')),
                    getCountFromServer(collection(db, 'announcements')),
                ]);
                setStats({ users: u.data().count, docs: d.data().count, announcements: a.data().count });
            } catch (e) { console.error(e); }
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Investors', value: stats.users, Icon: Users, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
        { label: 'Documents Shared', value: stats.docs, Icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        { label: 'Announcements Sent', value: stats.announcements, Icon: Megaphone, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
    ];

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Admin Overview</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">High-level metrics for the investor portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {cards.map(({ label, value, Icon, color, bg, border }) => (
                    <div key={label} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm flex items-center gap-4`}>
                        <div className={`p-4 ${bg} ${border} border rounded-xl`}>
                            <Icon size={22} className={color} strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
                            <p className="text-4xl font-serif text-slate-800 mt-1">{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
