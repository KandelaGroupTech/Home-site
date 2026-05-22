import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Search, Download, Filter } from 'lucide-react';

const AdminDirectory: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Filters
    const [filterCompany, setFilterCompany] = useState('All');
    const [filterAccredited, setFilterAccredited] = useState('All');
    const [filterCheckSize, setFilterCheckSize] = useState('All');
    const [filterOpenToDeals, setFilterOpenToDeals] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await getDocs(collection(db, 'users'));
                setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)).filter(u => u.role !== 'admin'));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchUsers();
    }, []);

    const uniqueCompanies = Array.from(new Set(users.map(u => u.company).filter(Boolean))).sort() as string[];
    const uniqueCheckSizes = Array.from(new Set(users.map(u => u.preferences?.checkSize).filter(Boolean))).sort() as string[];

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || [u.firstName, u.lastName, u.email, u.company].some(v => v?.toLowerCase().includes(q));
        const matchCompany = filterCompany === 'All' || u.company === filterCompany;
        const matchAccredited = filterAccredited === 'All' || u.preferences?.accreditedStatus === filterAccredited;
        const matchCheckSize = filterCheckSize === 'All' || u.preferences?.checkSize === filterCheckSize;
        const matchDeals = filterOpenToDeals === 'All' || (filterOpenToDeals === 'Yes' ? u.preferences?.openToNewDeals === true : u.preferences?.openToNewDeals === false);

        return matchSearch && matchCompany && matchAccredited && matchCheckSize && matchDeals;
    });

    const exportToCSV = () => {
        if (filtered.length === 0) return;
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Accredited Status', 'Check Size', 'Open to Deals'];
        const rows = filtered.map(u => [
            u.firstName || '',
            u.lastName || '',
            u.email || '',
            u.phone || '',
            u.company || '',
            u.preferences?.accreditedStatus || 'Unknown',
            u.preferences?.checkSize || '',
            u.preferences?.openToNewDeals ? 'Yes' : 'No'
        ].map(v => `"${v.replace(/"/g, '""')}"`).join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `investor_directory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="h-64 bg-teal-50 rounded-2xl animate-pulse" />;

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-8 bg-teal-600 rounded" />
                        <h1 className="text-3xl font-serif text-slate-800">Investor Directory</h1>
                    </div>
                    <p className="text-slate-500 font-light pl-4">View and manage investor profiles and preferences.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${showFilters ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={16} /> Filters
                    </button>
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white transition-all text-sm font-medium shadow-sm"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white border border-slate-200 p-5 rounded-xl mb-6 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Search</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text" placeholder="Name, Email..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Company</label>
                        <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none">
                            <option value="All">All Companies</option>
                            {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Accredited</label>
                        <select value={filterAccredited} onChange={e => setFilterAccredited(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none">
                            <option value="All">All Statuses</option>
                            <option value="Accredited">Accredited</option>
                            <option value="Non-Accredited">Non-Accredited</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Check Size</label>
                        <select value={filterCheckSize} onChange={e => setFilterCheckSize(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none">
                            <option value="All">All Sizes</option>
                            {uniqueCheckSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Open to Deals</label>
                        <select value={filterOpenToDeals} onChange={e => setFilterOpenToDeals(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none appearance-none">
                            <option value="All">All Preferences</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>
            )}

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
                                        No investors match your current filters.
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
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
                        <span>Showing {filtered.length} of {users.length} investor{users.length !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDirectory;
