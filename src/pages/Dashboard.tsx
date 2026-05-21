import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

import InvestorWelcome from '../components/InvestorWelcome';
import InvestorDocuments from '../components/InvestorDocuments';
import InvestorTaxDocuments from '../components/InvestorTaxDocuments';
import InvestorFAQ from '../components/InvestorFAQ';
import InvestorContact from '../components/InvestorContact';
import InvestorProfile from '../components/InvestorProfile';

import AdminDashboard from '../components/AdminDashboard';
import AdminDocumentUpload from '../components/AdminDocumentUpload';
import AdminAnnouncements from '../components/AdminAnnouncements';
import AdminDirectory from '../components/AdminDirectory';

const Dashboard: React.FC = () => {
    const { user, profile, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<string>('welcome');

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                    <p className="text-teal-700 font-light text-sm tracking-widest uppercase">Loading Portal</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const role = profile?.role || 'investor';

    if (role === 'admin' && ['welcome', 'documents', 'tax-documents', 'faq', 'contact'].includes(activeTab)) {
        setActiveTab('overview');
    } else if (role === 'investor' && ['overview', 'upload', 'announcements', 'directory'].includes(activeTab)) {
        setActiveTab('welcome');
    }

    const renderContent = () => {
        if (role === 'admin') {
            switch (activeTab) {
                case 'overview': return <AdminDashboard />;
                case 'upload': return <AdminDocumentUpload />;
                case 'announcements': return <AdminAnnouncements authorName={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Admin'} />;
                case 'directory': return <AdminDirectory />;
                default: return null;
            }
        } else {
            switch (activeTab) {
                case 'welcome': return <InvestorWelcome profile={profile} setActiveTab={setActiveTab} />;
                case 'documents': return <InvestorDocuments userUid={user.uid} />;
                case 'tax-documents': return <InvestorTaxDocuments userUid={user.uid} />;
                case 'faq': return <InvestorFAQ />;
                case 'contact': return <InvestorContact profile={profile} />;
                case 'profile': return <InvestorProfile userUid={user.uid} initialProfile={profile} />;
                default: return null;
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#f4f9f8]">
            <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
                {/* Geometric brand-inspired decorative shapes */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Large angular teal plane - top right */}
                    <div
                        className="absolute -top-24 right-0 w-[520px] h-[380px] bg-teal-700/10"
                        style={{ clipPath: 'polygon(100% 0, 100% 80%, 30% 100%, 60% 0)' }}
                    />
                    {/* Secondary angular plane */}
                    <div
                        className="absolute -top-10 right-32 w-[340px] h-[280px] bg-teal-600/8"
                        style={{ clipPath: 'polygon(70% 0, 100% 60%, 40% 100%, 0 30%)' }}
                    />
                    {/* Bottom left light burst */}
                    <div className="absolute bottom-0 left-0 w-80 h-64 bg-gradient-to-tr from-white via-teal-50/60 to-transparent" />
                    {/* Bottom right accent */}
                    <div
                        className="absolute bottom-0 right-0 w-[280px] h-[200px] bg-teal-700/6"
                        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 40% 20%)' }}
                    />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto py-10 px-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
