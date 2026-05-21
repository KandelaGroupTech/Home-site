import React from 'react';
import { UserRole } from '../types';
import {
    LayoutDashboard,
    FileText,
    Inbox,
    User as UserIcon,
    Users,
    Upload,
    Megaphone,
    LogOut,
    Home,
    FolderClosed,
    HelpCircle,
    Globe,
    FileText
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
    role: UserRole | undefined;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab }) => {
    const handleLogout = async () => {
        await signOut(auth);
    };

    const investorNav = [
        { id: 'welcome', label: 'Welcome', icon: Home },
        { id: 'documents', label: 'Documents', icon: FolderClosed },
        { id: 'tax-documents', label: 'Tax Documents', icon: FolderClosed },
        { id: 'faq', label: 'FAQ', icon: HelpCircle },
        { id: 'contact', label: 'Contact Us', icon: Globe },
    ];

    const adminNav = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload Documents', icon: Upload },
        { id: 'manage-documents', label: 'Manage Documents', icon: FileText },
        { id: 'announcements', label: 'Communications', icon: Megaphone },
        { id: 'directory', label: 'Investor Directory', icon: Users },
    ];

    const navItems = role === 'admin' ? adminNav : investorNav;

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col" style={{ background: 'linear-gradient(160deg, #0a4040 0%, #064e4e 60%, #053a3a 100%)' }}>
            {/* Geometric accent shape inside sidebar */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-10 -right-8 w-40 h-48 bg-white/5"
                    style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 70%, 0% 100%)' }}
                />
                <div
                    className="absolute bottom-0 left-0 w-full h-32 bg-black/10"
                    style={{ clipPath: 'polygon(0 40%, 100% 100%, 0 100%)' }}
                />
            </div>

            {/* Logo */}
            <div className="relative z-10 px-6 py-7 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded flex items-center justify-center border border-white/20 shadow-inner">
                        <span className="font-serif text-white font-bold text-xl leading-none">K</span>
                    </div>
                    <div>
                        <p className="font-serif text-white text-base tracking-widest leading-tight">THE KANDELA GROUP</p>
                        <p className="text-[9px] text-teal-300/80 tracking-[0.2em] uppercase mt-0.5">
                            {role === 'admin' ? 'Admin Portal' : 'Investor Portal'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] px-3 mb-3 font-medium">
                    {role === 'admin' ? 'Admin Tools' : 'Navigation'}
                </p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-200 ${
                                isActive
                                    ? 'bg-white text-teal-800 shadow-md font-medium'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Icon size={17} className={isActive ? 'text-teal-700' : 'text-white/50'} strokeWidth={isActive ? 2 : 1.5} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="relative z-10 p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                    <LogOut size={17} strokeWidth={1.5} />
                    Secure Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
