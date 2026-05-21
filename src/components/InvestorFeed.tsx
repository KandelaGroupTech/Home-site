import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Announcement } from '../types';
import { Mail, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const InvestorFeed: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
                setAnnouncements(data);
                if (data.length > 0) setExpanded(data[0].id); // open newest by default
            } catch (error) {
                console.error("Error fetching announcements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-teal-50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Page header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Communications</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Latest updates and announcements from The Kandela Group.</p>
            </div>

            {announcements.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-teal-100 rounded-2xl bg-white">
                    <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="text-teal-400" size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-400 font-light">Your inbox is empty.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann, index) => {
                        const isOpen = expanded === ann.id;
                        const date = ann.created_at
                            ? new Date(ann.created_at?.toDate ? ann.created_at.toDate() : ann.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : '';
                        return (
                            <div
                                key={ann.id}
                                className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-teal-300 shadow-[0_4px_20px_rgba(0,100,100,0.12)]' : 'border-slate-200 hover:border-teal-200 shadow-sm'}`}
                            >
                                {/* Header row - always visible */}
                                <button
                                    onClick={() => setExpanded(isOpen ? null : ann.id)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isOpen ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'}`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-slate-800 font-medium">{ann.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Calendar size={11} className="text-slate-400" />
                                                <span className="text-xs text-slate-400 font-light">{date}</span>
                                                <span className="text-slate-300">·</span>
                                                <span className="text-xs text-slate-400 font-light">{ann.author_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}>
                                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </button>

                                {/* Expanded content */}
                                {isOpen && (
                                    <div className="px-5 pb-5">
                                        <div className="border-t border-slate-100 pt-4">
                                            <p className="text-slate-600 font-light leading-relaxed whitespace-pre-wrap text-sm">{ann.content}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InvestorFeed;
