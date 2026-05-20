import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile, AccreditedStatus, CheckSize } from '../types';
import { Save, Check } from 'lucide-react';

interface Props {
    userUid: string;
    initialProfile: UserProfile | null;
}

const InvestorProfile: React.FC<Props> = ({ userUid, initialProfile }) => {
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        address: '',
        preferences: {
            openToNewDeals: false,
            accreditedStatus: '',
            checkSize: ''
        }
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name.startsWith('pref_')) {
            const prefName = name.replace('pref_', '');
            let prefValue: any = value;
            
            if (type === 'checkbox') {
                prefValue = (e.target as HTMLInputElement).checked;
            }

            setProfile(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [prefName]: prefValue
                }
            } as Partial<UserProfile>));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userRef = doc(db, 'users', userUid);
            // Merge with existing so we don't accidentally erase role or email
            await setDoc(userRef, {
                ...profile,
                updatedAt: new Date()
            }, { merge: true });
            
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving profile', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl animate-fade-in">
            <h1 className="text-3xl font-serif text-white mb-2">My Profile</h1>
            <p className="text-slate-400 font-light mb-8">Keep your contact information and investment preferences up to date.</p>

            <form onSubmit={handleSave} className="space-y-8 bg-slate-900/40 border border-white/5 p-8 rounded-xl backdrop-blur-sm">
                
                {/* Contact Info */}
                <section>
                    <h2 className="text-lg text-white font-serif mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-teal-500 rounded"></span>
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">First Name</label>
                            <input 
                                type="text" name="firstName" value={profile.firstName || ''} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Last Name</label>
                            <input 
                                type="text" name="lastName" value={profile.lastName || ''} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Company / Entity</label>
                            <input 
                                type="text" name="company" value={profile.company || ''} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Phone</label>
                            <input 
                                type="tel" name="phone" value={profile.phone || ''} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Mailing Address</label>
                            <input 
                                type="text" name="address" value={profile.address || ''} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Preferences */}
                <section>
                    <h2 className="text-lg text-white font-serif mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-teal-500 rounded"></span>
                        Investment Preferences
                    </h2>
                    <div className="space-y-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    name="pref_openToNewDeals" 
                                    checked={profile.preferences?.openToNewDeals || false} 
                                    onChange={handleChange}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border border-slate-600 rounded bg-slate-950 peer-checked:bg-teal-600 peer-checked:border-teal-500 transition-all"></div>
                                <Check size={14} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-sm text-slate-300 font-light group-hover:text-white transition-colors">I am open to seeing new investment opportunities</span>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Accredited Status</label>
                                <select 
                                    name="pref_accreditedStatus" 
                                    value={profile.preferences?.accreditedStatus || ''} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light appearance-none"
                                >
                                    <option value="" disabled>Select Status...</option>
                                    <option value="Accredited">Accredited Investor</option>
                                    <option value="Non-Accredited">Non-Accredited</option>
                                    <option value="Pending Verification">Pending Verification</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Typical Check Size</label>
                                <select 
                                    name="pref_checkSize" 
                                    value={profile.preferences?.checkSize || ''} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light appearance-none"
                                >
                                    <option value="" disabled>Select Range...</option>
                                    <option value="<$10,000">&lt; $10,000</option>
                                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                                    <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                                    <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                                    <option value="$100,000+">$100,000+</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all ${
                            saved 
                            ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                            : 'bg-teal-700 hover:bg-teal-600 text-white'
                        }`}
                    >
                        {saved ? <><Check size={18} /> Saved Successfully</> : <><Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvestorProfile;
