import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Announcement } from '../types';
import { Mail, Calendar } from 'lucide-react';

const InvestorFeed: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Announcement[];
                setAnnouncements(data);
            } catch (error) {
                console.error("Error fetching announcements", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    if (loading) {
        return <div className="animate-pulse flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-900/50 rounded-lg"></div>)}
        </div>;
    }

    return (
        <div className="max-w-4xl animate-fade-in">
            <h1 className="text-3xl font-serif text-white mb-2">Communications Feed</h1>
            <p className="text-slate-400 font-light mb-8">Latest updates and announcements from The Kandela Group.</p>

            {announcements.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-xl bg-slate-900/20">
                    <Mail className="mx-auto text-slate-600 mb-4" size={48} strokeWidth={1} />
                    <p className="text-slate-400 font-light">Your inbox is empty.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-xl backdrop-blur-sm hover:border-teal-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl text-white font-medium">{ann.title}</h2>
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-white/5">
                                    <Calendar size={12} />
                                    {ann.created_at ? new Date(ann.created_at?.toDate ? ann.created_at.toDate() : ann.created_at).toLocaleDateString() : ''}
                                </div>
                            </div>
                            
                            {/* Rich text content would be dangerouslySetInnerHTML in a real app if we used a WYSIWYG, 
                                but we'll use standard text rendering with whitespace pre-wrap for now */}
                            <div className="text-slate-300 font-light leading-relaxed whitespace-pre-wrap text-sm">
                                {ann.content}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-teal-400 border border-teal-900">
                                    {ann.author_name.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-500">Posted by {ann.author_name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestorFeed;
