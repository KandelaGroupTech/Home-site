import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp, deleteDoc, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { Search, Download, Filter, UserPlus, X, Trash2 } from 'lucide-react';
import { buildWelcomeEmail } from '../lib/emailTemplates';

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

    // Add User Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addEmail, setAddEmail] = useState('');
    const [addFirstName, setAddFirstName] = useState('');
    const [addLastName, setAddLastName] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState(false);

    const fetchUsers = async () => {
        try {
            const snap = await getDocs(collection(db, 'users'));
            setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)).filter(u => u.role !== 'admin'));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
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

    const handleDeleteUser = async (uid: string, name: string) => {
        if (!window.confirm(`Are you sure you want to completely remove ${name} from the platform? They will lose all access.`)) return;
        try {
            await deleteDoc(doc(db, 'users', uid));
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user.');
        }
    };

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

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        
        try {
            // 1. Initialize Secondary App
            const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp' + Date.now());
            const secondaryAuth = getAuth(secondaryApp);
            
            // 2. Generate temporary password that starts & ends with a letter,
            //    contains at least one digit and one special char, no periods or ambiguous chars.
            const upperChars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // no I, O
            const lowerChars  = 'abcdefghjkmnpqrstuvwxyz';    // no i, l, o
            const digitChars  = '23456789';                    // no 0, 1
            const specialChars = '#$%&*@';
            const allChars = lowerChars + digitChars + specialChars;

            const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
            const shuffle = (arr: string[]) => arr.sort(() => Math.random() - 0.5).join('');

            // Build password: startLetter + 7 mixed chars + endLetter  (guaranteed length 9)
            const middle = shuffle([
                pick(digitChars),
                pick(specialChars),
                ...Array.from({ length: 5 }, () => pick(allChars))
            ]);
            const tempPassword = pick(upperChars) + middle + pick(lowerChars);
            
            // 3. Create User in secondary auth (prevents admin logout)
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, addEmail, tempPassword);
            const newUid = userCredential.user.uid;
            
            // 4. Create Firestore Document
            await setDoc(doc(db, 'users', newUid), {
                uid: newUid,
                email: addEmail,
                firstName: addFirstName,
                lastName: addLastName,
                role: 'investor',
                phone: '',
                company: '',
                address: { line1: '', line2: '', city: '', state: '', zipCode: '', country: '' },
                preferences: { openToNewDeals: false, accreditedStatus: '', checkSize: '' },
                onboardingCompleted: false,
                updatedAt: serverTimestamp()
            });

            // 5. Send Welcome Email via mail collection
            const emailHtml = buildWelcomeEmail(addEmail, tempPassword, addFirstName);
            await addDoc(collection(db, 'mail'), {
                to: addEmail,
                message: {
                    subject: 'Welcome to The Kandela Group',
                    html: emailHtml
                },
                createdAt: serverTimestamp()
            });
            
            // 6. Sign out of secondary and clean up
            await signOut(secondaryAuth);
            
            setAddSuccess(true);
            setTimeout(() => {
                setAddSuccess(false);
                setShowAddModal(false);
                setAddEmail('');
                setAddFirstName('');
                setAddLastName('');
                fetchUsers(); // Refresh list
            }, 2000);

        } catch (err: any) {
            console.error('Error adding user:', err);
            setAddError(err.message || 'Failed to create user. Ensure the email is not already in use.');
        } finally {
            setAddLoading(false);
        }
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
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-all text-sm font-medium shadow-sm"
                    >
                        <UserPlus size={16} /> Add Investor
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
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 font-light text-sm">
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
                                    <td className="px-5 py-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteUser(user.uid, `${user.firstName} ${user.lastName}`)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                                            title="Remove Investor"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-serif text-lg text-slate-800">Add New Investor</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {addSuccess ? (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
                                        <div className="w-6 h-6 border-2 border-teal-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-medium text-slate-800 mb-2">Investor Added!</h4>
                                    <p className="text-slate-500 text-sm">Account created and a password reset link has been emailed to them.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAddUser} className="space-y-4">
                                    {addError && (
                                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                                            {addError}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                                            <input 
                                                type="text" required value={addFirstName} onChange={e => setAddFirstName(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                                            <input 
                                                type="text" required value={addLastName} onChange={e => setAddLastName(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                        <input 
                                            type="email" required value={addEmail} onChange={e => setAddEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            type="submit" disabled={addLoading}
                                            className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {addLoading ? (
                                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                                            ) : 'Create & Send Invite'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDirectory;
