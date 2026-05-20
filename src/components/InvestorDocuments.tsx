import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { PlatformDocument } from '../types';
import { FileText, Download, Filter } from 'lucide-react';

interface Props {
    userUid: string;
}

const InvestorDocuments: React.FC<Props> = ({ userUid }) => {
    const [documents, setDocuments] = useState<PlatformDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                // Since Firestore queries with 'OR' conditions on arrays require specialized setup or multiple queries,
                // and our rules restrict what they can read anyway, we fetch and filter locally for simplicity 
                // in this initial portal. (In a massive app, you'd structure this differently).
                const q = query(collection(db, 'documents'), orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as PlatformDocument[];

                // Filter down to only docs meant for 'all' or specifically this user
                const visibleDocs = data.filter(d => 
                    d.target_audience === 'all' || 
                    (d.allowed_uids && d.allowed_uids.includes(userUid))
                );

                setDocuments(visibleDocs);
            } catch (error) {
                console.error("Error fetching documents", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [userUid]);

    const filteredDocs = filter === 'all' ? documents : documents.filter(d => d.type === filter);

    if (loading) {
        return <div className="animate-pulse flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-900/50 rounded-lg"></div>)}
        </div>;
    }

    return (
        <div className="max-w-5xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2">My Documents</h1>
                    <p className="text-slate-400 font-light">Secure access to your tax, financial, and platform documents.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 p-1 rounded-lg">
                    <Filter size={14} className="text-slate-500 ml-2" />
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent text-sm text-slate-300 font-light focus:outline-none p-2 appearance-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        <option value="tax">Tax Documents</option>
                        <option value="financial">Financial Reports</option>
                        <option value="general">General</option>
                    </select>
                </div>
            </div>

            {filteredDocs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-xl bg-slate-900/20">
                    <FileText className="mx-auto text-slate-600 mb-4" size={48} strokeWidth={1} />
                    <p className="text-slate-400 font-light">No documents available in this category.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/50 hover:bg-slate-900/80 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg border ${
                                    doc.type === 'tax' ? 'bg-amber-900/20 border-amber-500/20 text-amber-500' :
                                    doc.type === 'financial' ? 'bg-blue-900/20 border-blue-500/20 text-blue-500' :
                                    'bg-slate-800/50 border-white/10 text-slate-300'
                                }`}>
                                    <FileText size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{doc.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                                            {doc.type}
                                        </span>
                                        <span className="text-xs text-slate-500 font-light">
                                            {doc.created_at ? new Date(doc.created_at?.toDate ? doc.created_at.toDate() : doc.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <a 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-3 text-slate-400 hover:text-teal-400 hover:bg-teal-900/20 rounded-lg transition-colors border border-transparent hover:border-teal-500/30"
                            >
                                <Download size={20} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestorDocuments;
