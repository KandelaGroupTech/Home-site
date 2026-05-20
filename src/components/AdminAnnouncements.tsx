import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Send, Check } from 'lucide-react';

interface Props {
    authorName: string;
}

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
                title,
                content,
                author_name: authorName,
                created_at: new Date()
            });
            setSent(true);
            setTitle('');
            setContent('');
            setTimeout(() => setSent(false), 3000);
        } catch (error) {
            console.error("Error posting announcement", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl animate-fade-in">
            <h1 className="text-3xl font-serif text-white mb-2">Post Announcement</h1>
            <p className="text-slate-400 font-light mb-8">Send a message to all investors. This will appear in their feed.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/40 border border-white/5 p-8 rounded-xl backdrop-blur-sm">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Subject / Title</label>
                    <input 
                        type="text" 
                        required
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                        placeholder="e.g., Q3 2026 Platform Update"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Message Content</label>
                    <textarea 
                        required
                        value={content} 
                        onChange={e => setContent(e.target.value)}
                        rows={8}
                        className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light resize-none"
                        placeholder="Type your message here..."
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={sending}
                        className={`flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all ${
                            sent 
                            ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                            : 'bg-teal-700 hover:bg-teal-600 text-white'
                        }`}
                    >
                        {sent ? <><Check size={18} /> Posted Successfully</> : <><Send size={18} /> {sending ? 'Posting...' : 'Post Announcement'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncements;
