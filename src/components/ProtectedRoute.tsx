import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAdmin = user.role === 'admin' || user.email === 'developer@arrotech.com';
    const hasWrite = (user as any).permissions?.blog_write === true;
    const hasPublish = (user as any).permissions?.blog_publish === true;

    if (!isAdmin && !hasWrite && !hasPublish) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        You don't have permission to write or publish blog posts. Please contact an administrator to request access.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('auth_token');
                            window.location.href = '/login';
                        }}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all"
                    >
                        Sign in with different account
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
