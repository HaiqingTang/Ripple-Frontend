import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  updateProfilePicture: (dataUri: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [fullName, setFullName] = useState<string>('User');
  const [userName, setUserName] = useState<string>('user');
	const [userId, setUserId] = useState<string>('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  const loadUserProfile = async (uid: string) => {
    try {
      // Query for document where userId field matches the Firebase Auth UID
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setProfilePictureUrl('');
        return;
      }

      if (querySnapshot.docs.length > 1) {
        console.warn('Multiple user documents found for userId:', uid);
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.profilePictureBase64 && typeof userData.profilePictureBase64 === 'string' && userData.profilePictureBase64.trim() !== '') {
        // Validate and convert Base64 data to data URI for display
        try {
          const dataUri = createDataUri(userData.profilePictureBase64);
          setProfilePictureUrl(dataUri);
        } catch (error) {
          console.error('Error creating data URI from base64:', error);
          setProfilePictureUrl('');
        }
      } else {
        // Clear profile picture if no Base64 data
        setProfilePictureUrl('');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfilePictureUrl('');
    }
  };

  const updateProfilePicture = (dataUri: string) => {
    try {
      // Accept data URI directly for immediate display
      if (dataUri && typeof dataUri === 'string' && dataUri.trim() !== '') {
        setProfilePictureUrl(dataUri);
      } else {
        console.error('Invalid data URI provided to updateProfilePicture');
        setProfilePictureUrl('');
      }

      // Note: The actual Firestore update is handled in imageService.ts
      // This function just updates the local state for immediate UI feedback
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setProfilePictureUrl('');
    }
  };

  const refreshUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const name = user.email?.split('@')[0] || 'user';
      setUserName(name);
      const userDisplayName = user.displayName || 'User';
      setFullName(userDisplayName);
      loadUserProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = user.email?.split('@')[0] || 'user';
        setUserName(name);
				const userDisplayName = user.displayName || 'User';
				setFullName(userDisplayName);
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


