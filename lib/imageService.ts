import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { checkUploadAllowed, incrementUploadCount } from './uploadLimiter';

export interface ImagePickerResult {
  success: boolean;
  imageUri?: string;
  base64?: string;
  error?: string;
  canceled?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  base64Data?: string;
  error?: string;
}

const MAX_BASE64_BYTES = 700 * 1024; // ~700KB to account for Base64 overhead and stay under 1MB Firestore limit

// Helper function to find user document by userId field
const findUserDocument = async (userId: string): Promise<string | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    if (querySnapshot.docs.length > 1) {
      console.warn('Multiple user documents found for userId:', userId);
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Error finding user document:', error);
    return null;
  }
};



export const pickImageFromGallery = async (): Promise<ImagePickerResult> => {
  try {
    // Check media library permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Media library permission is required to select photos' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6, // Aggressive compression to reduce file size
      base64: true,
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const imageUri = result.assets[0].uri;
    const base64Data = result.assets[0].base64;

    return {
      success: true,
      imageUri,
      base64: base64Data || undefined
    };
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return { success: false, error: 'Failed to pick image from gallery' };
  }
};

export const takePicture = async (): Promise<ImagePickerResult> => {
  try {
    // Check camera permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Camera permission is required to take photos' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6, // Aggressive compression to reduce file size
      base64: true,
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const imageUri = result.assets[0].uri;
    const base64Data = result.assets[0].base64;

    return {
      success: true,
      imageUri,
      base64: base64Data || undefined
    };
  } catch (error) {
    console.error('Error taking picture:', error);
    return { success: false, error: 'Failed to take picture' };
  }
};



const validateBase64Size = (base64String: string): { isValid: boolean; error?: string } => {
  const sizeInBytes = (base64String.length * 3) / 4;
  if (sizeInBytes > MAX_BASE64_BYTES) {
    return {
      isValid: false,
      error: 'Image is too large. Please choose a smaller image or reduce quality.',
    };
  }
  return { isValid: true };
};

export const uploadProfilePicture = async (
  base64Data: string
): Promise<ImageUploadResult> => {
  try {
    // Check upload rate limit first
    const limitStatus = await checkUploadAllowed();
    if (!limitStatus.allowed) {
      return { success: false, error: limitStatus.error };
    }

    // Validate input parameters
    if (!base64Data || typeof base64Data !== 'string' || base64Data.trim() === '') {
      return { success: false, error: 'Invalid image data provided' };
    }

    if (!auth.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Use the actual authenticated user ID
    const authenticatedUserId = auth.currentUser.uid;

    // Validate the authenticated user ID
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      return { success: false, error: 'Invalid user authentication' };
    }

    // Validate Base64 size before processing
    const sizeValidation = validateBase64Size(base64Data);
    if (!sizeValidation.isValid) {
      return { success: false, error: sizeValidation.error };
    }

    // Find the actual document ID for this user
    const documentId = await findUserDocument(authenticatedUserId);
    if (!documentId) {
      return { success: false, error: 'User profile not found. Please contact support.' };
    }

    // Save Base64 data to the correct user document
    const userDocRef = doc(db, 'users', documentId);
    await setDoc(
      userDocRef,
      {
        profilePictureBase64: base64Data,
        profilePictureUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Increment upload count only after successful upload
    await incrementUploadCount();

    return { success: true, base64Data };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: 'Failed to save image. Please try again.' };
  }
};

export const deleteProfilePicture = async (): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      return false;
    }

    // Use the actual authenticated user ID instead of the passed parameter
    const authenticatedUserId = auth.currentUser.uid;

    // Validate the authenticated user ID
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      return false;
    }

    // Find the actual document ID for this user
    const documentId = await findUserDocument(authenticatedUserId);
    if (!documentId) {
      return false;
    }

    // Remove Base64 data from the correct user document
    const userDocRef = doc(db, 'users', documentId);
    await setDoc(
      userDocRef,
      {
        profilePictureBase64: null,
        profilePictureUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};

/**
 * Creates a data URI from a base64 string.
 *
 * @param base64String - Pure base64 string WITHOUT data URI prefix
 *                       (e.g., "/9j/4AAQSkZJRg..." not "data:image/jpeg;base64,...")
 * @returns Complete data URI string ready for Image component
 *
 * Note: Both 'journalPhoto' and 'imageBase64' fields in Firestore store pure base64.
 * Legacy logs may have 'imageBase64', newer ones use 'journalPhoto'.
 * This function handles both cases gracefully.
 */
export const createDataUri = (base64String: string): string => {
  // Handle case where data URI prefix is already present
  if (base64String?.startsWith('data:')) {
    return base64String;
  }
  return `data:image/jpeg;base64,${base64String}`;
};

export const validateImageFile = (fileSizeInBytes: number): { isValid: boolean; error?: string } => {
  if (fileSizeInBytes > MAX_BASE64_BYTES) {
    return { isValid: false, error: 'Image file too large. Please choose a smaller image.' };
  }
  return { isValid: true };
};

// Journal Image Functions
export const pickJournalImageFromGallery = async (): Promise<ImagePickerResult> => {
  try {
    // Check media library permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Media library permission is required to select photos' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6, // Aggressive compression to reduce file size
      base64: true,
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const imageUri = result.assets[0].uri;
    const base64Data = result.assets[0].base64;

    return {
      success: true,
      imageUri,
      base64: base64Data || undefined
    };
  } catch (error) {
    console.error('Error picking journal image from gallery:', error);
    return { success: false, error: 'Failed to pick image from gallery' };
  }
};

export const takeJournalPicture = async (): Promise<ImagePickerResult> => {
  try {
    // Check camera permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Camera permission is required to take photos' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6, // Aggressive compression to reduce file size
      base64: true,
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const imageUri = result.assets[0].uri;
    const base64Data = result.assets[0].base64;

    return {
      success: true,
      imageUri,
      base64: base64Data || undefined
    };
  } catch (error) {
    console.error('Error taking journal picture:', error);
    return { success: false, error: 'Failed to take picture' };
  }
};