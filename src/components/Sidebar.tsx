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
    LogOut
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
        { id: 'feed', label: 'Announcements', icon: Inbox },
        { id: 'documents', label: 'My Documents', icon: FileText },
        { id: 'profile', label: 'My Profile', icon: UserIcon },
    ];

    const adminNav = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload Documents', icon: Upload },
        { id: 'announcements', label: 'Manage Communications', icon: Megaphone },
        { id: 'directory', label: 'Investor Directory', icon: Users },
    ];

    const navItems = role === 'admin' ? adminNav : investorNav;

    return (
        <aside className="w-64 h-screen bg-slate-900/40 backdrop-blur-md border-r border-white/10 flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-800 rounded-md shadow-[0_0_15px_rgba(0,100,100,0.4)] flex items-center justify-center">
                    <span className="font-serif text-white font-bold text-lg">K</span>
                </div>
                <div>
                    <h2 className="font-serif text-white text-lg tracking-wide leading-tight">PORTAL</h2>
                    <p className="text-[10px] text-teal-400 font-light tracking-widest uppercase">{role === 'admin' ? 'Admin Access' : 'Investor Access'}</p>
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-300 ${
                                isActive 
                                ? 'bg-teal-900/40 text-white border border-teal-500/30 shadow-[inset_0_0_10px_rgba(0,100,100,0.2)]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Icon size={18} className={isActive ? 'text-teal-400' : 'text-slate-500'} strokeWidth={1.5} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                    <LogOut size={18} strokeWidth={1.5} />
                    Secure Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
