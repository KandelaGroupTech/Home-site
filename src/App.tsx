import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UpdatePassword from './pages/UpdatePassword';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';

const AuthListener: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/update-password');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return null;
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthListener />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
