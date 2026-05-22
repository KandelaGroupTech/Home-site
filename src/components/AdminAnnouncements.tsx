import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Send, Check, Trash2, Megaphone } from 'lucide-react';

interface Props { authorName: string; }

const fieldClass = "w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light text-sm placeholder:text-slate-300";

const AdminAnnouncements: React.FC<Props> = ({ authorName }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(data);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await deleteDoc(doc(db, 'announcements', id));
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

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

            {/* Sent Announcements List */}
            <div className="mt-12">
                <h2 className="text-xl font-serif text-slate-800 mb-6 flex items-center gap-2">
                    <Megaphone size={20} className="text-teal-600" />
                    Sent Announcements
                </h2>
                
                {announcements.length === 0 ? (
                    <p className="text-slate-500 font-light italic">No announcements sent yet.</p>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                <button 
                                    onClick={() => handleDelete(announcement.id)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-50"
                                    title="Delete announcement"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <h3 className="font-medium text-slate-800 mb-1 pr-10">{announcement.title}</h3>
                                <p className="text-sm text-slate-500 font-light mb-3">
                                    {announcement.created_at?.toDate ? new Date(announcement.created_at.toDate()).toLocaleDateString() : 'Just now'} • Signed by {announcement.author_name}
                                </p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{announcement.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;
