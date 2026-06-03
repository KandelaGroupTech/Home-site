import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Announcement } from '../types';
import { Mail, Calendar, Paperclip, Download, Inbox, User } from 'lucide-react';

const STORAGE_KEY = 'tkg_read_announcements';

const getReadIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const markAsRead = (id: string) => {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
};

const InvestorFeed: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);
    const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const user = getAuth().currentUser;
                if (!user) return;

                const qAll = query(collection(db, 'announcements'), where('target_audience', '==', 'all'));
                const qCustom = query(collection(db, 'announcements'), where('allowed_uids', 'array-contains', user.uid));

                const [snapAll, snapCustom] = await Promise.all([getDocs(qAll), getDocs(qCustom)]);

                const allDocs = [...snapAll.docs, ...snapCustom.docs];
                const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.id, doc])).values());

                const data = uniqueDocs
                    .map(doc => ({ id: doc.id, ...doc.data() }) as Announcement)
                    .sort((a, b) => {
                        const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
                        const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
                        return timeB - timeA;
                    });

                setAnnouncements(data);
                if (data.length > 0) {
                    setSelected(data[0].id);
                    markAsRead(data[0].id);
                    setReadIds(getReadIds());
                }
            } catch (error) {
                console.error('Error fetching announcements', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const handleSelect = useCallback((id: string) => {
        setSelected(id);
        markAsRead(id);
        setReadIds(getReadIds());
    }, []);

    const selectedAnn = announcements.find(a => a.id === selected) ?? null;
    const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

    const formatDate = (ts: any) =>
        ts
            ? new Date(ts?.toDate ? ts.toDate() : ts).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '';

    const formatShortDate = (ts: any) => {
        if (!ts) return '';
        const d = new Date(ts?.toDate ? ts.toDate() : ts);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getPreview = (content: string) => {
        const plain = content.replace(/<[^>]+>/g, '');
        return plain.length > 80 ? plain.slice(0, 80) + '…' : plain;
    };

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
        <div className="flex flex-col h-full">
            {/* Page header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Communications</h1>
                    {unreadCount > 0 && (
                        <span className="ml-1 bg-teal-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
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
                <div className="flex gap-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm" style={{ minHeight: '520px' }}>

                    {/* ── Left pane: message list ── */}
                    <div className="w-80 flex-shrink-0 border-r border-slate-200 flex flex-col">
                        {/* Inbox label */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                            <Inbox size={15} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbox</span>
                            {unreadCount > 0 && (
                                <span className="ml-auto bg-teal-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Message rows */}
                        <div className="overflow-y-auto flex-1">
                            {announcements.map(ann => {
                                const isSelected = selected === ann.id;
                                const isRead = readIds.has(ann.id);
                                return (
                                    <button
                                        key={ann.id}
                                        onClick={() => handleSelect(ann.id)}
                                        className={`w-full text-left px-4 py-3.5 border-b border-slate-100 transition-colors relative
                                            ${isSelected
                                                ? 'bg-teal-50 border-l-2 border-l-teal-500'
                                                : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                                            }`}
                                    >
                                        {/* Unread dot */}
                                        {!isRead && (
                                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" />
                                        )}
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className={`text-sm truncate pr-1 ${!isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                {ann.title}
                                            </p>
                                            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                                                {formatShortDate(ann.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-light truncate">
                                            {getPreview(ann.content)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right pane: reading area ── */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {selectedAnn ? (
                            <>
                                {/* Message header */}
                                <div className="px-8 py-5 border-b border-slate-100 bg-white">
                                    <h2 className="text-xl font-semibold text-slate-800 mb-3">{selectedAnn.title}</h2>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center">
                                                <User size={13} className="text-white" />
                                            </div>
                                            <span className="text-sm text-slate-600 font-medium">{selectedAnn.author_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={13} />
                                            <span className="text-sm font-light">{formatDate(selectedAnn.created_at)}</span>
                                        </div>
                                        {selectedAnn.attachments && selectedAnn.attachments.length > 0 && (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Paperclip size={13} />
                                                <span className="text-sm font-light">{selectedAnn.attachments.length} attachment{selectedAnn.attachments.length !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message body */}
                                <div className="flex-1 overflow-y-auto px-8 py-6">
                                    <p className="text-slate-600 font-light leading-relaxed whitespace-pre-wrap text-sm">
                                        {selectedAnn.content}
                                    </p>

                                    {/* Attachments */}
                                    {selectedAnn.attachments && selectedAnn.attachments.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Paperclip size={13} /> Attached Documents
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedAnn.attachments.map((att, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={att.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-teal-600 transition-colors">
                                                                <Paperclip size={14} />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-medium text-slate-700 truncate">{att.name}</p>
                                                                <p className="text-xs text-slate-400">{Math.round(att.size / 1024)} KB</p>
                                                            </div>
                                                        </div>
                                                        <Download size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors flex-shrink-0 ml-2" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                                <Mail size={40} strokeWidth={1} />
                                <p className="mt-3 text-sm font-light">Select a message to read</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestorFeed;
