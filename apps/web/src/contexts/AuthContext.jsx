
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

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
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData.record;
  };

  const signup = async (userData) => {
    try {
      const createData = {
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.password,
        full_name: userData.full_name || userData.name || '',
        name: userData.name || userData.full_name || '',
        company_name: userData.company_name,
        vat_number: userData.vat_number || '',
        role: userData.role || 'Coordinator',
        language: userData.language || 'EN',
        plan: 'free',
        unsubscribeToken: crypto.randomUUID()
      };
      
      console.log('Sending registration data to PocketBase:', createData);
      
      const record = await pb.collection('users').create(createData, { $autoCancel: false });
      console.log('User created successfully:', record);

      const authData = await pb.collection('users').authWithPassword(userData.email, userData.password, { $autoCancel: false });
      setCurrentUser(authData.record);
      return authData.record;
    } catch (error) {
      console.error('=== POCKETBASE REGISTRATION ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('FULL PB ERROR:', error.response?.data);
      console.error('Error status:', error.status);
      console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
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
