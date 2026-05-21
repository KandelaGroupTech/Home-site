import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { PlatformDocument } from '../types';
import { Trash2, FileText, Search } from 'lucide-react';

const AdminManageDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<PlatformDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'documents'), orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PlatformDocument[];
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleDelete = async (documentId: string, fileUrl: string) => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this document? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            // Delete from Firestore
            await deleteDoc(doc(db, 'documents', documentId));

            // Try to delete from Storage (if URL matches firebase storage pattern)
            try {
                // Firebase storage URLs contain the path encoded in the URL
                // The easiest way is to use ref(storage, url) which works for gs:// or https:// URLs
                const fileRef = ref(storage, fileUrl);
                await deleteObject(fileRef);
            } catch (storageError) {
                console.warn("Could not delete file from storage, it may have already been deleted or is externally hosted:", storageError);
            }

            // Update UI
            setDocuments(prev => prev.filter(d => d.id !== documentId));
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("There was an error deleting the document. Please try again.");
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'financial': return 'Financial Report';
            case 'capital_call': return 'Capital Call';
            case 'distribution': return 'Distribution';
            case 'tax': return 'Tax Document';
            case 'tax_distribution': return 'Tax Distribution';
            case 'general': return 'General';
            default: return type;
        }
    };

    const filteredDocs = documents.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        getTypeLabel(d.type).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Manage Documents</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">View and delete documents that have been sent out.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="relative w-72">
                        <input 
                            type="text" 
                            placeholder="Search documents..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Total: {filteredDocs.length}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-medium">Document</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Visibility</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-light">Loading documents...</td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-light">No documents found.</td>
                                </tr>
                            ) : (
                                filteredDocs.map(doc => {
                                    const date = doc.created_at?.toDate ? doc.created_at.toDate() : new Date(doc.created_at);
                                    
                                    return (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-teal-600 shrink-0" />
                                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 hover:text-teal-600 transition-colors line-clamp-1">
                                                        {doc.title}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {getTypeLabel(doc.type)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.target_audience === 'all' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                    {doc.target_audience === 'all' ? 'All Investors' : `${doc.allowed_uids?.length || 0} Investors`}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(doc.id, doc.file_url)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                    title="Delete Document"
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

export default AdminManageDocuments;
