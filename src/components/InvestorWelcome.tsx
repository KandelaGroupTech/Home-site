import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Announcement, UserProfile } from '../types';
import { Mail, Calendar, ChevronDown, ChevronUp, User } from 'lucide-react';

interface Props {
    profile: UserProfile | null;
    setActiveTab: (tab: string) => void;
}

const InvestorWelcome: React.FC<Props> = ({ profile, setActiveTab }) => {
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
                if (data.length > 0) setExpanded(data[0].id);
            } catch (error) {
                console.error("Error fetching announcements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-8 bg-teal-600 rounded" />
                        <h1 className="text-3xl font-serif text-slate-800">Welcome, {profile?.firstName || 'Investor'}</h1>
                    </div>
                    <p className="text-slate-500 font-light pl-4 text-sm md:text-base">Here are the latest updates from The Kandela Group.</p>
                </div>
                
                <button 
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 px-4 py-2 rounded-full text-sm font-medium text-slate-600 transition-all shadow-sm w-full md:w-auto"
                >
                    <User size={16} className="text-teal-600" />
                    Edit Profile
                </button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button onClick={() => setActiveTab('documents')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3 text-teal-600">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    </div>
                    <p className="font-semibold text-slate-800">Documents</p>
                    <p className="text-xs text-slate-400 mt-1">Capital calls & distributions</p>
                </button>
                <button onClick={() => setActiveTab('tax-documents')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 text-amber-600">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    </div>
                    <p className="font-semibold text-slate-800">Tax Documents</p>
                    <p className="text-xs text-slate-400 mt-1">K-1s & tax forms</p>
                </button>
                <button onClick={() => setActiveTab('faq')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 text-blue-600">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                    </div>
                    <p className="font-semibold text-slate-800">FAQ</p>
                    <p className="text-xs text-slate-400 mt-1">Answers & guidance</p>
                </button>
                <button onClick={() => setActiveTab('contact')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-left">
                    <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center mb-3 text-violet-600">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <p className="font-semibold text-slate-800">Contact Us</p>
                    <p className="text-xs text-slate-400 mt-1">Get in touch with support</p>
                </button>
            </div>

    );
};

export default InvestorWelcome;
