import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Users, FileText, Megaphone } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, docs: 0, announcements: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersCount = await getCountFromServer(collection(db, 'users'));
                const docsCount = await getCountFromServer(collection(db, 'documents'));
                const annCount = await getCountFromServer(collection(db, 'announcements'));
                
                setStats({
                    users: usersCount.data().count,
                    docs: docsCount.data().count,
                    announcements: annCount.data().count
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-5xl animate-fade-in">
            <h1 className="text-3xl font-serif text-white mb-2">Admin Overview</h1>
            <p className="text-slate-400 font-light mb-8">High-level metrics for the portal.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-4 bg-teal-900/20 text-teal-500 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-light uppercase tracking-wider">Total Investors</p>
                        <p className="text-3xl font-serif text-white">{stats.users}</p>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-4 bg-blue-900/20 text-blue-500 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-light uppercase tracking-wider">Documents Shared</p>
                        <p className="text-3xl font-serif text-white">{stats.docs}</p>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-4 bg-purple-900/20 text-purple-500 rounded-lg">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-light uppercase tracking-wider">Announcements Sent</p>
                        <p className="text-3xl font-serif text-white">{stats.announcements}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
