import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AppContextValue = {
	userId: string;
  fullName: string;
	userName: string;
  dayOfWeek: string;
  formattedDate: string;
  refreshUserData: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [fullName, setFullName] = useState<string>('User');
  const [userName, setUserName] = useState<string>('user');
	const [userId, setUserId] = useState<string>('');

  const refreshUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const name = user.email?.split('@')[0] || 'user';
      setUserName(name);
      const fullName = user.displayName || 'User';
      setFullName(fullName);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.email?.split('@')[0] || 'user';
        setUserName(name);
				const fullName = user.displayName || 'User';
				setFullName(fullName);
				setUserId(user.uid);
      } else {
        setUserName('User');
        setFullName('User');
      }

    });
    return () => unsub();
  }, []);

  const dayOfWeek = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    []
  );
  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
    []
  );

  const value = useMemo(
    () => ({ userId, userName, fullName, dayOfWeek, formattedDate,refreshUserData }),
    [userId, userName, fullName, dayOfWeek, formattedDate]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};


