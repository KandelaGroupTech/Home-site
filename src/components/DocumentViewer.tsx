import React, { useState, useEffect } from 'react';
import { PlatformDocument } from '../types';
import { Folder, FolderOpen, FileText, Download, CheckSquare, Square, Search, ZoomIn, ZoomOut, ChevronLeft, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

interface Category {
    key: string;
    label: string;
    types: string[]; // which doc types map to this category
}

interface DocumentViewerProps {
    documents: PlatformDocument[];
    loading: boolean;
    pageTitle: string;
    pageSubtitle: string;
    categories: Category[];
    userUid: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents, loading, pageTitle, pageSubtitle, categories, userUid }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<PlatformDocument | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [localDocs, setLocalDocs] = useState<PlatformDocument[]>(documents);
    const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

    useEffect(() => {
        setLocalDocs(documents);
    }, [documents]);

    if (loading) {
        return (
            <div className="w-full flex gap-4 h-[600px]">
                <div className="w-1/4 bg-white border border-slate-200 rounded-xl p-4 animate-pulse"></div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 animate-pulse"></div>
            </div>
        );
    }

    const currentCat = categories.find(c => c.key === activeCategory);
    
    // Filter docs based on active category and unread toggle
    let displayedDocs = localDocs;
    if (currentCat) {
        displayedDocs = localDocs.filter(d => currentCat.types.includes(d.type));
    }
    if (showUnreadOnly) {
        displayedDocs = displayedDocs.filter(d => !d.read_by || !d.read_by.includes(userUid));
    }

    const handleSelectDoc = async (d: PlatformDocument) => {
        setSelectedDoc(d);
        if (!d.read_by || !d.read_by.includes(userUid)) {
            // Optimistically update local state
            setLocalDocs(prev => prev.map(p => {
                if (p.id === d.id) {
                    return { ...p, read_by: [...(p.read_by || []), userUid] };
                }
                return p;
            }));
            
            // Update Firestore
            try {
                const docRef = doc(db, 'documents', d.id);
                await updateDoc(docRef, {
                    read_by: arrayUnion(userUid)
                });
            } catch (err) {
                console.error("Error updating read status", err);
            }
        }
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === displayedDocs.length && displayedDocs.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedDocs.map(d => d.id)));
        }
    };

    const handleWatermarkDownload = async (docObj: PlatformDocument) => {
        const user = getAuth().currentUser;
        const email = user?.email || 'Confidential';

        try {
            setDownloadingDoc(docObj.id);
            const existingPdfBytes = await fetch(docObj.file_url).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            const pages = pdfDoc.getPages();
            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(email, {
                    x: width / 6,
                    y: height / 2,
                    size: 40,
                    font,
                    color: rgb(0.8, 0.8, 0.8),
                    opacity: 0.3,
                    rotate: degrees(45),
                });
            }
            
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = docObj.title.endsWith('.pdf') ? docObj.title : `${docObj.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Watermark failed, falling back to direct download", err);
            window.open(docObj.file_url, '_blank');
        } finally {
            setDownloadingDoc(null);
        }
    };

    const handleDownloadSelected = () => {
        const toDownload = displayedDocs.filter(d => selectedIds.has(d.id));
        toDownload.forEach(doc => {
            handleWatermarkDownload(doc);
        });
    };

    return (
        <div className="max-w-6xl w-full h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">{pageTitle}</h1>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-5 overflow-hidden">
                
                {/* LEFT PANE: Folders / Documents */}
                <div className={`w-full md:w-[450px] flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden shrink-0 ${selectedDoc ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Toolbar */}
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={toggleAll} className="text-slate-400 hover:text-teal-600">
                                {selectedIds.size > 0 && selectedIds.size === displayedDocs.length ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                            <button 
                                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1.5 ${showUnreadOnly ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                UNREAD
                            </button>
                        </div>
                        <button 
                            onClick={handleDownloadSelected}
                            disabled={selectedIds.size === 0 || downloadingDoc !== null}
                            className="text-xs font-semibold uppercase text-slate-500 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            {downloadingDoc ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download Selected
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto">
                        {!activeCategory ? (
                            // Show Folders
                            <div className="divide-y divide-slate-100">
                                {categories.map(cat => {
                                    const catDocs = localDocs.filter(d => cat.types.includes(d.type));
                                    const count = catDocs.length;
                                    const unreadCount = catDocs.filter(d => !d.read_by || !d.read_by.includes(userUid)).length;
                                    
                                    return (
                                        <button 
                                            key={cat.key}
                                            onClick={() => setActiveCategory(cat.key)}
                                            className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-teal-50/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 text-slate-700 group-hover:text-teal-800">
                                                <Folder size={20} className="text-slate-400 group-hover:text-teal-500" />
                                                <span className="font-medium">{cat.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <span className="text-xs font-semibold bg-teal-500 text-white px-2 py-0.5 rounded-full">
                                                        {unreadCount} New
                                                    </span>
                                                )}
                                                <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-full group-hover:bg-teal-100 group-hover:text-teal-700">
                                                    {count}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            // Show Documents in Category
                            <div>
                                <div className="px-3 py-2 bg-slate-100/50 text-xs font-medium text-slate-500 flex items-center gap-2 cursor-pointer hover:text-teal-700" onClick={() => { setActiveCategory(null); setSelectedDoc(null); }}>
                                    <FolderOpen size={14} /> {currentCat?.label} (Back)
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {displayedDocs.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm font-light">No documents found.</div>
                                    ) : (
                                        displayedDocs.map(doc => {
                                            const isSelectedDoc = selectedDoc?.id === doc.id;
                                            const isChecked = selectedIds.has(doc.id);
                                            const isUnread = !doc.read_by || !doc.read_by.includes(userUid);
                                            const date = doc.created_at ? new Date(doc.created_at?.toDate ? doc.created_at.toDate() : doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                                            
                                            return (
                                                <div 
                                                    key={doc.id}
                                                    onClick={() => handleSelectDoc(doc)}
                                                    className={`w-full text-left px-3 py-3 flex items-start gap-3 cursor-pointer transition-colors ${isSelectedDoc ? 'bg-teal-50/80 border-l-2 border-teal-500' : 'hover:bg-slate-50 border-l-2 border-transparent'}`}
                                                >
                                                    <div className="pt-0.5" onClick={e => toggleSelection(doc.id, e)}>
                                                        {isChecked ? <CheckSquare size={16} className="text-teal-600" /> : <Square size={16} className="text-slate-300" />}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>}
                                                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{date}</span>
                                                        </div>
                                                        <p className={`text-sm truncate ${isSelectedDoc ? 'text-teal-900 font-medium' : 'text-slate-700'}`}>{doc.title}</p>
                                                    </div>
                                                    <FileText size={16} className={isSelectedDoc ? 'text-teal-600' : 'text-slate-400'} />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANE: Document Preview */}
                <div className={`flex-1 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex-col ${!selectedDoc ? 'hidden md:flex' : 'flex'}`}>
                    {selectedDoc ? (
                        <>
                            <div className="h-16 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 md:px-6 shrink-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button onClick={() => setSelectedDoc(null)} className="md:hidden p-1 -ml-1 text-slate-400 hover:text-teal-600 transition-colors">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <h2 className="font-medium text-slate-800 text-base md:text-lg truncate pr-4">{selectedDoc.title}</h2>
                                </div>
                            </div>
                            <div className="flex-1 relative w-full h-full bg-slate-300">
                                <iframe 
                                    src={`${selectedDoc.file_url}#toolbar=0`} 
                                    className="absolute inset-0 w-full h-full border-none"
                                    title={selectedDoc.title}
                                />
                            </div>
                            <div className="bg-white p-4 border-t border-slate-200 flex justify-center shrink-0">
                                <button 
                                    onClick={() => handleWatermarkDownload(selectedDoc)}
                                    disabled={downloadingDoc === selectedDoc.id}
                                    className="bg-black text-white hover:bg-slate-800 transition-colors px-8 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg disabled:opacity-70"
                                >
                                    {downloadingDoc === selectedDoc.id ? <><Loader2 size={16} className="animate-spin" /> Preparing...</> : <><Download size={16} /> Download</>}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <FileText size={48} className="text-slate-300 mb-4" strokeWidth={1} />
                            <p className="font-light">Select a document to preview</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DocumentViewer;
