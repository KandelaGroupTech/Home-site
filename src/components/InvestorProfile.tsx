import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Save, Check } from 'lucide-react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import Autocomplete from 'react-google-autocomplete';

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
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        preferences: {
            openToNewDeals: false,
            accreditedStatus: '',
            checkSize: ''
        }
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    // We use a ref to control the input directly for the Autocomplete component 
    // to prevent it from fighting with React state when typing rapidly
    const autocompleteRef = useRef<any>(null);

    useEffect(() => {
        if (initialProfile) {
            // Handle migration if they previously had a string address
            if (typeof initialProfile.address === 'string') {
                setProfile({
                    ...initialProfile,
                    address: {
                        line1: initialProfile.address,
                        line2: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    }
                });
            } else if (initialProfile.address) {
                setProfile(initialProfile);
                if (autocompleteRef.current) {
                    autocompleteRef.current.value = initialProfile.address.line1 || '';
                }
            } else {
                // Address didn't exist at all on initial profile
                setProfile({
                    ...initialProfile,
                    address: { line1: '', line2: '', city: '', state: '', zipCode: '', country: '' }
                });
            }
        }
    }, [initialProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name.startsWith('pref_')) {
            const prefName = name.replace('pref_', '');
            let prefValue: any = value;
            if (type === 'checkbox') prefValue = (e.target as HTMLInputElement).checked;
            setProfile(prev => ({ ...prev, preferences: { ...prev.preferences, [prefName]: prefValue } } as Partial<UserProfile>));
        } else if (name.startsWith('addr_')) {
            const addrName = name.replace('addr_', '');
            setProfile(prev => ({ ...prev, address: { ...(prev.address as any), [addrName]: value } } as Partial<UserProfile>));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePlaceSelected = (place: any) => {
        if (!place.address_components) return;

        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zipCode = '';
        let country = '';

        place.address_components.forEach((component: any) => {
            const types = component.types;
            if (types.includes('street_number')) streetNumber = component.long_name;
            if (types.includes('route')) route = component.long_name;
            if (types.includes('locality') || types.includes('sublocality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.short_name;
            if (types.includes('postal_code')) zipCode = component.long_name;
            if (types.includes('country')) country = component.long_name;
        });

        const line1 = `${streetNumber} ${route}`.trim();

        setProfile(prev => ({
            ...prev,
            address: {
                ...prev.address,
                line1: line1 || (prev.address?.line1 || ''),
                city,
                state,
                zipCode,
                country
            }
        } as Partial<UserProfile>));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userRef = doc(db, 'users', userUid);
            await setDoc(userRef, { ...profile, updatedAt: new Date() }, { merge: true });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving profile', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl animate-fade-in pb-20">
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
                            <input type="text" name="firstName" value={profile.firstName || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Last Name</label>
                            <input type="text" name="lastName" value={profile.lastName || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Company / Entity</label>
                            <input type="text" name="company" value={profile.company || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Phone</label>
                            <div className="bg-slate-950/50 border border-white/10 rounded p-3 focus-within:border-teal-500 transition-colors h-[50px] flex items-center">
                                <PhoneInput
                                    international
                                    defaultCountry="US"
                                    value={profile.phone}
                                    onChange={(val) => setProfile(prev => ({ ...prev, phone: val as string }))}
                                    className="text-white font-light phone-input-custom w-full"
                                    style={{
                                        '--PhoneInput-color--focus': 'transparent',
                                        '--PhoneInputCountryFlag-borderColor': 'transparent',
                                        '--PhoneInputCountrySelectArrow-color': '#94a3b8'
                                    } as React.CSSProperties}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Mailing Address */}
                <section>
                    <h2 className="text-lg text-white font-serif mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-teal-500 rounded"></span>
                        Mailing Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 md:col-span-2 relative">
                            <label className="text-xs text-slate-500 uppercase tracking-wider flex justify-between">
                                <span>Address Line 1</span>
                                <span className="text-[10px] text-teal-500/70">Powered by Google</span>
                            </label>
                            <Autocomplete
                                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                onPlaceSelected={handlePlaceSelected}
                                options={{ types: ['address'] }}
                                className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light"
                                name="addr_line1"
                                defaultValue={profile.address?.line1 || ''}
                                onChange={(e: any) => handleChange({ target: { name: 'addr_line1', value: e.target.value } } as any)}
                                placeholder="Start typing to search..."
                                ref={autocompleteRef as any}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Address Line 2 (Optional)</label>
                            <input type="text" name="addr_line2" value={profile.address?.line2 || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">City</label>
                            <input type="text" name="addr_city" value={profile.address?.city || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">State / Province</label>
                            <input type="text" name="addr_state" value={profile.address?.state || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Zip / Postal Code</label>
                            <input type="text" name="addr_zipCode" value={profile.address?.zipCode || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Country</label>
                            <input type="text" name="addr_country" value={profile.address?.country || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light" />
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
                                <input type="checkbox" name="pref_openToNewDeals" checked={profile.preferences?.openToNewDeals || false} onChange={handleChange} className="peer sr-only" />
                                <div className="w-5 h-5 border border-slate-600 rounded bg-slate-950 peer-checked:bg-teal-600 peer-checked:border-teal-500 transition-all"></div>
                                <Check size={14} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-sm text-slate-300 font-light group-hover:text-white transition-colors">I am open to seeing new investment opportunities</span>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Accredited Status</label>
                                <select name="pref_accreditedStatus" value={profile.preferences?.accreditedStatus || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light appearance-none">
                                    <option value="" disabled>Select Status...</option>
                                    <option value="Accredited">Accredited Investor</option>
                                    <option value="Non-Accredited">Non-Accredited</option>
                                    <option value="Pending Verification">Pending Verification</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Typical Check Size</label>
                                <select name="pref_checkSize" value={profile.preferences?.checkSize || ''} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded p-3 text-white focus:border-teal-500 focus:outline-none transition-colors font-light appearance-none">
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
                    <button type="submit" disabled={saving} className={`flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all ${saved ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-teal-700 hover:bg-teal-600 text-white'}`}>
                        {saved ? <><Check size={18} /> Saved Successfully</> : <><Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}</>}
                    </button>
                </div>
            </form>
            
            {/* Global CSS for PhoneInput to override defaults safely */}
            <style dangerouslySetInnerHTML={{__html: `
                .phone-input-custom input {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: white;
                    width: 100%;
                }
                .PhoneInputCountry {
                    margin-right: 12px;
                }
            `}} />
        </div>
    );
};

export default InvestorProfile;
