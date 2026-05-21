import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { UserProfile } from '../types';
import { Upload, Check, FileText, X } from 'lucide-react';

const fieldClass = "w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light text-sm placeholder:text-slate-300";

const AdminDocumentUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('general');
    const [audience, setAudience] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [usersList, setUsersList] = useState<UserProfile[]>([]);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, 'users'));
            setUsersList(snap.docs.map(d => d.data() as UserProfile).filter(u => u.role !== 'admin'));
        };
        fetchUsers();
    }, []);

    const handleUserToggle = (uid: string) => {
        setSelectedUsers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true); setProgress(0);
        try {
            const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
            const task = uploadBytesResumable(storageRef, file);
            task.on('state_changed', snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)));
            await task;
            const url = await getDownloadURL(storageRef);
            await addDoc(collection(db, 'documents'), {
                title, type, file_url: url,
                target_audience: audience,
                allowed_uids: audience === 'all' ? [] : selectedUsers,
                created_at: new Date()
            });
            setSuccess(true); setFile(null); setTitle(''); setSelectedUsers([]);
            setTimeout(() => { setSuccess(false); setProgress(0); }, 3000);
        } catch (e) { console.error(e); } finally { setUploading(false); }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Upload Document</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Securely share files with all investors or specific individuals.</p>
            </div>

            <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

                {/* Dropzone */}
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 bg-slate-50'}`}>
                    <input type="file" id="fileInput" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} required />
                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <FileText size={20} className="text-teal-600" strokeWidth={1.5} />
                            <span className="text-teal-700 font-medium text-sm">{file.name}</span>
                            <button type="button" onClick={() => setFile(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="fileInput" className="cursor-pointer">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload size={20} className="text-teal-600" />
                            </div>
                            <p className="text-slate-700 font-medium text-sm">Click to select a file</p>
                            <p className="text-slate-400 text-xs mt-1">PDF, DOCX, XLSX up to 50MB</p>
                        </label>
                    )}
                </div>

                {/* Upload progress */}
                {uploading && (
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Uploading...</span><span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Document Title</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={fieldClass} placeholder="e.g., 2025 K-1 Tax Document" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Document Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className={fieldClass + ' appearance-none'}>
                            <option value="general">General</option>
                            <option value="tax">Tax Document (K-1, 1099)</option>
                            <option value="financial">Financial Report</option>
                        </select>
                    </div>
                </div>

                {/* Audience */}
                <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-3">Visibility</label>
                    <div className="flex gap-4">
                        {['all', 'specific_users'].map(opt => (
                            <label key={opt} className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-lg border flex-1 transition-all ${audience === opt ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}>
                                <input type="radio" name="audience" value={opt} checked={audience === opt} onChange={() => setAudience(opt)} className="text-teal-600 focus:ring-teal-500" />
                                <div>
                                    <p className={`text-sm font-medium ${audience === opt ? 'text-teal-800' : 'text-slate-600'}`}>
                                        {opt === 'all' ? 'All Investors' : 'Specific Investors'}
                                    </p>
                                    <p className="text-xs text-slate-400 font-light">
                                        {opt === 'all' ? 'Visible to everyone' : 'Choose recipients below'}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>

                    {audience === 'specific_users' && (
                        <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Select Investors</p>
                            </div>
                            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                                {usersList.length === 0
                                    ? <p className="text-slate-400 text-xs p-4">No investors found.</p>
                                    : usersList.map(u => (
                                        <label key={u.uid} className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 cursor-pointer transition-colors">
                                            <input type="checkbox" checked={selectedUsers.includes(u.uid)} onChange={() => handleUserToggle(u.uid)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                            <div>
                                                <p className="text-sm text-slate-700">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-slate-400">{u.email}</p>
                                            </div>
                                        </label>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                        type="submit" disabled={uploading || !file}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            success ? 'bg-green-50 text-green-700 border border-green-300'
                            : 'bg-teal-700 hover:bg-teal-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                    >
                        {success ? <><Check size={16} /> Uploaded!</> : <><Upload size={16} /> {uploading ? `Uploading ${progress}%` : 'Upload Document'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminDocumentUpload;
