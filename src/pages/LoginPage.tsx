import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setResetLoading(true);
        setError(null);

        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/50 border border-white/10 p-8 rounded-lg backdrop-blur-sm">
                <h1 className="text-2xl font-serif text-white mb-6 text-center">
                    {isForgotPassword ? (resetSent ? 'Link Sent' : 'Reset Password') : 'Investor Login'}
                </h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {isForgotPassword ? (
                    resetSent ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-12 h-12 rounded-full bg-[#006464]/10 border border-[#006464]/30 flex items-center justify-center mx-auto text-[#006464]">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed font-light">
                                We have sent a secure password reset link to <strong className="text-white">{email}</strong>. Please check your inbox.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                                className="w-full bg-[#006464] hover:bg-[#007d7d] text-white py-2 rounded transition-colors text-sm font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                                Enter your registered email address and we'll send you a secure link to reset your password.
                            </p>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-[#006464] focus:outline-none transition-colors text-sm font-light"
                                    required
                                    placeholder="email@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={resetLoading || !email}
                                className="w-full bg-[#006464] hover:bg-[#007d7d] text-white py-2 rounded transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                                {resetLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="w-full text-center text-xs text-slate-500 hover:text-white transition-colors pt-2 block"
                            >
                                Back to Login
                            </button>
                        </form>
                    )
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-[#006464] focus:outline-none transition-colors text-sm font-light"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm text-slate-400">Password</label>
                                <button
                                    type="button"
                                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                                    className="text-xs text-[#008f8f] hover:text-[#00c8c8] transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-[#006464] focus:outline-none transition-colors text-sm font-light"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#006464] hover:bg-[#007d7d] text-white py-2 rounded transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center border-t border-white/5 pt-4">
                    <a href="/" className="text-xs text-slate-500 hover:text-white transition-colors">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
