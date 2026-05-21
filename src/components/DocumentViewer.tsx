import React, { useState } from 'react';
import { PlatformDocument } from '../types';
import { Folder, FolderOpen, FileText, Download, CheckSquare, Square, Search, ZoomIn, ZoomOut } from 'lucide-react';

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
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents, loading, pageTitle, pageSubtitle, categories }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<PlatformDocument | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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
    let displayedDocs = documents;
    if (currentCat) {
        displayedDocs = documents.filter(d => currentCat.types.includes(d.type));
    }
    if (showUnreadOnly) {
        // Assume read_by is populated, if not, treat all as unread for now (just simulating)
        displayedDocs = displayedDocs.filter(d => !d.read_by || d.read_by.length === 0);
    }

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

    const handleDownloadSelected = () => {
        const toDownload = displayedDocs.filter(d => selectedIds.has(d.id));
        toDownload.forEach(doc => {
            window.open(doc.file_url, '_blank');
        });
    };

    return (
        <div className="max-w-6xl w-full h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">{pageTitle}</h1>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex gap-5 overflow-hidden">
                
                {/* LEFT PANE: Folders / Documents */}
                <div className="w-[450px] flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden shrink-0">
                    
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
                            disabled={selectedIds.size === 0}
                            className="text-xs font-semibold uppercase text-slate-500 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <Download size={14} /> Download Selected
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto">
                        {!activeCategory ? (
                            // Show Folders
                            <div className="divide-y divide-slate-100">
                                {categories.map(cat => {
                                    const count = documents.filter(d => cat.types.includes(d.type)).length;
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
                                            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-full group-hover:bg-teal-100 group-hover:text-teal-700">
                                                {count}
                                            </span>
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
                                            const isUnread = !doc.read_by || doc.read_by.length === 0;
                                            const date = doc.created_at ? new Date(doc.created_at?.toDate ? doc.created_at.toDate() : doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                                            
                                            return (
                                                <div 
                                                    key={doc.id}
                                                    onClick={() => setSelectedDoc(doc)}
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
                <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-inner">
                    {selectedDoc ? (
                        <>
                            <div className="bg-slate-800 text-white p-2.5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <Search size={16} className="text-slate-400" />
                                    <span className="text-sm font-medium truncate max-w-md">{selectedDoc.title}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <button className="hover:text-white"><ZoomOut size={16} /></button>
                                    <button className="hover:text-white"><ZoomIn size={16} /></button>
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
                                <a 
                                    href={selectedDoc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black text-white hover:bg-slate-800 transition-colors px-8 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg"
                                >
                                    <Download size={16} /> Download
                                </a>
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
