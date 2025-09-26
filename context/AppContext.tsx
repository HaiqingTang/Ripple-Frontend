import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createDataUri } from '@/lib/imageService';
import { auth, db } from '@/lib/firebase';

type AppContextValue = {
	userId: string;
  fullName: string;
	userName: string;
  dayOfWeek: string;
  formattedDate: string;
  profilePictureUrl: string;
  refreshUserData: () => void;
  updateProfilePicture: (url: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [fullName, setFullName] = useState<string>('User');
  const [userName, setUserName] = useState<string>('user');
	const [userId, setUserId] = useState<string>('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  const loadUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.profilePictureBase64) {
          // Convert Base64 data to data URI for display
          const dataUri = createDataUri(userData.profilePictureBase64);
          setProfilePictureUrl(dataUri);
        } else {
          // Clear profile picture if no Base64 data
          setProfilePictureUrl('');
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateProfilePicture = async (base64Data: string) => {
    try {
      // Convert Base64 data to data URI for immediate display
      const dataUri = createDataUri(base64Data);
      setProfilePictureUrl(dataUri);

      // Note: The actual Firestore update is handled in imageService.ts
      // This function just updates the local state for immediate UI feedback
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const refreshUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const name = user.email?.split('@')[0] || 'user';
      setUserName(name);
      const fullName = user.displayName || 'User';
      setFullName(fullName);
      loadUserProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = user.email?.split('@')[0] || 'user';
        setUserName(name);
				const fullName = user.displayName || 'User';
				setFullName(fullName);
				setUserId(user.uid);
        await loadUserProfile(user.uid);
      } else {
        setUserName('User');
        setFullName('User');
        setUserId('');
        setProfilePictureUrl('');
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
    () => ({ userId, userName, fullName, dayOfWeek, formattedDate, profilePictureUrl, refreshUserData, updateProfilePicture }),
    [userId, userName, fullName, dayOfWeek, formattedDate, profilePictureUrl]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};


