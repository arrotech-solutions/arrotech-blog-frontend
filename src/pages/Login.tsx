import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await apiService.login(email, password);
            if (res.success && res.data?.token) {
                await login(res.data.token);
                navigate('/');
            } else {
                setError(res.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="relative z-10 max-w-md w-full mx-4">
                <div className="glass p-10 sm:p-12 rounded-[2rem]">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Admin Portal
                        </h2>
                        <p className="mt-3 text-center text-slate-500 font-medium font-sans">
                            Manage Arrotech content and users
                        </p>
                    </div>

                    <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                {error}
                            </div>
                        )}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="block w-full px-5 py-3.5 bg-white/50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="developer@arrotech.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full px-5 py-3.5 bg-white/50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </div>
                                ) : 'Sign In to Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-xs font-medium mt-8 flex items-center justify-center gap-1">
                    Powered by Arrotech Hub Infrastructure
                </p>
            </div>
        </div>
    );
};

export default Login;
