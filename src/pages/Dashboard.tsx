import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, LogOut, Download } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    file_url: string;
    created_at: string;
}

const Dashboard: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#006464] rounded-full flex items-center justify-center">
                            <span className="font-serif text-white font-bold">K</span>
                        </div>
                        <span className="font-light tracking-widest text-sm">CLIENT PORTAL</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut size={16} />
                        LOGOUT
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-serif text-white mb-2">Your Documents</h1>
                <p className="text-slate-400 mb-8 font-light">Securely access your financial reports and statements.</p>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-lg bg-slate-900/20">
                        <FileText className="mx-auto text-slate-600 mb-3" size={48} strokeWidth={1} />
                        <p className="text-slate-400">No documents found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-slate-900/50 border border-white/5 rounded-lg p-4 flex items-center justify-between hover:border-[#006464]/50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-950 rounded border border-white/10 text-[#006464]">
                                        <FileText size={24} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{doc.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all"
                                    title="Download"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
