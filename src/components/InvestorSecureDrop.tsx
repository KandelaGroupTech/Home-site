import React, { useState } from 'react';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Upload, CheckCircle, Loader2, File } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
    userUid: string;
    profile: UserProfile | null;
}

const InvestorSecureDrop: React.FC<Props> = ({ userUid, profile }) => {
    const [file, setFile] = useState<File | null>(null);
    const [note, setNote] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSuccess(false);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file || !profile) return;
        setUploading(true);
        setError('');
        setSuccess(false);

        try {
            // Upload to storage
            const fileRef = ref(storage, `user_uploads/${userUid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            // Create record in Firestore
            await addDoc(collection(db, 'investor_uploads'), {
                investor_uid: userUid,
                investor_name: `${profile.firstName} ${profile.lastName}`,
                file_name: file.name,
                file_url: downloadUrl,
                note: note.trim() || null,
                created_at: serverTimestamp()
            });

            setSuccess(true);
            setFile(null);
            setNote('');
        } catch (err: any) {
            console.error('Error uploading file:', err);
            setError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Secure File Drop</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Securely send signed documents, wire receipts, or other sensitive files to The Kandela Group.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center max-w-xl">
                {success && (
                    <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-3 text-teal-800 text-left animate-in fade-in slide-in-from-top-2">
                        <CheckCircle className="text-teal-500 shrink-0" size={24} />
                        <div>
                            <p className="font-medium text-sm">Upload Successful</p>
                            <p className="text-xs text-teal-600 font-light mt-0.5">Your file has been securely submitted to the admin team.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors relative group">
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            {file ? <File size={32} /> : <Upload size={32} />}
                        </div>
                        
                        {file ? (
                            <>
                                <p className="text-slate-800 font-medium mb-1">{file.name}</p>
                                <p className="text-slate-400 text-xs font-light">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-800 font-medium mb-1">Click or drag a file to upload</p>
                                <p className="text-slate-400 text-xs font-light">Secure, encrypted transfer directly to our team</p>
                            </>
                        )}
                    </div>
                </div>

                {file && (
                    <>
                        <div className="mt-5 text-left animate-in fade-in duration-300">
                            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">Add a Note (Optional)</label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                disabled={uploading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all font-light text-sm placeholder:text-slate-300 resize-none h-24"
                                placeholder="Provide extra details or context about this file..."
                            />
                        </div>
                        <button 
                            onClick={handleUpload}
                            disabled={uploading}
                            className="mt-6 w-full bg-black text-white py-3 rounded-full font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
                        >
                            {uploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : 'Submit Document'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default InvestorSecureDrop;
