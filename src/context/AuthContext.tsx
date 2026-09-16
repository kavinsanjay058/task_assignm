import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, testConnection } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Validate connection to Firestore on initialization
    testConnection().catch((err) => console.warn('Firestore test connection notice:', err));

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (authError) => {
        console.error('Auth state change error:', authError);
        setError(authError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      setError(
        'Firebase configuration is missing. Please provide your Firebase credentials in your environment variables (.env).'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-in error:', err);
      if (err instanceof Error) {
        // Human-friendly error parsing
        const msg = err.message || '';
        if (msg.includes('auth/popup-closed-by-user')) {
          setError('Sign-in was cancelled because the popup window was closed before completing authentication.');
        } else if (msg.includes('auth/popup-blocked')) {
          setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
        } else if (msg.includes('auth/configuration-not-found') || msg.includes('auth/operation-not-allowed')) {
          setError(
            'Google Sign-In is not yet enabled in your Firebase project. Please go to the Firebase Console > Authentication > Sign-in method, click "Google", toggle "Enable", select a support email, and click "Save".'
          );
        } else if (msg.includes('auth/unauthorized-domain')) {
          const currentHost = window.location.hostname;
          setError(
            `This domain (${currentHost}) is not authorized in Firebase. Please add "${currentHost}" in the Firebase Console under Authentication > Settings > Authorized Domains.`
          );
        } else if (msg.includes('auth/invalid-api-key') || msg.includes('auth/api-key-not-valid')) {
          setError('The Firebase API key is invalid. Please verify your VITE_FIREBASE_API_KEY setting.');
        } else {
          setError(msg);
        }
      } else {
        setError('An unexpected error occurred during sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err: unknown) {
      console.error('Sign-out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
