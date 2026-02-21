import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, type User } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const res = await apiService.getCurrentUser();
                    if (res.success && res.data) {
                        setUser(res.data);
                    } else {
                        localStorage.removeItem('auth_token');
                    }
                } catch (error) {
                    console.error('Auth verification failed', error);
                    localStorage.removeItem('auth_token');
                }
            }
            setLoading(false);
        };

        checkAuth();

        const handleUnauthorized = () => {
            setUser(null);
        };
        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('auth_token', token);
        try {
            const res = await apiService.getCurrentUser();
            if (res.success && res.data) {
                setUser(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch user data after login', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
