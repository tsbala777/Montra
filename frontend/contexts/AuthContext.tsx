
// React Context for Firebase Authentication

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    onAuthStateChange,
    AuthError
} from '../services/authService';
import { migrateLocalDataToFirestore, initializeUserDocument } from '../services/firestoreService';
import { UserSettings } from '../types';

// Default settings for new users
const DEFAULT_SETTINGS: UserSettings = {
    currency: '$',
    theme: 'vibrant',
    isDarkMode: false,
    profile: {
        name: '',
        email: '',
        phone: '',
        avatar: '',
        bio: ''
    }
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: AuthError | null;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            setUser(firebaseUser);

            // Initialize user document and migrate local data when user signs in
            if (firebaseUser) {
                // Execute initialization in background so we don't block the UI loading state
                initializeUserDocument(
                    firebaseUser.uid,
                    firebaseUser.email || '',
                    firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    DEFAULT_SETTINGS
                ).catch(err => {
                    console.error('User initialization error:', err);
                });

                // Migration is currently disabled in service but keeping the structure
                migrateLocalDataToFirestore(firebaseUser.uid).then(migrated => {
                    if (migrated) console.log('Local data migrated to Firestore');
                }).catch(console.error);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSignUp = async (email: string, password: string, name: string) => {
        setError(null);
        setLoading(true);
        try {
            await signUp(email, password, name);
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setError(null);
        try {
            await signOut();
            // Clear local storage on logout
            localStorage.removeItem('montra_auth');
            sessionStorage.removeItem('montra_auth');
        } catch (err: any) {
            setError(err);
            throw err;
        }
    };

    const handleResetPassword = async (email: string) => {
        setError(null);
        try {
            await resetPassword(email);
        } catch (err: any) {
            setError(err);
            throw err;
        }
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        loading,
        error,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
