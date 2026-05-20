export interface CompanyProfile {
    id: string;
    name: string;
    description: string;
    icon: any; // Lucide icon component
    href: string;
}

export type UserRole = 'admin' | 'investor';
export type AccreditedStatus = 'Accredited' | 'Non-Accredited' | 'Pending Verification';
export type CheckSize = '<$10,000' | '$10,000 - $25,000' | '$25,000 - $50,000' | '$50,000 - $100,000' | '$100,000+';

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone: string;
    address: {
        line1: string;
        line2: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    company: string;
    preferences: {
        openToNewDeals: boolean;
        accreditedStatus: AccreditedStatus | '';
        checkSize: CheckSize | '';
    };
    updatedAt: any; // Firestore Timestamp
}

export interface PlatformDocument {
    id: string;
    title: string;
    type: 'tax' | 'financial' | 'general' | 'other';
    file_url: string;
    target_audience: 'all' | 'specific_users';
    allowed_uids: string[];
    created_at: any; // Firestore Timestamp
}

export interface Announcement {
    id: string;
    title: string;
    content: string; // Could be HTML or rich text
    author_name: string;
    created_at: any; // Firestore Timestamp
}