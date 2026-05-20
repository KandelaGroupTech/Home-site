import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

import InvestorFeed from '../components/InvestorFeed';
import InvestorDocuments from '../components/InvestorDocuments';
import InvestorProfile from '../components/InvestorProfile';

import AdminDashboard from '../components/AdminDashboard';
import AdminDocumentUpload from '../components/AdminDocumentUpload';
import AdminAnnouncements from '../components/AdminAnnouncements';
import AdminDirectory from '../components/AdminDirectory';

const Dashboard: React.FC = () => {
    const { user, profile, loading } = useAuth();
    
    // Default tabs based on role
    const [activeTab, setActiveTab] = useState<string>('feed');

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-800 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return null; // ProtectedRoute will catch this and redirect
    }

    const role = profile?.role || 'investor';

    // Ensure tab matches role
    if (role === 'admin' && ['feed', 'documents', 'profile'].includes(activeTab)) {
        setActiveTab('overview');
    } else if (role === 'investor' && ['overview', 'upload', 'announcements', 'directory'].includes(activeTab)) {
        setActiveTab('feed');
    }

    const renderContent = () => {
        if (role === 'admin') {
            switch (activeTab) {
                case 'overview': return <AdminDashboard />;
                case 'upload': return <AdminDocumentUpload />;
                case 'announcements': return <AdminAnnouncements authorName={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Admin'} />;
                case 'directory': return <AdminDirectory />;
                default: return <div className="p-8 text-white">Select a tab</div>;
            }
        } else {
            switch (activeTab) {
                case 'feed': return <InvestorFeed />;
                case 'documents': return <InvestorDocuments userUid={user.uid} />;
                case 'profile': return <InvestorProfile userUid={user.uid} initialProfile={profile} />;
                default: return <div className="p-8 text-white">Select a tab</div>;
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex">
            <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 ml-64 min-h-screen bg-slate-950 relative">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal-900/10 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 max-w-6xl mx-auto py-10 px-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
