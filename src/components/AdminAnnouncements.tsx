import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Check, Trash2, Megaphone, Users, Paperclip, X, FileText } from 'lucide-react';
import { UserProfile, Attachment } from '../types';
import { buildAnnouncementEmail } from '../lib/emailTemplates';

interface Props { authorName: string; }

const fieldClass = "w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light text-sm placeholder:text-slate-300";

const AdminAnnouncements: React.FC<Props> = ({ authorName }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Targeting State
    const [targetType, setTargetType] = useState('all'); // 'all', 'category', 'individuals'
    const [users, setUsers] = useState<UserProfile[]>([]);
    
    // Category Filters
    const [filterCompany, setFilterCompany] = useState('All');
    const [filterAccredited, setFilterAccredited] = useState('All');
    const [filterCheckSize, setFilterCheckSize] = useState('All');
    const [filterOpenToDeals, setFilterOpenToDeals] = useState('All');
    
    // Individual Selection
    const [selectedUids, setSelectedUids] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    useEffect(() => {
        // Fetch announcements
        const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(data);
        });

        // Fetch users for targeting
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, 'users'));
            setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)).filter(u => u.role !== 'admin'));
        };
        fetchUsers();

        // One-time automatic migration for old announcements
        const migrateOldAnnouncements = async () => {
            try {
                const snap = await getDocs(collection(db, 'announcements'));
                snap.docs.forEach(d => {
                    if (d.data().target_audience === undefined) {
                        updateDoc(d.ref, { target_audience: 'all' });
                    }
                });
            } catch (e) { console.error("Migration error", e); }
        };
        migrateOldAnnouncements();

        return () => unsubscribe();
    }, []);

    const uniqueCompanies = Array.from(new Set(users.map(u => u.company).filter(Boolean))).sort() as string[];
    const uniqueCheckSizes = Array.from(new Set(users.map(u => u.preferences?.checkSize).filter(Boolean))).sort() as string[];
    const uniqueGroups = Array.from(new Set(users.flatMap(u => u.groups || []))).sort() as string[];

    // Calculate how many users match the current category filters
    const matchedCategoryUsers = users.filter(u => {
        const matchCompany = filterCompany === 'All' || u.company === filterCompany;
        const matchAccredited = filterAccredited === 'All' || u.preferences?.accreditedStatus === filterAccredited;
        const matchCheckSize = filterCheckSize === 'All' || u.preferences?.checkSize === filterCheckSize;
        const matchDeals = filterOpenToDeals === 'All' || (filterOpenToDeals === 'Yes' ? u.preferences?.openToNewDeals === true : u.preferences?.openToNewDeals === false);
        return matchCompany && matchAccredited && matchCheckSize && matchDeals;
    });

    const matchedGroupUsers = users.filter(u => 
        u.groups?.some(g => selectedGroups.includes(g))
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await deleteDoc(doc(db, 'announcements', id));
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    const toggleUserSelection = (uid: string) => {
        if (selectedUids.includes(uid)) {
            setSelectedUids(selectedUids.filter(id => id !== uid));
        } else {
            setSelectedUids([...selectedUids, uid]);
        }
    };

    const toggleGroupSelection = (group: string) => {
        if (selectedGroups.includes(group)) {
            setSelectedGroups(selectedGroups.filter(g => g !== group));
        } else {
            setSelectedGroups([...selectedGroups, group]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let target_audience = 'all';
        let allowed_uids: string[] = [];

        if (targetType === 'category') {
            if (matchedCategoryUsers.length === 0) {
                alert("Your selected categories do not match any investors.");
                return;
            }
            target_audience = 'custom';
            allowed_uids = matchedCategoryUsers.map(u => u.uid);
        } else if (targetType === 'groups') {
            if (selectedGroups.length === 0) {
                alert("Please select at least one group.");
                return;
            }
            if (matchedGroupUsers.length === 0) {
                alert("Your selected groups do not match any investors.");
                return;
            }
            target_audience = 'custom';
            allowed_uids = matchedGroupUsers.map(u => u.uid);
        } else if (targetType === 'individuals') {
            if (selectedUids.length === 0) {
                alert("Please select at least one investor.");
                return;
            }
            target_audience = 'custom';
            allowed_uids = selectedUids;
        }

        const targetedUsers = targetType === 'all' 
            ? users 
            : targetType === 'category' 
                ? matchedCategoryUsers 
                : targetType === 'groups'
                    ? matchedGroupUsers
                    : users.filter(u => selectedUids.includes(u.uid));

        setSending(true);
        try {
            const attachments: Attachment[] = [];
            for (const file of selectedFiles) {
                const fileRef = ref(storage, `announcement_attachments/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                attachments.push({
                    name: file.name,
                    url,
                    size: file.size,
                    type: file.type
                });
            }

            await addDoc(collection(db, 'announcements'), {
                title, content, author_name: authorName, created_at: new Date(),
                target_audience,
                allowed_uids,
                attachments
            });

            // Trigger Emails via Firebase Extension
            if (targetedUsers.length > 0) {
                const batch = writeBatch(db);
                targetedUsers.forEach(u => {
                    const mailRef = doc(collection(db, 'mail'));
                    batch.set(mailRef, {
                        to: u.email,
                        message: {
                            subject: `New Announcement: ${title}`,
                            html: buildAnnouncementEmail(title, content, authorName, u.firstName, attachments)
                        }
                    });
                });
                await batch.commit();
            }

            setSent(true); 
            setTitle(''); 
            setContent('');
            setSelectedUids([]);
            setSelectedGroups([]);
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setSent(false), 3000);
        } catch (e) { console.error(e); } finally { setSending(false); }
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Post Announcement</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Broadcast a message to your investors. You can target everyone, or select specific segments.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-2">Target Audience</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {['all', 'category', 'groups', 'individuals'].map(type => (
                                <button
                                    key={type} type="button"
                                    onClick={() => setTargetType(type)}
                                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${targetType === type ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        {type === 'all' && 'All Investors'}
                                        {type === 'category' && 'Filter by Category'}
                                        {type === 'groups' && 'Target by Group'}
                                        {type === 'individuals' && 'Select Individuals'}
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${targetType === type ? 'border-teal-600' : 'border-slate-300'}`}>
                                            {targetType === type && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Targeting */}
                    {targetType === 'category' && (
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Company</label>
                                <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none">
                                    <option value="All">All Companies</option>
                                    {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Accredited</label>
                                <select value={filterAccredited} onChange={e => setFilterAccredited(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none">
                                    <option value="All">All Statuses</option>
                                    <option value="Accredited">Accredited</option>
                                    <option value="Non-Accredited">Non-Accredited</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Check Size</label>
                                <select value={filterCheckSize} onChange={e => setFilterCheckSize(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none">
                                    <option value="All">All Sizes</option>
                                    {uniqueCheckSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Open to Deals</label>
                                <select value={filterOpenToDeals} onChange={e => setFilterOpenToDeals(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none">
                                    <option value="All">All Preferences</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="col-span-full pt-2">
                                <p className="text-sm font-medium text-teal-700 flex items-center gap-2">
                                    <Users size={16} /> This message will be sent to {matchedCategoryUsers.length} investor{matchedCategoryUsers.length !== 1 ? 's' : ''}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Group Targeting */}
                    {targetType === 'groups' && (
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                            <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3">Select Groups</label>
                            {uniqueGroups.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No groups exist yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {uniqueGroups.map(group => (
                                        <label key={group} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm font-medium ${selectedGroups.includes(group) ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedGroups.includes(group)}
                                                onChange={() => toggleGroupSelection(group)}
                                                className="hidden"
                                            />
                                            {group}
                                        </label>
                                    ))}
                                </div>
                            )}
                            <div className="pt-2">
                                <p className="text-sm font-medium text-teal-700 flex items-center gap-2">
                                    This message will be sent to {matchedGroupUsers.length} investor{matchedGroupUsers.length !== 1 ? 's' : ''}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Individual Targeting */}
                    {targetType === 'individuals' && (
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                            <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3">Select Recipients ({selectedUids.length} selected)</label>
                            <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-2">
                                {users.map(user => (
                                    <label key={user.uid} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedUids.includes(user.uid) ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 hover:border-teal-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUids.includes(user.uid)}
                                            onChange={() => toggleUserSelection(user.uid)}
                                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Subject / Title</label>
                        <input
                            type="text" required value={title} onChange={e => setTitle(e.target.value)}
                            className={fieldClass} placeholder="e.g., Q3 2026 Platform Update"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Message</label>
                        <textarea
                            required value={content} onChange={e => setContent(e.target.value)}
                            rows={8} className={fieldClass + ' resize-none'}
                            placeholder="Write your message here..."
                        />
                    </div>
                    <div>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors"
                        >
                            <Paperclip size={16} /> Attach Documents
                        </button>
                        
                        {selectedFiles.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm">
                                        <FileText size={14} className="text-slate-400" />
                                        <span className="text-slate-700 max-w-[200px] truncate">{file.name}</span>
                                        <span className="text-xs text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="ml-1 text-slate-400 hover:text-red-500 focus:outline-none"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-200">
                    <p className="text-xs text-slate-400">Signed: <span className="text-slate-600">{authorName}</span></p>
                    <button
                        type="submit" disabled={sending}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            sent ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-teal-700 hover:bg-teal-600 text-white shadow-sm'
                        }`}
                    >
                        {sent ? <><Check size={16} /> Posted!</> : <><Send size={16} /> {sending ? 'Posting...' : 'Post Announcement'}</>}
                    </button>
                </div>
            </form>

            {/* Sent Announcements List */}
            <div className="mt-12">
                <h2 className="text-xl font-serif text-slate-800 mb-6 flex items-center gap-2">
                    <Megaphone size={20} className="text-teal-600" />
                    Sent Announcements
                </h2>
                
                {announcements.length === 0 ? (
                    <p className="text-slate-500 font-light italic">No announcements sent yet.</p>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                <button 
                                    onClick={() => handleDelete(announcement.id)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-50"
                                    title="Delete announcement"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="pr-10">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-medium text-slate-800">{announcement.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${announcement.target_audience === 'custom' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {announcement.target_audience === 'custom' ? `Custom Target (${announcement.allowed_uids?.length || 0})` : 'All Investors'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-light mb-3">
                                        {announcement.created_at?.toDate ? new Date(announcement.created_at.toDate()).toLocaleDateString() : 'Just now'} • Signed by {announcement.author_name}
                                    </p>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{announcement.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;
