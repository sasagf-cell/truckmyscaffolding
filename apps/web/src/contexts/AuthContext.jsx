
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        // Set cached model immediately so UI isn't blank
        setCurrentUser(pb.authStore.model);
        try {
          // Refresh from PocketBase to get fresh record with all fields (role, plan, etc.)
          const authData = await pb.collection('users').authRefresh({ $autoCancel: false });
          setCurrentUser(authData.record);
        } catch (err) {
          // Only force logout on explicit auth errors (401), not network failures
          if (err?.status === 401 || err?.status === 403) {
            pb.authStore.clear();
            setCurrentUser(null);
          }
          // Otherwise keep existing cached user — refresh will succeed next time
        }
      }
      setInitialLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData.record;
  };

  const signup = async (userData) => {
    // Register via Railway API — creates user with verified:false, sends verification email
    const res = await apiServerClient.fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name || userData.name || '',
        company_name: userData.company_name || '',
        vat_number: userData.vat_number || '',
        role: userData.role || 'Coordinator',
        language: userData.language || 'en',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Return signal that verification email was sent (no auto-login)
    return { emailVerificationSent: true };
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email) => {
    await pb.collection('users').requestPasswordReset(email, { $autoCancel: false });
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm, { $autoCancel: false });
  };

  const value = {
    currentUser,
    initialLoading,
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
