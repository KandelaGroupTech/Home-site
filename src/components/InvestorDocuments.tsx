import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { PlatformDocument } from '../types';
import { FileText, Download, Filter } from 'lucide-react';

interface Props {
    userUid: string;
}

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    tax:       { label: 'Tax',       color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
    financial: { label: 'Financial', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
    general:   { label: 'General',   color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200' },
    other:     { label: 'Other',     color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
};

const InvestorDocuments: React.FC<Props> = ({ userUid }) => {
    const [documents, setDocuments] = useState<PlatformDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const q = query(collection(db, 'documents'), orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PlatformDocument[];
                const visible = data.filter(d =>
                    d.target_audience === 'all' ||
                    (d.allowed_uids && d.allowed_uids.includes(userUid))
                );
                setDocuments(visible);
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
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-teal-50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-8 bg-teal-600 rounded" />
                        <h1 className="text-3xl font-serif text-slate-800">My Documents</h1>
                    </div>
                    <p className="text-slate-500 font-light pl-4">Secure access to your financial and tax documents.</p>
                </div>

                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm p-1.5 rounded-lg">
                    <Filter size={14} className="text-slate-400 ml-1.5" />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-transparent text-sm text-slate-600 font-light focus:outline-none py-1 pr-2 appearance-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        <option value="tax">Tax Documents</option>
                        <option value="financial">Financial Reports</option>
                        <option value="general">General</option>
                    </select>
                </div>
            </div>

            {/* Category tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {['all', 'tax', 'financial', 'general'].map(cat => {
                    const count = cat === 'all' ? documents.length : documents.filter(d => d.type === cat).length;
                    const cfg = cat === 'all' ? null : typeConfig[cat];
                    return (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`p-3 rounded-xl border text-left transition-all ${filter === cat ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-slate-200 bg-white hover:border-teal-200'}`}
                        >
                            <p className={`text-xs uppercase tracking-wider font-medium ${filter === cat ? 'text-teal-700' : 'text-slate-500'}`}>
                                {cat === 'all' ? 'All Files' : cfg?.label}
                            </p>
                            <p className={`text-2xl font-serif mt-1 ${filter === cat ? 'text-teal-800' : 'text-slate-700'}`}>{count}</p>
                        </button>
                    );
                })}
            </div>

            {filteredDocs.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-teal-100 rounded-2xl bg-white">
                    <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-teal-400" size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-400 font-light">No documents in this category.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredDocs.map(doc => {
                        const cfg = typeConfig[doc.type] || typeConfig.other;
                        const date = doc.created_at
                            ? new Date(doc.created_at?.toDate ? doc.created_at.toDate() : doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '';
                        return (
                            <div
                                key={doc.id}
                                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-teal-300 hover:shadow-[0_2px_12px_rgba(0,100,100,0.1)] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                                        <FileText size={18} className={cfg.color} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-medium text-sm">{doc.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-slate-400">{date}</span>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all"
                                >
                                    <Download size={18} />
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InvestorDocuments;
