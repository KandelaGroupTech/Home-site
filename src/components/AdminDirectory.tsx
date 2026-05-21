import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';

const AdminDirectory: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'users'));
                const data = snapshot.docs.map(doc => doc.data() as UserProfile);
                setUsers(data.filter(u => u.role !== 'admin')); // Show only investors
            } catch (error) {
                console.error("Error fetching directory", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="animate-pulse h-64 bg-slate-900/50 rounded-xl"></div>;
    }

    return (
        <div className="w-full animate-fade-in">
            <h1 className="text-3xl font-serif text-white mb-2">Investor Directory</h1>
            <p className="text-slate-400 font-light mb-8">View and manage investor profiles and preferences.</p>

            <div className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-white/10 text-xs uppercase tracking-wider text-slate-500 font-medium">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Company</th>
                                <th className="p-4">Accredited</th>
                                <th className="p-4">Check Size</th>
                                <th className="p-4">Open to Deals</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500 font-light">No investors found in the database.</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-300">
                                            {user.email ? (
                                                <a href={`mailto:${user.email}`} className="text-teal-400 hover:underline">{user.email}</a>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-300">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-300">
                                            {user.company || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded border ${
                                                user.preferences?.accreditedStatus === 'Accredited' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                                                user.preferences?.accreditedStatus === 'Non-Accredited' ? 'bg-red-900/20 text-red-400 border-red-500/20' :
                                                'bg-slate-800 text-slate-400 border-white/10'
                                            }`}>
                                                {user.preferences?.accreditedStatus || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-300">
                                            {user.preferences?.checkSize || '-'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-300">
                                            {user.preferences?.openToNewDeals ? 'Yes' : 'No'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDirectory;
