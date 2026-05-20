import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile } from '../types';
import { Upload, Check, File } from 'lucide-react';

const AdminDocumentUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('general');
    const [audience, setAudience] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    const [usersList, setUsersList] = useState<UserProfile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const snapshot = await getDocs(collection(db, 'users'));
            const data = snapshot.docs.map(doc => doc.data() as UserProfile);
            setUsersList(data.filter(u => u.role !== 'admin')); // Only show investors
        };
        fetchUsers();
    }, []);

    const handleUserToggle = (uid: string) => {
        setSelectedUsers(prev => 
            prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
        );
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            // 2. Create Firestore Record
            await addDoc(collection(db, 'documents'), {
                title,
                type,
                file_url: downloadUrl,
                target_audience: audience,
                allowed_uids: audience === 'all' ? [] : selectedUsers,
                created_at: new Date()
            });

            setSuccess(true);
            setFile(null);
            setTitle('');
            setSelectedUsers([]);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl animate-fade-in">
            <h1 className="text-3xl font-serif text-white mb-2">Upload Document</h1>
            <p className="text-slate-400 font-light mb-8">Securely share files with all investors or specific individuals.</p>

            <form onSubmit={handleUpload} className="space-y-6 bg-slate-900/40 border border-white/5 p-8 rounded-xl backdrop-blur-sm">
                
                {/* File Input */}
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-slate-950/30">
                    <input 
                        type="file" 
                        id="fileInput" 
                        className="hidden" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                    />
                    <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                        <div className="w-16 h-16 bg-teal-900/20 text-teal-500 rounded-full flex items-center justify-center mb-4">
                            <Upload size={24} />
                        </div>
                        {file ? (
                            <p className="text-teal-400 font-medium">{file.name}</p>
                        ) : (
                            <>
                                <p className="text-white font-medium mb-1">Click to select a file</p>
                                <p className="text-slate-500 text-sm font-light">PDF, DOCX, XLSX up to 50MB</p>
                            </>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase tracking-wider">Document Title</label>
                        <input 
                            type="text" required
                            value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase tracking-wider">Document Type</label>
                        <select 
                            value={type} onChange={e => setType(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light appearance-none"
                        >
                            <option value="general">General</option>
                            <option value="tax">Tax Document (e.g. K-1)</option>
                            <option value="financial">Financial Report</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Visibility / Target Audience</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="audience" value="all" checked={audience === 'all'} onChange={() => setAudience('all')} className="text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700" />
                            <span className="text-slate-300 text-sm">All Investors</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="audience" value="specific_users" checked={audience === 'specific_users'} onChange={() => setAudience('specific_users')} className="text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700" />
                            <span className="text-slate-300 text-sm">Specific Investors Only</span>
                        </label>
                    </div>

                    {audience === 'specific_users' && (
                        <div className="mt-4 border border-white/10 rounded-lg max-h-48 overflow-y-auto bg-slate-950/50 p-2">
                            {usersList.length === 0 ? (
                                <p className="text-slate-500 text-xs p-2">No investors found.</p>
                            ) : (
                                usersList.map(u => (
                                    <label key={u.uid} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUsers.includes(u.uid)} 
                                            onChange={() => handleUserToggle(u.uid)}
                                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
                                        />
                                        <span className="text-sm text-slate-300">{u.firstName} {u.lastName} <span className="text-slate-600">({u.email})</span></span>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={uploading || !file}
                        className={`flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all ${
                            success 
                            ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                            : 'bg-teal-700 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                    >
                        {success ? <><Check size={18} /> Upload Complete</> : <><File size={18} /> {uploading ? 'Uploading...' : 'Upload Document'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminDocumentUpload;
