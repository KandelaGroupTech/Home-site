import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Search } from 'lucide-react';

const AdminDirectory: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await getDocs(collection(db, 'users'));
                setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)).filter(u => u.role !== 'admin'));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return !q || [u.firstName, u.lastName, u.email, u.company].some(v => v?.toLowerCase().includes(q));
    });

    if (loading) return <div className="h-64 bg-teal-50 rounded-2xl animate-pulse" />;

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-8 bg-teal-600 rounded" />
                        <h1 className="text-3xl font-serif text-slate-800">Investor Directory</h1>
                    </div>
                    <p className="text-slate-500 font-light pl-4">View and manage investor profiles and preferences.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-3 py-2 rounded-lg">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text" placeholder="Search investors..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-slate-600 font-light focus:outline-none placeholder:text-slate-300 w-48"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-5 py-4">Investor</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Phone</th>
                                <th className="px-5 py-4">Company</th>
                                <th className="px-5 py-4">Accredited</th>
                                <th className="px-5 py-4">Check Size</th>
                                <th className="px-5 py-4">Open to Deals</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-light text-sm">
                                        {search ? 'No investors match your search.' : 'No investors found in the database.'}
                                    </td>
                                </tr>
                            ) : filtered.map(user => (
                                <tr key={user.uid} className="hover:bg-teal-50/40 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 text-xs font-semibold flex-shrink-0">
                                                {(user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')}
                                            </div>
                                            <p className="text-slate-800 font-medium text-sm">{user.firstName} {user.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {user.email
                                            ? <a href={`mailto:${user.email}`} className="text-teal-600 hover:text-teal-800 text-sm hover:underline">{user.email}</a>
                                            : <span className="text-slate-300 text-sm">-</span>}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{user.phone || <span className="text-slate-300">-</span>}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{user.company || <span className="text-slate-300">-</span>}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${
                                            user.preferences?.accreditedStatus === 'Accredited' ? 'bg-green-50 text-green-700 border-green-200' :
                                            user.preferences?.accreditedStatus === 'Non-Accredited' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            {user.preferences?.accreditedStatus || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{user.preferences?.checkSize || <span className="text-slate-300">-</span>}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.preferences?.openToNewDeals ? 'text-teal-700' : 'text-slate-400'}`}>
                                            <span className={`w-2 h-2 rounded-full ${user.preferences?.openToNewDeals ? 'bg-teal-500' : 'bg-slate-300'}`} />
                                            {user.preferences?.openToNewDeals ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length > 0 && (
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                        Showing {filtered.length} of {users.length} investor{users.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDirectory;
