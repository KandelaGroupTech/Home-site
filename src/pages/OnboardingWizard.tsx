import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserProfile, AccreditedStatus, CheckSize } from '../types';
import { Shield, ChevronRight, CheckCircle2 } from 'lucide-react';

const fieldClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light text-sm";

const OnboardingWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [ndaSignature, setNdaSignature] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const user = getAuth().currentUser;
            if (!user) {
                navigate('/login');
                return;
            }
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                if (data.onboardingCompleted) {
                    navigate('/dashboard'); // already onboarded
                } else {
                    setUserProfile({
                        ...data,
                        company: data.company || '',
                        phone: data.phone || '',
                        preferences: data.preferences || { openToNewDeals: false, accreditedStatus: '', checkSize: '' }
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [navigate]);

    const handleUpdateField = (field: string, value: any) => {
        if (!userProfile) return;
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setUserProfile({
                ...userProfile,
                [parent]: {
                    ...(userProfile as any)[parent],
                    [child]: value
                }
            });
        } else {
            setUserProfile({ ...userProfile, [field]: value });
        }
    };

    const handleNext = () => setStep(s => s + 1);

    const handleComplete = async () => {
        if (!userProfile) return;
        const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim().toLowerCase();
        if (ndaSignature.trim().toLowerCase() !== fullName) {
            alert("Your digital signature must exactly match your full name: " + fullName);
            return;
        }

        setSaving(true);
        try {
            const user = getAuth().currentUser;
            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    company: userProfile.company,
                    phone: userProfile.phone,
                    preferences: userProfile.preferences,
                    onboardingCompleted: true,
                    ndaSigned: true,
                    ndaSignedAt: new Date()
                });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error saving onboarding:", error);
            alert("There was an error saving your profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !userProfile) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-teal-600">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-900 rounded-2xl mb-6 shadow-xl">
                        <Shield className="text-teal-400" size={32} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-serif text-slate-800 mb-2">Welcome to The Kandela Group</h1>
                    <p className="text-slate-500 font-light">Let's get your investor profile set up before you access the platform.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-16 rounded-full transition-colors ${step >= i ? 'bg-teal-600' : 'bg-slate-200'}`} />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-8 md:p-10">
                    
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-serif text-slate-800 mb-1">Professional Details</h2>
                                <p className="text-sm text-slate-500 font-light mb-6">Tell us a bit about your professional background.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Company / Firm Name</label>
                                    <input 
                                        type="text" 
                                        className={fieldClass} 
                                        value={userProfile.company} 
                                        onChange={e => handleUpdateField('company', e.target.value)} 
                                        placeholder="Where do you work?"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        className={fieldClass} 
                                        value={userProfile.phone} 
                                        onChange={e => handleUpdateField('phone', e.target.value)} 
                                        placeholder="(555) 555-5555"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-6 flex justify-end">
                                <button 
                                    onClick={handleNext}
                                    className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-colors"
                                >
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-serif text-slate-800 mb-1">Investment Preferences</h2>
                                <p className="text-sm text-slate-500 font-light mb-6">This helps us tailor the deals and communications you see.</p>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Accreditation Status</label>
                                    <select 
                                        className={fieldClass}
                                        value={userProfile.preferences.accreditedStatus}
                                        onChange={e => handleUpdateField('preferences.accreditedStatus', e.target.value)}
                                    >
                                        <option value="" disabled>Select your status...</option>
                                        <option value="Accredited">Accredited Investor</option>
                                        <option value="Non-Accredited">Non-Accredited Investor</option>
                                        <option value="Pending Verification">Pending Verification</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Typical Check Size</label>
                                    <select 
                                        className={fieldClass}
                                        value={userProfile.preferences.checkSize}
                                        onChange={e => handleUpdateField('preferences.checkSize', e.target.value)}
                                    >
                                        <option value="" disabled>Select check size...</option>
                                        <option value="<$10,000">&lt;$10,000</option>
                                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                                        <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                                        <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                                        <option value="$100,000+">$100,000+</option>
                                    </select>
                                </div>
                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-teal-300 transition-colors">
                                    <input 
                                        type="checkbox"
                                        className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                        checked={userProfile.preferences.openToNewDeals}
                                        onChange={e => handleUpdateField('preferences.openToNewDeals', e.target.checked)}
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">I am actively looking for new deals.</p>
                                        <p className="text-xs text-slate-500 font-light mt-0.5">We will send you notifications when a new investment opportunity opens.</p>
                                    </div>
                                </label>
                            </div>
                            
                            <div className="pt-6 flex justify-between">
                                <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 text-sm hover:text-slate-800">Back</button>
                                <button 
                                    onClick={handleNext}
                                    className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-colors"
                                >
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-serif text-slate-800 mb-1">Confidentiality Agreement</h2>
                                <p className="text-sm text-slate-500 font-light mb-6">Please read and sign the standard Non-Disclosure Agreement.</p>
                            </div>
                            
                            <div className="h-64 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 font-light leading-relaxed mb-4">
                                <p className="font-semibold mb-2 text-slate-800">NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT</p>
                                <p className="mb-4">This Non-Disclosure and Confidentiality Agreement (the "Agreement") is entered into by and between The Kandela Group ("Disclosing Party") and the Investor ("Receiving Party").</p>
                                <p className="mb-4">1. <strong>Confidential Information.</strong> The Receiving Party understands that the Disclosing Party has disclosed or may disclose business, technical, or financial information relating to the Disclosing Party's business, plans, investment opportunities, or proprietary systems (hereinafter referred to as "Confidential Information").</p>
                                <p className="mb-4">2. <strong>Non-Use and Non-Disclosure.</strong> The Receiving Party agrees that at all times and notwithstanding any termination or expiration of this Agreement, it will hold in strict confidence and not disclose to any third party Confidential Information, except as approved in writing by the Disclosing Party, and will use the Confidential Information for no purpose other than evaluating potential investments.</p>
                                <p className="mb-4">3. <strong>Protection of Information.</strong> Documents and files (including Confidential Information Memorandums and financial statements) provided on this platform are for the sole use of the Receiving Party. The Receiving Party agrees not to distribute, copy, or share these documents. Select documents may be watermarked with the Receiving Party's identifying information to trace unauthorized distribution.</p>
                                <p>By typing your name below, you electronically sign and agree to be bound by the terms of this Agreement.</p>
                            </div>
                            
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Type your full name to sign: <span className="font-bold text-slate-800">{userProfile.firstName} {userProfile.lastName}</span></label>
                                <input 
                                    type="text" 
                                    className={fieldClass} 
                                    value={ndaSignature} 
                                    onChange={e => setNdaSignature(e.target.value)} 
                                    placeholder="Type your name..."
                                />
                            </div>
                            
                            <div className="pt-6 flex justify-between items-center">
                                <button onClick={() => setStep(2)} className="px-6 py-3 text-slate-500 text-sm hover:text-slate-800 disabled:opacity-50" disabled={saving}>Back</button>
                                <button 
                                    onClick={handleComplete}
                                    disabled={saving}
                                    className="bg-teal-700 text-white px-8 py-3 rounded-full text-sm font-semibold tracking-wider flex items-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : <><CheckCircle2 size={16} /> Complete Setup</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
