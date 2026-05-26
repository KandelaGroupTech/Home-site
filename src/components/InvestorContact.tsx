import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Send, Check, Upload, X, Paperclip, FileText, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Props {
    profile: UserProfile | null;
}

const InvestorContact: React.FC<Props> = ({ profile }) => {
    const [subject, setSubject] = useState('');
    const [comments, setComments] = useState('');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [files, setFiles] = useState<File[]>([]);
    
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError('');

        try {
            // Upload files to storage first
            const attachmentUrls: string[] = [];
            for (const file of files) {
                const fileRef = ref(storage, `contact_attachments/${profile?.firstName || 'User'}_${Date.now()}_${file.name}`);
                const snap = await uploadBytes(fileRef, file);
                const url = await getDownloadURL(snap.ref);
                attachmentUrls.push(`${file.name}: ${url}`);
            }

            let messageContent = `SUBJECT: ${subject}\n\nCOMMENTS:\n${comments}\n\nCALLBACK NUMBER: ${phone || 'Not provided'}`;
            if (attachmentUrls.length > 0) {
                messageContent += `\n\nATTACHMENTS:\n${attachmentUrls.join('\n')}`;
            }

            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    name: `${profile?.firstName} ${profile?.lastName}`,
                    email: profile?.email,
                    message: messageContent,
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
            
            setSent(true);
            setSubject('');
            setComments('');
            setFiles([]);
            setTimeout(() => setSent(false), 4000);
        } catch (err) {
            console.error(err);
            setError('There was a problem sending your message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const fieldClass = "w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all font-light text-sm";

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-8 bg-teal-600 rounded" />
                    <h1 className="text-3xl font-serif text-slate-800">Contact Us</h1>
                </div>
                <p className="text-slate-500 font-light pl-4">Get in touch with the Kandela Group investor relations team.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                {sent ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-6 border border-teal-100">
                            <Check size={32} className="text-teal-600" strokeWidth={1.5} />
                        </div>
                        <h2 className="font-serif text-2xl text-slate-800 mb-3">Message Sent</h2>
                        <p className="text-slate-500 font-light max-w-sm mx-auto">
                            Thank you for reaching out. A support representative will review your message and get back to you shortly.
                        </p>
                        <button 
                            onClick={() => setSent(false)}
                            className="mt-8 text-teal-600 text-sm font-medium hover:underline"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Subject</label>
                            <input 
                                type="text" 
                                required 
                                value={subject} 
                                onChange={e => setSubject(e.target.value)} 
                                className={fieldClass}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Comments</label>
                            <textarea 
                                required 
                                rows={8} 
                                value={comments} 
                                onChange={e => setComments(e.target.value)} 
                                className={fieldClass + " resize-none"}
                            />
                        </div>
                        
                        <div>
                            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                                Please leave your phone number if you wish to have a support representative call you back as soon as possible.
                            </p>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                            <input 
                                type="text" 
                                value={phone} 
                                onChange={e => setPhone(e.target.value)} 
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Attachments (Optional)</label>
                            <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-lg p-5 text-center hover:bg-slate-50 transition-all relative">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    disabled={sending}
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <Upload size={20} className="text-teal-600 mb-2" />
                                    <p className="text-slate-600 font-medium text-xs">Drag & drop or click to attach files</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, XLSX, Images up to 20MB</p>
                                </div>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-3 pr-1.5 py-1 rounded-md text-xs">
                                            <Paperclip size={12} className="text-teal-600" />
                                            <span className="text-slate-600 font-medium max-w-[150px] truncate">{file.name}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => removeFile(i)}
                                                className="p-1 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                disabled={sending}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 pt-6 border-t border-slate-100 bg-yellow-50/0">
                            <button 
                                type="button" 
                                onClick={() => { setSubject(''); setComments(''); setFiles([]); }}
                                className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
                                disabled={sending}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={sending || !subject || !comments}
                                className="px-6 py-2.5 bg-slate-300 text-slate-600 disabled:opacity-50 hover:bg-teal-700 hover:text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Submit'}
                            </button>
                            {!sending && <span className="ml-auto text-xs text-slate-400">Not saved.</span>}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InvestorContact;
