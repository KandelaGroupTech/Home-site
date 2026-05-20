import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const UpdatePassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validCode, setValidCode] = useState(false);
    const [oobCode, setOobCode] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Firebase adds actionCode (oobCode) as a query parameter
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('oobCode');
        
        if (!code) {
            setError("Invalid or missing password reset link.");
            return;
        }

        setOobCode(code);
        
        // Verify the code is valid
        verifyPasswordResetCode(auth, code)
            .then(() => setValidCode(true))
            .catch((err) => setError("Invalid or expired password reset link."));
    }, [location]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode) return;
        
        setLoading(true);
        setError(null);

        try {
            await confirmPasswordReset(auth, oobCode, password);
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/50 border border-white/10 p-8 rounded-lg backdrop-blur-sm">
                <h1 className="text-2xl font-serif text-white mb-6 text-center">Set New Password</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {validCode && (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white focus:border-[#006464] focus:outline-none transition-colors"
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#006464] hover:bg-[#007d7d] text-white py-2 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
                
                <div className="mt-4 text-center">
                    <a href="/login" className="text-xs text-slate-500 hover:text-white transition-colors">
                        ← Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
