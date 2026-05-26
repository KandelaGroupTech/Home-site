import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { InvestorUpload } from '../types';
import { Trash2, FileText, Download } from 'lucide-react';

const AdminInvestorUploads: React.FC = () => {
    const [uploads, setUploads] = useState<InvestorUpload[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUploads = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'investor_uploads'), orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InvestorUpload[];
            setUploads(data);
        } catch (error) {
            console.error("Error fetching uploads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUploads();
    }, []);

    const handleDelete = async (uploadId: string, fileUrl: string) => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this uploaded file?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'investor_uploads', uploadId));
            try {
                const fileRef = ref(storage, fileUrl);
                await deleteObject(fileRef);
            } catch (err) {
                console.warn("Storage deletion failed", err);
            }
            setUploads(prev => prev.filter(u => u.id !== uploadId));
        } catch (error) {
            console.error("Error deleting upload:", error);
            alert("Error deleting upload.");
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Investor Uploads</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">View and download files securely submitted by investors.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-medium">File Name</th>
                                <th className="p-4 font-medium">Uploaded By</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 font-light">Loading uploads...</td>
                                </tr>
                            ) : uploads.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 font-light">No uploads found.</td>
                                </tr>
                            ) : (
                                uploads.map(upload => {
                                    const date = upload.created_at?.toDate ? upload.created_at.toDate() : new Date(upload.created_at);
                                    
                                    return (
                                        <tr key={upload.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-teal-600 shrink-0" />
                                                    <a href={upload.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 hover:text-teal-600 transition-colors line-clamp-1">
                                                        {upload.file_name}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 font-medium">
                                                {upload.investor_name}
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <a 
                                                    href={upload.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center justify-center mr-1"
                                                    title="Download File"
                                                >
                                                    <Download size={16} />
                                                </a>
                                                <button 
                                                    onClick={() => handleDelete(upload.id, upload.file_url)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                    title="Delete Upload"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminInvestorUploads;
