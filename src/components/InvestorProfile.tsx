import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Save, Check, Key, ShieldAlert } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import Autocomplete from 'react-google-autocomplete';

interface Props {
    userUid: string;
    initialProfile: UserProfile | null;
}

const fieldClass = "w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light placeholder:text-slate-300 text-sm";
const labelClass = "text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block";

const InvestorProfile: React.FC<Props> = ({ userUid, initialProfile }) => {
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        firstName: '', lastName: '', phone: '', email: '', company: '',
        address: { line1: '', line2: '', city: '', state: '', zipCode: '', country: '' },
        preferences: { openToNewDeals: false, accreditedStatus: '', checkSize: '' }
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const autocompleteRef = useRef<any>(null);

    const handlePasswordReset = async () => {
        if (!profile.email) return;
        setResetLoading(true);
        setResetError(null);
        setResetSent(false);

        try {
            const actionCodeSettings = {
                url: `${window.location.origin}/update-password`,
                handleCodeInApp: true,
            };
            await sendPasswordResetEmail(auth, profile.email, actionCodeSettings);
            setResetSent(true);
            setTimeout(() => setResetSent(false), 5000);
        } catch (err: any) {
            console.error('Password reset request failed', err);
            setResetError(err.message || 'Failed to send password reset email. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    useEffect(() => {
        if (initialProfile) {
            if (typeof initialProfile.address === 'string') {
                setProfile({ ...initialProfile, address: { line1: initialProfile.address, line2: '', city: '', state: '', zipCode: '', country: '' } });
            } else if (initialProfile.address) {
                setProfile(initialProfile);
                if (autocompleteRef.current) autocompleteRef.current.value = initialProfile.address.line1 || '';
            } else {
                setProfile({ ...initialProfile, address: { line1: '', line2: '', city: '', state: '', zipCode: '', country: '' } });
            }
        }
    }, [initialProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name.startsWith('pref_')) {
            const prefName = name.replace('pref_', '');
            const prefValue: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
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
        let streetNumber = '', route = '', city = '', state = '', zipCode = '', country = '';
        place.address_components.forEach((c: any) => {
            if (c.types.includes('street_number')) streetNumber = c.long_name;
            if (c.types.includes('route')) route = c.long_name;
            if (c.types.includes('locality') || c.types.includes('sublocality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1')) state = c.short_name;
            if (c.types.includes('postal_code')) zipCode = c.long_name;
            if (c.types.includes('country')) country = c.long_name;
        });
        setProfile(prev => ({
            ...prev,
            address: { ...prev.address, line1: `${streetNumber} ${route}`.trim() || prev.address?.line1 || '', city, state, zipCode, country }
        } as Partial<UserProfile>));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, 'users', userUid), { ...profile, updatedAt: new Date() }, { merge: true });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving profile', error);
        } finally {
            setSaving(false);
        }
    };

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-base font-semibold text-slate-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-teal-600 rounded block" />
            {children}
        </h2>
    );

    return (
        <div className="max-w-4xl pb-20">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">My Profile</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Keep your contact information and investment preferences up to date.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Contact Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <SectionTitle>Contact Information</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input type="text" name="firstName" value={profile.firstName || ''} onChange={handleChange} className={fieldClass} placeholder="Jane" />
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input type="text" name="lastName" value={profile.lastName || ''} onChange={handleChange} className={fieldClass} placeholder="Smith" />
                        </div>
                        <div>
                            <label className={labelClass}>Company / Entity</label>
                            <input type="text" name="company" value={profile.company || ''} onChange={handleChange} className={fieldClass} placeholder="Smith Capital LLC" />
                        </div>
                        <div>
                            <label className={labelClass}>Phone</label>
                            <div className="bg-white border border-slate-200 rounded-lg px-3 h-[46px] flex items-center focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                                <PhoneInput
                                    international defaultCountry="US"
                                    value={profile.phone}
                                    onChange={val => setProfile(prev => ({ ...prev, phone: val as string }))}
                                    className="text-slate-800 font-light phone-input-light w-full text-sm"
                                    style={{ '--PhoneInputCountryFlag-borderColor': 'transparent', '--PhoneInputCountrySelectArrow-color': '#94a3b8' } as React.CSSProperties}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Email Address</label>
                            <input type="email" name="email" value={profile.email || ''} onChange={handleChange} className={fieldClass} placeholder="jane@smithcapital.com" />
                        </div>
                    </div>
                </div>

                {/* Mailing Address Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <SectionTitle>Mailing Address</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className={labelClass + ' flex justify-between'}>
                                <span>Address Line 1</span>
                                <span className="text-[10px] text-teal-600 normal-case tracking-normal">Powered by Google</span>
                            </label>
                            <Autocomplete
                                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                onPlaceSelected={handlePlaceSelected}
                                options={{ types: ['address'] }}
                                className={fieldClass}
                                name="addr_line1"
                                defaultValue={profile.address?.line1 || ''}
                                onChange={(e: any) => handleChange({ target: { name: 'addr_line1', value: e.target.value } } as any)}
                                placeholder="Start typing to search..."
                                ref={autocompleteRef as any}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Address Line 2 <span className="normal-case text-slate-400 tracking-normal">(Optional)</span></label>
                            <input type="text" name="addr_line2" value={profile.address?.line2 || ''} onChange={handleChange} className={fieldClass} placeholder="Apt, Suite, Unit..." />
                        </div>
                        <div>
                            <label className={labelClass}>City</label>
                            <input type="text" name="addr_city" value={profile.address?.city || ''} onChange={handleChange} className={fieldClass} />
                        </div>
                        <div>
                            <label className={labelClass}>State / Province</label>
                            <input type="text" name="addr_state" value={profile.address?.state || ''} onChange={handleChange} className={fieldClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Zip / Postal Code</label>
                            <input type="text" name="addr_zipCode" value={profile.address?.zipCode || ''} onChange={handleChange} className={fieldClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Country</label>
                            <input type="text" name="addr_country" value={profile.address?.country || ''} onChange={handleChange} className={fieldClass} />
                        </div>
                    </div>
                </div>

                {/* Investment Preferences Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <SectionTitle>Investment Preferences</SectionTitle>
                    <div className="space-y-5">
                        {/* Open to deals toggle */}
                        <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                            <div className="relative flex-shrink-0">
                                <input type="checkbox" name="pref_openToNewDeals" checked={profile.preferences?.openToNewDeals || false} onChange={handleChange} className="peer sr-only" />
                                <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-teal-600 transition-colors" />
                                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                            </div>
                            <div>
                                <p className="text-slate-700 font-medium text-sm">Open to New Deals</p>
                                <p className="text-slate-400 text-xs font-light mt-0.5">Receive invitations to new investment opportunities from The Kandela Group</p>
                            </div>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Accredited Investor Status</label>
                                <select name="pref_accreditedStatus" value={profile.preferences?.accreditedStatus || ''} onChange={handleChange} className={fieldClass + ' appearance-none'}>
                                    <option value="" disabled>Select Status...</option>
                                    <option value="Accredited">Accredited Investor</option>
                                    <option value="Non-Accredited">Non-Accredited</option>
                                    <option value="Pending Verification">Pending Verification</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Typical Check Size</label>
                                <select name="pref_checkSize" value={profile.preferences?.checkSize || ''} onChange={handleChange} className={fieldClass + ' appearance-none'}>
                                    <option value="" disabled>Select Range...</option>
                                    <option value="<$10,000">&lt; $10,000</option>
                                    <option value="$10,000 - $25,000">$10,000 – $25,000</option>
                                    <option value="$25,000 - $50,000">$25,000 – $50,000</option>
                                    <option value="$50,000 - $100,000">$50,000 – $100,000</option>
                                    <option value="$100,000+">$100,000+</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Security Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <SectionTitle>Security & Password</SectionTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-700 font-medium text-sm">Reset Password</p>
                            <p className="text-slate-400 text-xs font-light mt-0.5">We will send a secure password reset link to your registered email address ({profile.email})</p>
                        </div>
                        <button
                            type="button"
                            disabled={resetLoading}
                            onClick={handlePasswordReset}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 shadow-sm border ${
                                resetSent
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                            }`}
                        >
                            {resetSent ? (
                                <><Check size={16} /> Link Sent!</>
                            ) : (
                                <><Key size={16} /> {resetLoading ? 'Sending...' : 'Request Reset Link'}</>
                            )}
                        </button>
                    </div>
                    {resetError && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
                            <ShieldAlert size={16} className="shrink-0" />
                            {resetError}
                        </div>
                    )}
                </div>

                {/* Save */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-medium transition-all shadow-sm ${
                            saved
                                ? 'bg-green-50 text-green-700 border border-green-300'
                                : 'bg-teal-700 hover:bg-teal-600 text-white border border-teal-700'
                        }`}
                    >
                        {saved ? <><Check size={17} /> Saved</> : <><Save size={17} /> {saving ? 'Saving...' : 'Save Profile'}</>}
                    </button>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{__html: `
                .phone-input-light input {
                    background: transparent; border: none; outline: none;
                    color: #1e293b; width: 100%;
                }
                .phone-input-light .PhoneInputCountrySelect { color: #475569; }
                .PhoneInputCountry { margin-right: 8px; }
            `}} />
        </div>
    );
};

export default InvestorProfile;
