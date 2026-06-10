import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { PlatformDocument } from '../types';
import { Trash2, FileText, Search, Eye, X } from 'lucide-react';

const AdminManageDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<PlatformDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [usersMap, setUsersMap] = useState<Record<string, any>>({});
    const [viewingReceipts, setViewingReceipts] = useState<PlatformDocument | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsSnap, usersSnap] = await Promise.all([
                getDocs(query(collection(db, 'documents'), orderBy('created_at', 'desc'))),
                getDocs(collection(db, 'users'))
            ]);
            
            const data = docsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as PlatformDocument[];
            setDocuments(data);
            
            const umap: Record<string, any> = {};
            usersSnap.docs.forEach(d => {
                umap[d.id] = d.data();
            });
            setUsersMap(umap);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
                                                    {doc.target_audience === 'all' ? 'All Investors' : doc.target_audience === 'groups' && doc.allowed_groups?.length ? `Groups: ${doc.allowed_groups.join(', ')}` : `${doc.allowed_uids?.length || 0} Investors`}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => setViewingReceipts(doc)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center mr-1"
                                                    title="View Read Receipts"
                                                >
                                                    <Eye size={16} />
                                                </button>
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

            {viewingReceipts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-5 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-serif text-slate-800">Read Receipts</h3>
                                <p className="text-xs text-slate-500 line-clamp-1">{viewingReceipts.title}</p>
                            </div>
                            <button onClick={() => setViewingReceipts(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                            {(!viewingReceipts.read_by || Object.keys(viewingReceipts.read_by).length === 0) ? (
                                <div className="text-center py-8">
                                    <Eye size={32} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No views yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Investors haven't opened this document.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(viewingReceipts.read_by).sort(([, dateA], [, dateB]) => new Date(dateB as string).getTime() - new Date(dateA as string).getTime()).map(([uid, isoDate]) => {
                                        const user = usersMap[uid];
                                        const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
                                        const email = user ? user.email : uid;
                                        const date = new Date(isoDate as string);
                                        
                                        return (
                                            <div key={uid} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{name}</p>
                                                    <p className="text-xs text-slate-500">{email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-medium text-slate-700">{date.toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-slate-400">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageDocuments;
