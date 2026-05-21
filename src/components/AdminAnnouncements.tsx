import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Send, Check } from 'lucide-react';

interface Props { authorName: string; }

const fieldClass = "w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light text-sm placeholder:text-slate-300";

const AdminAnnouncements: React.FC<Props> = ({ authorName }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await addDoc(collection(db, 'announcements'), {
                title, content, author_name: authorName, created_at: new Date()
            });
            setSent(true); setTitle(''); setContent('');
            setTimeout(() => setSent(false), 3000);
        } catch (e) { console.error(e); } finally { setSending(false); }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Post Announcement</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Broadcast a message to all investors. It will appear in their communications feed.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Subject / Title</label>
                    <input
                        type="text" required value={title} onChange={e => setTitle(e.target.value)}
                        className={fieldClass} placeholder="e.g., Q3 2026 Platform Update"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Message</label>
                    <textarea
                        required value={content} onChange={e => setContent(e.target.value)}
                        rows={8} className={fieldClass + ' resize-none'}
                        placeholder="Write your message here..."
                    />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400">Signed: <span className="text-slate-600">{authorName}</span></p>
                    <button
                        type="submit" disabled={sending}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            sent ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-teal-700 hover:bg-teal-600 text-white'
                        }`}
                    >
                        {sent ? <><Check size={16} /> Posted!</> : <><Send size={16} /> {sending ? 'Posting...' : 'Post Announcement'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncements;
