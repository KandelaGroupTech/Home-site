import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthenticated(true);
                try {
                    const docSnap = await getDoc(doc(db, 'users', user.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.role !== 'admin' && !data.onboardingCompleted) {
                            setNeedsOnboarding(true);
                        }
                    }
                } catch (e) { console.error(e); }
            } else {
                setAuthenticated(false);
            }
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    if (needsOnboarding && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
